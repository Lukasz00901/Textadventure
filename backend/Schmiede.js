const express = require('express');
const router = express.Router();
const { inventoryItems } = require('./Inventar_Inhalt');

// Schmiede-Items
const smithyItems = [
    { id: 1, name: 'Rückenbrecher (Zweihänder)', type: 'weapon', price: 150, damage: 80, category: 'weapon', quantity: 5 },
    { id: 2, name: 'Sturmklinge (Einhänder)', type: 'weapon', price: 100, damage: 50, category: 'weapon', quantity: 8 },
    { id: 3, name: 'Schildbrecher (Axt)', type: 'weapon', price: 120, damage: 70, category: 'weapon', quantity: 6 },
    { id: 4, name: 'Nachtklinge (Dolch)', type: 'weapon', price: 50, damage: 35, category: 'weapon', quantity: 10 },
    { id: 5, name: 'Edellanze', type: 'weapon', price: 140, damage: 65, category: 'weapon', quantity: 4 },
    { id: 6, name: 'Wurfspeer', type: 'weapon', price: 80, damage: 45, category: 'weapon', quantity: 7 },
    { id: 7, name: 'Steinbrecher (Keule)', type: 'weapon', price: 110, damage: 60, category: 'weapon', quantity: 6 },
    
];

// Route: Alle Schmiede-Items abrufen
router.get('/items', (req, res) => {
  res.json(smithyItems);
});

// Route: Item kaufen
router.post('/buy', (req, res) => {
  const { itemId } = req.body;
  const smithyItem = smithyItems.find(item => item.id === itemId);

  if (smithyItem && smithyItem.quantity > 0) {
    const newItem = { ...smithyItem };
    inventoryItems.push(newItem); // Item ins Inventar hinzufügen
    smithyItem.quantity -= 1; // Schmiede-Bestand reduzieren
    res.json({ inventoryItems });
  } else {
    res.status(400).json({ message: 'Item nicht verfügbar.' });
  }
});

// Route: Item verkaufen
router.post('/sell', (req, res) => {
  const { itemId } = req.body;
  const itemIndex = inventoryItems.findIndex(item => item.id === itemId);

  if (itemIndex !== -1) {
    const soldItem = inventoryItems[itemIndex];
    const smithyItem = smithyItems.find(item => item.id === soldItem.id);

    if (smithyItem) {
      smithyItem.quantity += 1; // Bestand der Schmiede erhöhen
    }

    inventoryItems.splice(itemIndex, 1); // Item aus dem Inventar entfernen
    res.json({ inventoryItems });
  } else {
    res.status(404).json({ message: 'Item nicht im Inventar gefunden.' });
  }
});

module.exports = router;
