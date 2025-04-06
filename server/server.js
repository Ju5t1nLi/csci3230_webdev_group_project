import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3'

const app = express();
const PORT = 3001;
const db = new sqlite3.Database('./database.db');

// Create table
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      description TEXT
    )
  `);
});

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  // Get schema information
  db.all(
    "SELECT name, sql FROM sqlite_schema WHERE type='table' AND name NOT LIKE 'sqlite_%'",
    (err, tables) => {
      if (err) return res.status(500).json(err);
      res.json(tables);
    });
})

// CRUD Endpoints

// Create
app.post('/items', (req, res) => {
  const { name, description } = req.body;
  db.run(
    'INSERT INTO items (name, description) VALUES (?, ?)',
    [name, description],
    function(err) {
      if (err) return res.status(500).json(err);
      res.json({ id: this.lastID });
    }
  );
});

// Read All
app.get('/items', (req, res) => {
  db.all('SELECT * FROM items', (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

// Update
app.put('/items/:id', (req, res) => {
  const { name, description } = req.body;
  db.run(
    'UPDATE items SET name = ?, description = ? WHERE id = ?',
    [name, description, req.params.id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ success: true });
    }
  );
});

// Delete
app.delete('/items/:id', (req, res) => {
  db.run(
    'DELETE FROM items WHERE id = ?',
    [req.params.id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ success: true });
    }
  );
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});