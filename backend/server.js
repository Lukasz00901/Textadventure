const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const inventoryRoutes = require('./Inventory');
const dungeonRouter = require('./Dungeon'); // Stelle sicher, dass der Pfad korrekt ist
const marketRoutes = require('./Markt');
const waldRoutes = require('./Wald'); // Stelle sicher, dass die Datei Wald.js existiert
const mineRoutes = require('./Mine'); // Stelle sicher, dass die Datei Mine.js existiert
const tavernRoutes = require('./Taverne');
const smithyRoutes = require('./Schmiede');



// Middleware zum Parsen von JSON
app.use(express.json());

app.use('/inventory', inventoryRoutes);// Verwende den Dungeon Router unter /api/dungeon
app.use('/api/dungeon', dungeonRouter);
app.use('/market', marketRoutes);
app.use('/wald', waldRoutes); // Routen f체r den Wald
app.use('/mine', mineRoutes); // Routen f체r die Mine
app.use('/tavern', tavernRoutes); // Routen f체r die Mine
app.use('/smithy', smithyRoutes);

const PORT = process.env.PORT || 3000; // Setze den Port auf 3000
// Startet den Server
app.listen(PORT, () => {
  console.log(`Server l채uft auf Port ${PORT}`);
});
