const express = require('express');
const router = express.Router();
const { inventoryItems } = require('./Inventar_Inhalt');

// Markt-Items
const marketItems = [
  { id: 1, name: 'Kleiner Heiltrank', type: 'Trank', price: 15, strength: 15, category: 'consumable', quantity: 10 },
  { id: 2, name: 'Mittlerer Heiltrank', type: 'Trank', price: 25, strength: 40, category: 'consumable', quantity:  10 },
  { id: 3, name: 'Großer Heiltrank', type: 'Trank', price: 40, strength: 80, category: 'consumable', quantity: 10 },
  { id: 4, name: 'Mega Heiltrank', type: 'Trank', price: 60, strength: 150, category: 'consumable', quantity: 10 },
  { id: 5, name: 'Mana-Trank', type: 'Trank', price: 75, strength: 190, category: 'consumable', quantity: 10 },
  { id: 6, name: 'Brot', type: 'Lebensmittel', price: 5, strength: 5, category: 'consumable', quantity: 10 },
  { id: 7, name: 'Apfel', type: 'Trank', price: 2, strength: 3, category: 'consumable', quantity: 10 },
  { id: 8, name: 'Ei', type: 'Trank', price: 3, strength: 3, category: 'consumable', quantity: 10 },
  { id: 9, name: 'Ziegenkäserad', type: 'Trank', price: 10, strength: 15, category: 'consumable', quantity: 10 },
  { id: 10, name: 'Harzer Roller', type: 'Trank', price: 3, strength: 3, category: 'consumable', quantity: 10 },
  { id: 11, name: 'Kürbiskuchen', type: 'Trank', price: 5, strength: 6, category: 'consumable', quantity: 10 },
  { id: 12, name: 'Nüsse', type: 'Trank', price: 3, strength: 3, category: 'consumable', quantity: 10 }
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
