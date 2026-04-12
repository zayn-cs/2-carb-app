import express from 'express';
import cors from 'cors';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Set up connection to local PostgreSQL
const pool = new pg.Pool({
  user: process.env.PG_USER || 'postgres',
  host: process.env.PG_HOST || 'localhost',
  database: process.env.PG_DATABASE || 'postgres',
  password: process.env.PG_PASSWORD || 'your_postgres_password',
  port: process.env.PG_PORT || 5432,
});

// GET all rows from any table
app.get('/api/:table', async (req, res) => {
  const { table } = req.params;
  console.log(`[GET] 📥 Syncing data for: ${table}`);
  try {
    // VERY basic validation to avoid sql injection
    if (!/^[a-zA-Z0-9_]+$/.test(table)) throw new Error("Invalid table name");
    
    const result = await pool.query(`SELECT * FROM ${table}`);
    res.json(result.rows);
  } catch (err) {
    // 42P01 is the PostgreSQL error code for "relation (table) does not exist"
    if (err.code === '42P01') {
      console.warn(`[WARNING] Table "${table}" does not exist in local DB yet.`);
      return res.json([]); // Return empty list so app falls back to demo data instead of crashing
    }
    console.error(`[ERROR] Table: ${table}`, err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST insert into any table
app.post('/api/:table', async (req, res) => {
  const { table } = req.params;
  console.log(`[POST] 📤 Adding new row to: ${table}`);
  try {
    if (!/^[a-zA-Z0-9_]+$/.test(table)) throw new Error("Invalid table name");
    
    const keys = Object.keys(req.body);
    const values = Object.values(req.body);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
    
    const result = await pool.query(
      `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`,
      values
    );
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === '42P01') {
      console.error(`[CRITICAL] Cannot save data! Table "${table}" does not exist in your PostgreSQL yet. You MUST run the SQL script in pgAdmin.`);
      return res.status(400).json({ error: `Table "${table}" missing. Did you run the SQL script in pgAdmin?` });
    }
    console.error(`[ERROR] Failed to insert into ${table}:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

// PUT update any table
app.put('/api/:table/:pkField/:pkValue', async (req, res) => {
  try {
    const { table, pkField, pkValue } = req.params;
    if (!/^[a-zA-Z0-9_]+$/.test(table)) throw new Error("Invalid table name");
    if (!/^[a-zA-Z0-9_]+$/.test(pkField)) throw new Error("Invalid field name");

    const keys = Object.keys(req.body);
    const values = Object.values(req.body);
    
    const setQuery = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
    values.push(pkValue); // Add the ID at the end for the WHERE clause
    
    const result = await pool.query(
      `UPDATE ${table} SET ${setQuery} WHERE ${pkField} = $${values.length} RETURNING *`,
      values
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE from any table
app.delete('/api/:table/:pkField/:pkValue', async (req, res) => {
  try {
    const { table, pkField, pkValue } = req.params;
    if (!/^[a-zA-Z0-9_]+$/.test(table)) throw new Error("Invalid table name");
    if (!/^[a-zA-Z0-9_]+$/.test(pkField)) throw new Error("Invalid field name");

    const result = await pool.query(
      `DELETE FROM ${table} WHERE ${pkField} = $1 RETURNING *`,
      [pkValue]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Backend Express Server running on http://localhost:${PORT}`);
  console.log(`Make sure your local PostgreSQL is running and your .env or server.js has the right password!`);
});
