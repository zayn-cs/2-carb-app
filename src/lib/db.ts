// Simple localStorage-based database for DCC Center
// No external dependencies needed

const DB_KEY = "dcc_db";

// Initialize database tables in localStorage
export function initializeDatabase(): void {
  const db = getDb();
  
  // Create tables if they don't exist
  if (!db.profiles) {
    db.profiles = [];
  }
  if (!db.historique) {
    db.historique = [];
  }
  if (!db.echantillon) {
    db.echantillon = [];
  }
  if (!db.laboratoire) {
    db.laboratoire = [];
  }
  if (!db.laboriste) {
    db.laboriste = [];
  }
  if (!db.processus_analyse) {
    db.processus_analyse = [];
  }
  if (!db.resultat) {
    db.resultat = [];
  }
  if (!db.norme) {
    db.norme = [];
  }
  if (!db.organisme) {
    db.organisme = [];
  }
  if (!db.diplome) {
    db.diplome = [];
  }
  
  saveDatabase(db);
  console.log("Database initialized successfully");
}

// Get database from localStorage
export function getDb(): any {
  const stored = localStorage.getItem(DB_KEY);
  if (stored) {
    const db = JSON.parse(stored);
    console.log("Database loaded, keys:", Object.keys(db));
    return db;
  }
  console.log("No database found, creating new one");
  return {};
}

// Save database to localStorage
export function saveDatabase(db: any): void {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
  console.log("Database saved, historique count:", (db.historique || []).length);
}

// Profile functions
export function getProfile(id: string): any {
  const db = getDb();
  return db.profiles?.find((p: any) => p.id === id) || null;
}

export function createProfile(id: string, nom: string, ipAddress?: string): void {
  const db = getDb();
  db.profiles = db.profiles || [];
  db.profiles.push({
    id,
    nom,
    ip_address: ipAddress || null,
    created_at: new Date().toISOString()
  });
  saveDatabase(db);
}

export function updateProfileIpAddress(id: string, ipAddress: string): void {
  const db = getDb();
  const profile = db.profiles?.find((p: any) => p.id === id);
  if (profile) {
    profile.ip_address = ipAddress;
    saveDatabase(db);
  }
}

export function upsertProfile(id: string, nom: string, ipAddress?: string): void {
  const existing = getProfile(id);
  if (existing) {
    const db = getDb();
    const idx = db.profiles.findIndex((p: any) => p.id === id);
    if (idx !== -1) {
      db.profiles[idx] = { ...db.profiles[idx], nom, ip_address: ipAddress || null };
      saveDatabase(db);
    }
  } else {
    createProfile(id, nom, ipAddress);
  }
}

// Historique functions
export function addHistoriqueEntry(
  userId: string | null,
  action: string,
  dateAction: string,
  adresseIp: string,
  email: string,
  succes: boolean,
  message: string,
  isAlert: boolean = false
): void {
  const db = getDb();
  db.historique = db.historique || [];
  db.historique.push({
    id: Date.now(),
    user_id: userId,
    action,
    date_action: dateAction,
    adresse_ip: adresseIp,
    email,
    succes: succes ? 1 : 0,
    message,
    is_alert: isAlert ? 1 : 0
  });
  console.log("Added historique entry, total entries:", db.historique.length);
  saveDatabase(db);
}

export function getHistorique(): any[] {
  const db = getDb();
  const historique = db.historique || [];
  console.log("Getting historique, found entries:", historique.length);
  
  // Sort by date_action descending (newest first)
  return historique.sort((a: any, b: any) => 
    new Date(b.date_action).getTime() - new Date(a.date_action).getTime()
  );
}

export function getHistoriqueByUser(userId: string): any[] {
  const db = getDb();
  return (db.historique || []).filter((h: any) => h.user_id === userId).sort((a: any, b: any) => 
    new Date(b.date_action).getTime() - new Date(a.date_action).getTime()
  );
}

// Generic CRUD functions
export function getAll(table: string): any[] {
  const db = getDb();
  return db[table] || [];
}

export function getById(table: string, id: number): any {
  const db = getDb();
  return db[table]?.find((item: any) => item.id === id) || null;
}

export function insert(table: string, data: Record<string, any>): void {
  const db = getDb();
  db[table] = db[table] || [];
  
  // Get max id
  const maxId = db[table].reduce((max: number, item: any) => Math.max(max, item.id || 0), 0);
  
  db[table].push({
    ...data,
    id: maxId + 1,
    created_at: new Date().toISOString()
  });
  saveDatabase(db);
}

export function updateRecord(table: string, id: number, data: Record<string, any>): void {
  const db = getDb();
  const idx = db[table]?.findIndex((item: any) => item.id === id);
  if (idx !== -1 && idx !== undefined) {
    db[table][idx] = { ...db[table][idx], ...data };
    saveDatabase(db);
  }
}

export function removeRecord(table: string, id: number): void {
  const db = getDb();
  db[table] = (db[table] || []).filter((item: any) => item.id !== id);
  saveDatabase(db);
}

// Initialize on module load
if (typeof window !== "undefined") {
  initializeDatabase();
}
