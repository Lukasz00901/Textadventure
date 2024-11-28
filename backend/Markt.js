// backend/Markt.js
const express = require('express');
const router = express.Router();
const { inventoryItems, PlayerHP, PlayerMaxHP, playerMoney } = require('./Inventar_Inhalt');

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

// Quest-Log
let questLog = [];

// Hilfsfunktion: Wert eines Items ermitteln (für den Verkauf)
const getItemWorth = (itemName) => {
  const item = marketItems.find(item => item.name === itemName);
  return item ? item.price : 0; // Verkaufspreis ist der gleiche wie Kaufpreis
};

// Route: Alle Markt-Items abrufen
router.get('/items', (req, res) => {
  res.json(marketItems);
});

// Route: Spielerstatus abrufen
router.get('/player-status', (req, res) => {
  res.json({
    money: playerMoney[0],
    hp: PlayerHP[0],
    maxHp: PlayerMaxHP[0],
    sleepCost: 5, // Beispielwert, falls benötigt
  });
});

// Route: Quest-Log abrufen
router.get('/quest-log', (req, res) => {
  res.json(questLog);
});

// Route: Inventar abrufen
router.get('/inventory', (req, res) => {
  res.json(inventoryItems);
});

// Route: Item kaufen
router.post('/buy', (req, res) => {
  const { itemName } = req.body;
  const marketItem = marketItems.find(item => item.name === itemName);

  if (marketItem && marketItem.quantity > 0) {
    if (playerMoney[0] < marketItem.price) {
      return res.status(400).json({ message: 'Nicht genug Geld, um das Item zu kaufen.' });
    }

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

    // Spielerstatus aktualisieren (z.B. Gold abziehen)
    playerMoney[0] -= marketItem.price;

    // Loggen des Kaufes
    questLog.push(`Gekauft: ${marketItem.name} für ${marketItem.price} Gold.`);

    res.json({
      message: `${marketItem.name} wurde gekauft.`,
      playerStatus: {
        money: playerMoney[0],
        hp: PlayerHP[0],
        maxHp: PlayerMaxHP[0],
      },
      marketItems, // Aktualisierte Markt-Items zurücksenden, falls nötig
      inventoryItems,
      questLog, // Aktualisiertes Quest-Log zurücksenden
    });
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

    // Spielerstatus aktualisieren (z.B. Gold hinzufügen)
    const soldItem = marketItems.find(item => item.name === itemName) || item;
    const sellPrice = getItemWorth(itemName);
    playerMoney[0] += sellPrice;

    // Loggen des Verkaufs
    questLog.push(`Verkauft: ${itemName} für ${sellPrice} Gold.`);

    res.json({
      message: `${itemName} wurde verkauft für ${sellPrice} Gold.`,
      inventoryItems,
      playerStatus: {
        money: playerMoney[0],
        hp: PlayerHP[0],
        maxHp: PlayerMaxHP[0],
      },
      questLog, // Aktualisiertes Quest-Log zurücksenden
    });
  } else {
    res.status(404).json({ message: 'Item nicht im Inventar gefunden.' });
  }
});

module.exports = router;
