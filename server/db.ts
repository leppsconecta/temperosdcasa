import Database from 'better-sqlite3';

const db = new Database('produtosnaturais.db');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL,
    name TEXT NOT NULL,
    weight TEXT NOT NULL,
    desc TEXT NOT NULL,
    img TEXT NOT NULL,
    hidden BOOLEAN DEFAULT 0,
    FOREIGN KEY (category) REFERENCES categories (id)
  );
`);

// Insert default user if not exists (password is @Anderson hashed)
// using bcryptjs but since we are inserting directly here we'll let the app do it, or we just insert a raw hash.
// For simplicity and since we only have one user, let's export the db.

export default db;
