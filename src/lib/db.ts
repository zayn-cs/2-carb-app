import { initialData } from "./initialData";
import { entities } from "./entityConfig";

const DB_KEY = "dcc_app_db_v2";

// Initialize the database in memory
let dbStore: Record<string, any[]> = {};

export async function initSqlDatabase(): Promise<void> {
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

  // Ensure all tables exist and are seeded if empty
  Object.keys(initialData).forEach(table => {
    if (!dbStore[table] || dbStore[table].length === 0) {
      dbStore[table] = initialData[table];
    } else if (table === "utilisateur") {
      // Special case: sync users from initialData so code changes are reflected
      initialData.utilisateur.forEach(u => {
        const idx = dbStore[table].findIndex(exist => exist.id_user === u.id_user);
        if (idx === -1) {
          dbStore[table].push(u);
        } else {
          dbStore[table][idx] = { ...dbStore[table][idx], ...u };
        }
      });
    }
  });

  // Ensure all entities defined in config exist in the store
  entities.forEach(entity => {
    if (!dbStore[entity.table]) {
      dbStore[entity.table] = [];
    }
  });

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
}

export function updateRecord(table: string, pkField: string, pkValue: any, data: Record<string, any>): void {
  if (!dbStore[table]) return;
  const index = dbStore[table].findIndex(item => String(item[pkField]) === String(pkValue));
  if (index !== -1) {
    dbStore[table][index] = { ...dbStore[table][index], ...data };
    saveDb();
  }
}

export function removeRecord(table: string, pkField: string, pkValue: any): void {
  if (!dbStore[table]) return;
  dbStore[table] = dbStore[table].filter(item => String(item[pkField]) !== String(pkValue));
  saveDb();
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