const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0'; // Lausche auf allen IP-Adressen

// Middleware
app.use(bodyParser.json());
app.use(express.json());

// Beispiel-Routen
const inventoryRoutes = require('./Inventory');
const dungeonRouter = require('./Dungeon');
const marketRoutes = require('./Markt');
const waldRoutes = require('./Wald');
const mineRoutes = require('./Mine');
const tavernRoutes = require('./Taverne');
const smithyRoutes = require('./Schmiede');

app.use('/inventory', inventoryRoutes);
app.use('/api/dungeon', dungeonRouter);
app.use('/market', marketRoutes);
app.use('/wald', waldRoutes);
app.use('/mine', mineRoutes);
app.use('/tavern', tavernRoutes);
app.use('/smithy', smithyRoutes);

// In-Memory Speicher für den Spielernamen
let playerName = '';

// GET-Endpunkt zum Abrufen des Spielernamens
app.get('/api/player', (req, res) => {
  console.log('GET /api/player - Aktueller Name:', playerName);
  res.json({ name: playerName });
});

// POST-Endpunkt zum Setzen des Spielernamens
app.post('/api/player', (req, res) => {
  const { name } = req.body;
  console.log('POST /api/player - Empfangener Name:', name);

  if (!name || typeof name !== 'string') {
    console.log('Ungültiger Name:', name);
    return res.status(400).json({ error: 'Ein gültiger Name ist erforderlich.' });
  }

  playerName = name;
  console.log('Name gesetzt:', playerName);
  res.json({ message: 'Name erfolgreich gesetzt.', name: playerName });
});

// Statische Dateien für die Produktion bereitstellen
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'build')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
}


// Server starten
app.listen(PORT, HOST, () => {
  console.log(`Server läuft auf http://${HOST}:${PORT}`);
});
