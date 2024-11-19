// Backend Code
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();

// Middleware-Konfiguration
app.use(cors());
app.use(bodyParser.json());

// Beispielhafte Inventar-Items
let inventoryItems = [
  { id: 1, name: 'Schwert', strength: 10, category: 'equipment', isEquipable: true, type: 'weapon', equipped: false },
  { id: 2, name: 'Schild', strength: 8, category: 'equipment', isEquipable: true, type: 'armor', equipped: false },
  { id: 3, name: 'Heiltrank', strength: 15, category: 'consumable', isEquipable: false },
  { id: 4, name: 'Bogen', strength: 7, category: 'equipment', isEquipable: true, type: 'weapon', equipped: false },
  { id: 5, name: 'Kopfschutz', strength: 3, category: 'equipment', isEquipable: true, type: 'armor', equipped: false },
  { id: 6, name: 'Rüstung', strength: 12, category: 'equipment', isEquipable: true, type: 'armor', equipped: false },
  { id: 7, name: 'Gold', strength: 1, category: 'misc', isEquipable: false },
  { id: 8, name: 'Schmuck', strength: 2, category: 'misc', isEquipable: false },
  { id: 9, name: 'Schaufel', strength: 4, category: 'equipment', isEquipable: false },
  { id: 10, name: 'Draht', strength: 2, category: 'misc', isEquipable: false },
  { id: 11, name: 'Feder', strength: 1, category: 'misc', isEquipable: false },
  { id: 12, name: 'Großer Heiltrank', strength: 30, category: 'consumable', isEquipable: false },
  { id: 13, name: 'Flammenschwert', strength: 15, category: 'equipment', isEquipable: true, type: 'weapon', equipped: false },
  { id: 14, name: 'Kokosnuss', strength: 1, category: 'misc', isEquipable: false },
];

// Route, um alle Items abzurufen
app.get('/items', (req, res) => {
  res.json({ items: inventoryItems });
});

// Route, um Items nach Namen zu sortieren
app.post('/items/sort', (req, res) => {
  inventoryItems.sort((a, b) => a.name.localeCompare(b.name));
  res.json({ items: inventoryItems });
});

// Route, um Items nach Stärke zu sortieren
app.post('/items/sort-by-strength', (req, res) => {
  inventoryItems.sort((a, b) => b.strength - a.strength);
  res.json({ items: inventoryItems });
});

// Route, um ausgewählte Items zu löschen
app.post('/items/delete', (req, res) => {
  const itemsToDelete = req.body.items;
  if (itemsToDelete) {
    inventoryItems = inventoryItems.filter(
      (item) => !itemsToDelete.includes(item.id)
    );
  }
  res.json({ items: inventoryItems });
});

// Starten des Servers
app.listen(5000, () => {
  console.log('Server gestartet auf Port 5000');
});
