// server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Bestehende Routen
const inventoryRoutes = require('./Inventory');
const dungeonRouter = require('./Dungeon'); // Stelle sicher, dass der Pfad korrekt ist
const marketRoutes = require('./Markt');
const waldRoutes = require('./Wald'); // Stelle sicher, dass die Datei Wald.js existiert
const mineRoutes = require('./Mine'); // Stelle sicher, dass die Datei Mine.js existiert
const tavernRoutes = require('./Taverne');
const smithyRoutes = require('./Schmiede');

// Middleware zum Parsen von JSON
app.use(express.json());

app.use('/inventory', inventoryRoutes); // Verwende die Inventory-Routen unter /inventory
app.use('/api/dungeon', dungeonRouter); // Verwende den Dungeon Router unter /api/dungeon
app.use('/market', marketRoutes);
app.use('/wald', waldRoutes); // Routen für den Wald
app.use('/mine', mineRoutes); // Routen für die Mine
app.use('/tavern', tavernRoutes); // Routen für die Taverne
app.use('/smithy', smithyRoutes); // Routen für die Schmiede

// ---------------------------------------------------
// Neue Endpunkte für den Spielernamen hinzufügen
// ---------------------------------------------------

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

// ---------------------------------------------------
// Server starten
// ---------------------------------------------------
const PORT = process.env.PORT || 3000; // Setze den Port auf 3000
app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});
