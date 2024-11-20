const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const inventoryRoutes = require('./Inventory');
const dungeonRoutes = require('./Dungeon');
const marketRoutes = require('./Markt');
const waldRoutes = require('./Wald'); // Stelle sicher, dass die Datei Wald.js existiert
const mineRoutes = require('./Mine'); // Stelle sicher, dass die Datei Mine.js existiert

app.use('/inventory', inventoryRoutes);
app.use('/dungeon', dungeonRoutes);
app.use('/market', marketRoutes);
app.use('/wald', waldRoutes); // Routen für den Wald
app.use('/mine', mineRoutes); // Routen für die Mine

app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
