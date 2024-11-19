const express = require('express');
const router = express.Router();
let { inventoryItems } = require('./Inventar_Inhalt'); // Ändern von const zu let

// Route: Alle Items abrufen
router.get('/items', (req, res) => {
  res.json({ items: inventoryItems });
});

// Route: Items alphabetisch sortieren
router.post('/items/sort', (req, res) => {
  inventoryItems.sort((a, b) => a.name.localeCompare(b.name));
  res.json({ items: inventoryItems });
});

// Route: Items nach Stärke sortieren
router.post('/items/sort-by-strength', (req, res) => {
  inventoryItems.sort((a, b) => b.strength - a.strength);
  res.json({ items: inventoryItems });
});

// Route: Items löschen
router.post('/items/delete', (req, res) => {
  const itemsToDelete = req.body.items;
  if (itemsToDelete) {
    // Filtern Sie die Items, die nicht gelöscht werden sollen
    inventoryItems = inventoryItems.filter((item) => !itemsToDelete.includes(item.id));
  }
  res.json({ items: inventoryItems });
});

module.exports = router;
