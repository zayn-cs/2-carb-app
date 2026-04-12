import { initialData } from "./initialData";
import { entities } from "./entityConfig";

const DB_KEY = "dcc_app_db_v2";

// Initialize the database in memory
let dbStore: Record<string, any[]> = {};

const BACKEND_URL = "http://localhost:3001/api";

let isInitialized = false;

export async function initSqlDatabase(force: boolean = false): Promise<void> {
  if (isInitialized && !force) return;

  const saved = localStorage.getItem(DB_KEY);
  if (saved) {
    try {
      dbStore = JSON.parse(saved);
      console.log("Database loaded from localStorage");
    } catch (e) {
      console.error("Failed to parse database, resetting", e);
      dbStore = {};
    }
  } else {
    dbStore = {};
  }

  console.log("Syncing with PostgreSQL...");
  const syncedTables = new Set<string>();

  // Fetch from Express Postgres Backend for ALL tables to act as Source of Truth
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout to avoid infinite loading
    
    // Attempt parallel fetch of all tables mapped in entityConfig + historique
    const tableNames = [...entities.map(e => e.table), 'historique'];
    
    const fetchPromises = tableNames.map(async (table) => {
      try {
        const res = await fetch(`${BACKEND_URL}/${table}`, { signal: controller.signal });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            dbStore[table] = data; // Directly fill from backend
            syncedTables.add(table);
          }
        } else {
           console.warn(`Backend returned ${res.status} for table: ${table}`);
        }
      } catch (err) {
        console.error(`Fetch failed for table ${table}:`, err);
      }
    });

    await Promise.all(fetchPromises);
    clearTimeout(timeoutId);
    console.log(`Initial tables synced from PostgreSQL! (${syncedTables.size}/${tableNames.length} tables)`);
    isInitialized = true;
  } catch(err) {
    console.error("Critical network error or timeout syncing from Postgres", err);
  }

  // Fallback to initialData ONLY for tables that didn't sync AND are empty
  Object.keys(initialData).forEach(table => {
    // If table wasn't synced from Postgres AND it doesn't have any data yet
    if (!syncedTables.has(table)) {
      if (!dbStore[table] || dbStore[table].length === 0) {
        console.log(`Using demo data for table: ${table} (Sync failed or database empty)`);
        dbStore[table] = initialData[table];
      }
    }
  });

  // Final check: ensure every config table is at least an empty array
  // Final check: ensure every config table is at least an empty array
  entities.forEach(entity => {
    if (!dbStore[entity.table]) {
      dbStore[entity.table] = [];
    }
  });

  // Special case: If utilisateur is empty (even after sync), add the default admin to prevent lockout
  if (!dbStore["utilisateur"] || dbStore["utilisateur"].length === 0) {
    console.log("Adding default admin user (DB empty)");
    dbStore["utilisateur"] = initialData.utilisateur;
  }

  saveDb();
  console.log("Database initialized (JSON method)");
  return Promise.resolve();
}

export function saveDb(): void {
  localStorage.setItem(DB_KEY, JSON.stringify(dbStore));
}

export function getAll(table: string): any[] {
  return dbStore[table] || [];
}

export function query(sql: string, params: any[] = []): any[] {
  // Mock query for historical reasons, but we work with JSON
  console.warn("SQL Query called in JSON mode, ignoring SQL and returning table data if possible");
  const tableName = sql.match(/FROM\s+(\w+)/i)?.[1];
  if (tableName) return getAll(tableName);
  return [];
}

export function getOne(table: string, field: string, value: any): any | null {
  const items = getAll(table);
  return items.find(item => String(item[field]) === String(value)) || null;
}

export function insert(table: string, data: Record<string, any>): void {
  if (!dbStore[table]) dbStore[table] = [];
  
  // Handle auto-increment if possible
  const config = entities.find(e => e.table === table);
  if (config) {
    const pkField = config.fields.find(f => f.isPrimaryKey);
    if (pkField && pkField.autoIncrement && !data[pkField.name]) {
      const maxId = dbStore[table].reduce((max, item) => Math.max(max, Number(item[pkField.name] || 0)), 0);
      data[pkField.name] = maxId + 1;
    }
  }

  dbStore[table].push(data);
  saveDb();

  // Sync to PostgreSQL backend
  fetch(`${BACKEND_URL}/${table}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  }).catch(err => console.error("Error syncing insert", err));
}

export function updateRecord(table: string, pkField: string, pkValue: any, data: Record<string, any>): void {
  if (!dbStore[table]) return;
  const index = dbStore[table].findIndex(item => String(item[pkField]) === String(pkValue));
  if (index !== -1) {
    dbStore[table][index] = { ...dbStore[table][index], ...data };
    saveDb();

    // Sync to PostgreSQL backend
    fetch(`${BACKEND_URL}/${table}/${pkField}/${pkValue}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).catch(err => console.error("Error syncing update", err));
  }
}

export function removeRecord(table: string, pkField: string, pkValue: any): void {
  if (!dbStore[table]) return;
  dbStore[table] = dbStore[table].filter(item => String(item[pkField]) !== String(pkValue));
  saveDb();

  // Sync to PostgreSQL backend
  fetch(`${BACKEND_URL}/${table}/${pkField}/${pkValue}`, {
    method: "DELETE"
  }).catch(err => console.error("Error syncing delete", err));
}

export function addHistoriqueEntry(
  userId: string | null,
  action: string,
  dateAction: string,
  adresseIp: string,
  nomConnexion: string,
  succes: boolean,
  message: string,
  isAlert: boolean = false
): void {
  const entry = {
    id_historique: Date.now(),
    user_id: userId,
    action,
    date_action: dateAction,
    adresse_ip: adresseIp,
    nom_connexion: nomConnexion,
    message,
    is_alert: isAlert ? 1 : 0
  };
  insert("historique", entry);
}

export function getHistorique(): any[] {
  return [...getAll("historique")].sort((a, b) => 
    new Date(b.date_action).getTime() - new Date(a.date_action).getTime()
  );
}

export function resetDatabase(): void {
  localStorage.removeItem(DB_KEY);
  window.location.reload();
}

export function exportDb(): void {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dbStore, null, 2));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", "labo_backup.json");
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

export async function importDb(file: File): Promise<void> {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target?.result as string);
      dbStore = data;
      saveDb();
      window.location.reload();
    } catch (err) {
      alert("Fichier invalide");
    }
  };
  reader.readAsText(file);
}

// Keep the same export name as requested by components
export { dbStore as sqliteDb };