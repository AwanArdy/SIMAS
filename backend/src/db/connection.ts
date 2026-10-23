import Database from 'better-sqlite3';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

// mengambil path file SQLITE dari env variables 
const dbPath = process.env.DATABASE_PATH || './data/database.sqlite';

// memastikan folder direktori data tersedia sebelum membuat file database
const dir = path.dirname(dbPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

// Inisiasi koneksi ke database
const db = new Database(dbPath, {
  verbose: process.env.NODE_ENV || 'development' ? console.log : undefined
});

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export default db;
