// backend/app.js oder server.js

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config(); // Stelle sicher, dass du dotenv verwendest, um Umgebungsvariablen zu laden

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: 'http://localhost:3001', // Passe dies an deine Frontend-URL an
}));
app.use(express.json()); // Parsen von JSON-Körpern

// Beispiel-Routen mit konsistentem /api Prefix
const inventoryRoutes = require('./Inventory');
const dungeonRouter = require('./Dungeon');
const marketRoutes = require('./Markt');
const waldRoutes = require('./Wald');
const mineRoutes = require('./Mine');
const tavernRoutes = require('./Taverne');
const smithyRoutes = require('./Schmiede');
const playerRoutes = require('./Player'); // Neuer Router für Spieler-Management

// Verwende die Router unter /api Prefix
app.use('/api/inventory', inventoryRoutes);
app.use('/api/dungeon', dungeonRouter);
app.use('/api/market', marketRoutes);
app.use('/api/wald', waldRoutes);
app.use('/api/mine', mineRoutes);
app.use('/api/tavern', tavernRoutes);
app.use('/api/smithy', smithyRoutes);
app.use('/api/player', playerRoutes); // Mount den Spieler-Router

// Statische Dateien für die Produktion bereitstellen
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'build')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
}

// Server starten
app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});
