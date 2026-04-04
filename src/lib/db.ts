// Simple localStorage-based database for DCC Labo
// No external dependencies needed

const DB_KEY = "dcc_db";

// Initialize database tables in localStorage
export function initializeDatabase(): void {
  const db = getDb();
  
  // Create tables if they don't exist
  const tables = [
    "profiles", "historique", "utilisateur", "organisme", "laboratoire", 
    "echantillon", "laboriste", "diplome", "obtenir", 
    "processus_analyse", "equipement", "effectuer_analyse", 
    "etalonnage", "effectuer_etalonnage", "norme", "resultat", "comparer_norme"
  ];

  tables.forEach(table => {
    if (!db[table]) db[table] = [];
  });
  
  saveDatabase(db);
  console.log("Database initialized successfully");
}

// Get database from localStorage
export function getDb(): any {
  if (typeof window === "undefined") return {};
  const stored = localStorage.getItem(DB_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return {};
}

// Save database to localStorage
export function saveDatabase(db: any): void {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

// Profile functions
export function getProfile(id: string): any {
  const db = getDb();
  return db.profiles?.find((p: any) => p.id === id) || null;
}

export function upsertProfile(id: string, nom: string, ipAddress?: string): void {
  const db = getDb();
  db.profiles = db.profiles || [];
  const idx = db.profiles.findIndex((p: any) => p.id === id);
  const data = { id, nom, ip_address: ipAddress || null, updated_at: new Date().toISOString() };
  
  if (idx !== -1) {
    db.profiles[idx] = { ...db.profiles[idx], ...data };
  } else {
    db.profiles.push(data);
  }
  saveDatabase(db);
}

// Historique functions
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
  const db = getDb();
  db.historique = db.historique || [];
  db.historique.push({
    id_historique: Date.now(),
    user_id: userId,
    action,
    date_action: dateAction,
    adresse_ip: adresseIp,
    nom_connexion: nomConnexion,
    message,
    is_alert: isAlert ? 1 : 0
  });
  saveDatabase(db);
}

export function getHistorique(): any[] {
  const db = getDb();
  return (db.historique || []).sort((a: any, b: any) => 
    new Date(b.date_action).getTime() - new Date(a.date_action).getTime()
  );
}

// Generic CRUD functions
export function getAll(table: string): any[] {
  const db = getDb();
  return db[table] || [];
}

export function insert(table: string, data: Record<string, any>, pkField: string = "id"): void {
  const db = getDb();
  db[table] = db[table] || [];
  
  // Auto-increment logic
  const maxId = db[table].reduce((max: number, item: any) => Math.max(max, parseInt(item[pkField]) || 0), 0);
  
  const newRecord = {
    ...data,
    [pkField]: maxId + 1,
    created_at: new Date().toISOString()
  };
  
  db[table].push(newRecord);
  saveDatabase(db);
}

export function updateRecord(table: string, pkField: string, pkValue: any, data: Record<string, any>): void {
  const db = getDb();
  const idx = db[table]?.findIndex((item: any) => String(item[pkField]) === String(pkValue));
  if (idx !== -1 && idx !== undefined) {
    db[table][idx] = { ...db[table][idx], ...data };
    saveDatabase(db);
  }
}

export function removeRecord(table: string, pkField: string, pkValue: any): void {
  const db = getDb();
  db[table] = (db[table] || []).filter((item: any) => String(item[pkField]) !== String(pkValue));
  saveDatabase(db);
}

// Initialize on module load
if (typeof window !== "undefined") {
  initializeDatabase();
}
