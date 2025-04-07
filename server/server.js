const express = require('express');
const cors = require('cors');
const initializeDatabase = require('./config/database');
const routes = require('./routes');

const app = express();
const PORT = 3001;

// Initialize database
const db = initializeDatabase();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Attach database to request object
app.use((req, res, next) => {
  req.db = db;
  next();
});

// Routes
app.use('/', routes);

// Error handling middleware
app.use(require('./middleware/errorHandler'));

app.listen(PORT, () => {
  console.log(`running at http://localhost:${PORT}`);
});

