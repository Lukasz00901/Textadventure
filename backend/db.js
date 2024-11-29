// backend/db.js
const mysql = require('mysql2/promise');

// Erstelle eine Verbindungspool für bessere Leistung
const pool = mysql.createPool({
  host: 'localhost',       // MySQL-Server
  user: 'root',            // MySQL-Benutzername
  password: 'Isabell1212<3', // MySQL-Passwort
  database: 'game',        // Datenbankname
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;