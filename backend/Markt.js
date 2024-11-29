// backend/Markt.js
const express = require('express');
const cors = require('cors');
const router = express.Router();
const { inventoryItems, PlayerHP, PlayerMaxHP, playerMoney } = require('./Inventar_Inhalt');

// Markt-Items
const marketItems = [
  { name: 'Kleiner Heiltrank', type: 'Trank', price: 15, worth:7, strength: 15, category: 'consumable', quantity: 10 },
  { name: 'Mittlerer Heiltrank', type: 'Trank', price: 25, worth: 14, strength: 40, category: 'consumable', quantity: 10 },
  { name: 'Großer Heiltrank', type: 'Trank', price: 40, worth: 20, strength: 80, category: 'consumable', quantity: 10 },
  { name: 'Mega Heiltrank', type: 'Trank', price: 60, worth: 30, strength: 150, category: 'consumable', quantity: 10 },
  { name: 'Mana-Trank', type: 'Trank', price: 75, worth: 37, strength: 190, category: 'consumable', quantity: 10 },
  { name: 'Brot', type: 'Lebensmittel', price: 4, worth: 2, strength: 5, category: 'consumable', quantity: 10 },
  { name: 'Apfel', type: 'Trank', price: 2, worth: 1, strength: 3, category: 'consumable', quantity: 10 },
  { name: 'Ei', type: 'Trank', price: 4, worth: 2, strength: 3, category: 'consumable', quantity: 10 },
  { name: 'Ziegenkäserad', type: 'Trank', price: 10, worth: 5, strength: 15, category: 'consumable', quantity: 10 },
  { name: 'Harzer Roller', type: 'Trank', price: 4, worth: 2, strength: 3, category: 'consumable', quantity: 10 },
  { name: 'Kürbiskuchen', type: 'Trank', price: 6, worth: 3, strength: 6, category: 'consumable', quantity: 10 },
  { name: 'Nüsse', type: 'Trank', price: 4, worth:6, strength: 3, category: 'consumable', quantity: 10 },
];

// Quest-Log
let questLog = [];

// Hilfsfunktion: Wert eines Items ermitteln (für den Verkauf)
const getItemWorth = (itemName) => {
  const item = marketItems.find(item => item.name === itemName);
  return item ? item.price : 0; // Verkaufspreis ist der gleiche wie Kaufpreis
};

// Aktiviere CORS für alle Routen
router.use(cors());

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

    // Spielerstatus aktualisieren (z.B. Münzen abziehen)
    playerMoney[0] -= marketItem.price;

    // Loggen des Kaufes
    questLog.push(`Gekauft: ${marketItem.name} für ${marketItem.price} Münzen.`);

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

// Route: Item verkaufen für Consumables
router.post('/sell', (req, res) => {
  const { itemName, strength, worth } = req.body;
  console.log(`Received sell request for item: ${itemName}, Stärke: ${strength}, Wert: ${worth}`);

  if (!itemName || strength === undefined || worth === undefined) {
    return res.status(400).json({ message: 'Itemname, Stärke und Wert sind erforderlich.' });
  }

  // Logge das aktuelle Inventar
  console.log('Aktuelles Inventar:', inventoryItems);

  // Finde das Item im Inventar basierend auf Name, Stärke und Wert sowie Kategorie 'consumable'
  const inventoryItem = inventoryItems.find(item => 
    item.name === itemName && 
    item.category === 'consumable' && 
    item.strength === strength && 
    item.worth === worth
  );

  if (inventoryItem) {
    console.log(`Gefundenes Item: ${JSON.stringify(inventoryItem)}`);

    if (inventoryItem.quantity > 0) {
      // Überprüfe die Kategorie direkt aus dem inventoryItem
      const isConsumable = inventoryItem.category === 'consumable';

      if (!isConsumable) {
        return res.status(400).json({ message: 'Dieses Item kann nicht verkauft werden.' });
      }

      // Verwende den Wert direkt aus dem inventoryItem
      const itemWorth = getItemWorth(inventoryItem.name);

      if (itemWorth === 0) {
        return res.status(400).json({ message: 'Wert des Items konnte nicht ermittelt werden.' });
      }

      // Reduziere die Menge des Items
      inventoryItem.quantity -= 1;
      if (inventoryItem.quantity === 0) {
        const index = inventoryItems.indexOf(inventoryItem);
        inventoryItems.splice(index, 1); // Item entfernen
      }

      // Erhöhe das Spieler-Geld
      playerMoney[0] += itemWorth;

      // Loggen des Verkaufs
      questLog.push(`Verkauft: ${itemName} für ${itemWorth} Münzen.`);

      res.json({
        message: `${itemName} wurde verkauft für ${itemWorth} Münzen.`,
        playerStatus: {
          money: playerMoney[0],
          hp: PlayerHP[0],
          maxHp: PlayerMaxHP[0],
        },
        inventoryItems,
        questLog, // Aktualisiertes Quest-Log zurücksenden
      });
    } else {
      res.status(400).json({ message: 'Nicht genügend Items zum Verkaufen.' });
    }
  } else {
    console.log(`Item nicht gefunden: Name=${itemName}, Stärke=${strength}, Wert=${worth}`);
    res.status(404).json({ message: 'Item nicht im Inventar gefunden.' });
  }
});

module.exports = router;
