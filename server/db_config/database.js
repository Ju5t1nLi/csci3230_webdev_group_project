const sqlite3 = require('sqlite3').verbose();

const initializeDatabase = () => {
  const db = new sqlite3.Database('./trips.db', (err) => {
    if (err) console.error('Database connection error:', err);
  });

  // Enable foreign key constraints
  db.run('PRAGMA foreign_keys = ON;');

  // Create tables
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS trips (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        user TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now', 'localtime'))
      )`
    );

    db.run(`
      CREATE TABLE IF NOT EXISTS blog_posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        trip_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        created_at TEXT DEFAULT (datetime('now', 'localtime')),
        FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
      )`
    );
  });

  return db;
};

module.exports = initializeDatabase;