const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'currency.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to SQLite database.');
  }
});

// Initialize database tables
db.serialize(() => {
  // Table for user favorite currency pairs
  db.run(`
    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source_currency TEXT NOT NULL,
      target_currency TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(source_currency, target_currency)
    )
  `);

  // Table for logging conversion history
  db.run(`
    CREATE TABLE IF NOT EXISTS conversions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source_currency TEXT NOT NULL,
      target_currency TEXT NOT NULL,
      amount REAL NOT NULL,
      rate REAL NOT NULL,
      converted_amount REAL NOT NULL,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

module.exports = db;
