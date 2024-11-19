const express = require('express');
const router = express.Router();
const { inventoryItems } = require('./Inventar_Inhalt');

// Markt-Items
const marketItems = [
  { id: 1, name: 'Health Potion', type: 'consumable', price: 15, quantity: 10 },
  { id: 2, name: 'Iron Sword', type: 'equipment', price: 100, quantity: 5 },
];

// Route: Alle Markt-Items abrufen
router.get('/items', (req, res) => {
  res.json(marketItems);
});

// Route: Item kaufen
router.post('/buy', (req, res) => {
  const { itemId } = req.body;
  const marketItem = marketItems.find(item => item.id === itemId);

  if (marketItem && marketItem.quantity > 0) {
    const newItem = { ...marketItem };
    inventoryItems.push(newItem); // Item ins Inventar hinzufügen
    marketItem.quantity -= 1; // Marktbestand reduzieren
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
    inventoryItems.splice(itemIndex, 1); // Item aus dem Inventar entfernen
    res.json({ inventoryItems });
  } else {
    res.status(404).json({ message: 'Item nicht im Inventar gefunden.' });
  }
});

module.exports = router;
