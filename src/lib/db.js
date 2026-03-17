import Database from 'better-sqlite3';
import path from 'path';

// Create a connection to the database
const dbPath = path.resolve(process.cwd(), 'data.db');
const db = new Database(dbPath, { verbose: console.log });
db.pragma('journal_mode = WAL');

// Initialize tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS boards (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    bg_color TEXT DEFAULT 'bg-shade-5',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS items (
    id TEXT PRIMARY KEY,
    board_id TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('image', 'video', 'note')),
    url TEXT,
    text TEXT,
    x REAL NOT NULL,
    y REAL NOT NULL,
    width REAL,
    height REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE
  );
`);

export default db;
