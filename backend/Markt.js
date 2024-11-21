const express = require('express');
const router = express.Router();
const { inventoryItems } = require('./Inventar_Inhalt');

// Markt-Items
const marketItems = [
  { name: 'Kleiner Heiltrank', type: 'Trank', price: 15, strength: 15, category: 'consumable', quantity: 10 },
  { name: 'Mittlerer Heiltrank', type: 'Trank', price: 25, strength: 40, category: 'consumable', quantity: 10 },
  { name: 'Großer Heiltrank', type: 'Trank', price: 40, strength: 80, category: 'consumable', quantity: 10 },
  { name: 'Mega Heiltrank', type: 'Trank', price: 60, strength: 150, category: 'consumable', quantity: 10 },
  { name: 'Mana-Trank', type: 'Trank', price: 75, strength: 190, category: 'consumable', quantity: 10 },
  { name: 'Brot', type: 'Lebensmittel', price: 5, strength: 5, category: 'consumable', quantity: 10 },
  { name: 'Apfel', type: 'Trank', price: 2, strength: 3, category: 'consumable', quantity: 10 },
  { name: 'Ei', type: 'Trank', price: 3, strength: 3, category: 'consumable', quantity: 10 },
  { name: 'Ziegenkäserad', type: 'Trank', price: 10, strength: 15, category: 'consumable', quantity: 10 },
  { name: 'Harzer Roller', type: 'Trank', price: 3, strength: 3, category: 'consumable', quantity: 10 },
  { name: 'Kürbiskuchen', type: 'Trank', price: 5, strength: 6, category: 'consumable', quantity: 10 },
  { name: 'Nüsse', type: 'Trank', price: 3, strength: 3, category: 'consumable', quantity: 10 },
];

// Route: Alle Markt-Items abrufen
router.get('/items', (req, res) => {
  res.json(marketItems);
});

// Route: Item kaufen
router.post('/buy', (req, res) => {
  const { itemName } = req.body;
  const marketItem = marketItems.find(item => item.name === itemName);

  if (marketItem && marketItem.quantity > 0) {
    // Prüfen, ob das Item bereits im Inventar existiert
    const existingItem = inventoryItems.find(item => item.name === itemName);

    if (existingItem) {
      // Erhöhe die Menge des bestehenden Items
      existingItem.quantity += 1;
    } else {
      // Füge das neue Item mit Menge 1 hinzu
      inventoryItems.push({ ...marketItem, quantity: 1 });
    }

    // Reduziere die Menge im Markt
    marketItem.quantity -= 1;

    res.json({ inventoryItems });
  } else {
    res.status(400).json({ message: 'Item nicht verfügbar.' });
  }
});

// Route: Item verkaufen
router.post('/sell', (req, res) => {
  const { itemName } = req.body;
  const itemIndex = inventoryItems.findIndex(item => item.name === itemName);

  if (itemIndex !== -1) {
    // Reduziere die Menge oder entferne das Item vollständig
    const item = inventoryItems[itemIndex];
    item.quantity -= 1;

    if (item.quantity <= 0) {
      inventoryItems.splice(itemIndex, 1); // Item aus dem Inventar entfernen
    }

    res.json({ inventoryItems });
  } else {
    res.status(404).json({ message: 'Item nicht im Inventar gefunden.' });
  }
});

module.exports = router;
