const express = require('express');
const router = express.Router();
const { inventoryItems } = require('./Inventar_Inhalt');

// Taverne-Items
const tavernItems = [
  { id: 1, name: 'Bier', type: 'Trank', price: 15, strength: 15, category: 'consumable', quantity: 10 },
  { id: 2, name: 'Wein', type: 'Trank', price: 25, strength: 30, category: 'consumable', quantity: 10 },
  { id: 3, name: 'Met', type: 'Trank', price: 40, strength: 50, category: 'consumable', quantity: 10 },
  { id: 4, name: 'Kräuterlikör', type: 'Trank', price: 5, strength: 5, category: 'consumable', quantity: 10 },
  { id: 5, name: 'Wasser (Unsauber!)', type: 'Trank', price: 2, strength: 3, category: 'consumable', quantity: 10 },
  { id: 6, name: 'Eintopf', type: 'Lebensmittel', price: 3, strength: 3, category: 'consumable', quantity: 10 },
  { id: 7, name: 'Fleisch', type: 'Lebensmittel', price: 10, strength: 15, category: 'consumable', quantity: 10 },
  { id: 8, name: 'Fisch', type: 'Lebensmittel', price: 3, strength: 3, category: 'consumable', quantity: 10 },
];

// Route: Alle Taverne-Items abrufen
router.get('/items', (req, res) => {
  res.json(tavernItems);
});

// Route: Item kaufen
router.post('/buy', (req, res) => {
  const { itemId } = req.body;
  const tavernItem = tavernItems.find(item => item.id === itemId);

  if (tavernItem && tavernItem.quantity > 0) {
    const newItem = { ...tavernItem };
    inventoryItems.push(newItem); // Item ins Inventar hinzufügen
    tavernItem.quantity -= 1; // Taverne-Bestand reduzieren
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
