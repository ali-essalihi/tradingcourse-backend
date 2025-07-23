import Database from "better-sqlite3";
import path from "path";

const db = new Database(path.resolve("data", "app.db"));

// Pragmas
db.pragma("foreign_keys = ON");
db.pragma("journal_mode = WAL");
db.pragma("temp_store = MEMORY");
db.pragma("cache_size = -16384");
db.pragma("synchronous = NORMAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    google_id TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL
  );

  CREATE TABLE IF NOT EXISTS refresh_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    expires TEXT NOT NULL,
    rotated_at TEXT NOT NULL
  );
`);

export default db;
