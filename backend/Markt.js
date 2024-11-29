// backend/Markt.js

const express = require('express');
const router = express.Router();
const cors = require('cors');

// Importiere die Datenzugriffsmodelle
const { getAllMarketItems, getMarketItemByName, decreaseMarketItemQuantity } = require('./models/marketModel');
const { getPlayerById, updatePlayer } = require('./models/playerModel');
const { getInventoryByPlayerId, addItemToInventory, removeItemFromInventory } = require('./models/inventoryModel');
const { getItemByNameAndType, getItemWorth } = require('./models/itemModel');
const { getQuestLogByPlayerId, addQuestLog } = require('./models/questLogModel');

// Importiere die Middleware zur Spieleridentifikation
const { getPlayer } = require('./middlewares/getPlayer');

// Middleware zum Parsen von JSON
router.use(express.json());

// CORS-Konfiguration (falls nicht bereits global konfiguriert)
router.use(cors({
  origin: 'http://localhost:3001' // Passe die erlaubten Ursprünge nach Bedarf an
}));

// Route: Alle Markt-Items abrufen
router.get('/items', getPlayer, async (req, res) => {
  try {
    const marketItems = await getAllMarketItems();
    res.json(marketItems);
  } catch (error) {
    console.error('Fehler beim Abrufen der Markt-Items:', error);
    res.status(500).json({ error: 'Datenbankfehler' });
  }
});

// Route: Spielerstatus abrufen
router.get('/player-status', getPlayer, async (req, res) => {
  try {
    const player = req.player;
    res.json({
      money: player.money,
      hp: player.hp,
      maxHp: player.max_hp,
      sleepCost: 5, // Beispielwert, falls benötigt
    });
  } catch (error) {
    console.error('Fehler beim Abrufen des Spielerstatus:', error);
    res.status(500).json({ error: 'Datenbankfehler' });
  }
});

// Route: Quest-Log abrufen
router.get('/quest-log', getPlayer, async (req, res) => {
  try {
    const questLogs = await getQuestLogByPlayerId(req.player.id);
    res.json(questLogs);
  } catch (error) {
    console.error('Fehler beim Abrufen des Quest-Logs:', error);
    res.status(500).json({ error: 'Datenbankfehler' });
  }
});

// Route: Inventar abrufen
router.get('/inventory', getPlayer, async (req, res) => {
  try {
    const inventory = await getInventoryByPlayerId(req.player.id);
    res.json(inventory);
  } catch (error) {
    console.error('Fehler beim Abrufen des Inventars:', error);
    res.status(500).json({ error: 'Datenbankfehler' });
  }
});

// Route: Item kaufen
router.post('/buy', getPlayer, async (req, res) => {
  const playerId = req.player.id;
  const { itemName } = req.body;

  if (!itemName) {
    return res.status(400).json({ message: 'Itemname ist erforderlich.' });
  }

  try {
    const marketItem = await getMarketItemByName(itemName);

    if (!marketItem || marketItem.quantity < 1) {
      return res.status(400).json({ message: 'Item nicht verfügbar.' });
    }

    if (req.player.money < marketItem.price) {
      return res.status(400).json({ message: 'Nicht genug Geld, um das Item zu kaufen.' });
    }

    // Prüfen, ob das Item bereits im Inventar existiert
    let existingItem = await getItemByNameAndType(itemName, marketItem.type);

    if (existingItem) {
      await addItemToInventory(playerId, existingItem.id, 1);
    } else {
      // Falls das Item noch nicht in der Items-Tabelle existiert, füge es hinzu
      const newItemId = await addItem({
        name: marketItem.name,
        type: marketItem.type,
        strength: marketItem.strength,
        worth: marketItem.worth,
        category: marketItem.category,
        quantity: 1
      });
      await addItemToInventory(playerId, newItemId, 1);
    }

    // Reduziere die Menge im Markt
    await decreaseMarketItemQuantity(marketItem.id, 1);

    // Aktualisiere den Spielerstatus (Münzen abziehen)
    await updatePlayer({
      id: playerId,
      money: req.player.money - marketItem.price
    });

    // Loggen des Kaufes
    await addQuestLog(playerId, `Gekauft: ${marketItem.name} für ${marketItem.price} Münzen.`);

    res.json({
      message: `${marketItem.name} wurde gekauft.`,
      playerStatus: {
        money: req.player.money - marketItem.price,
        hp: req.player.hp,
        maxHp: req.player.max_hp,
      },
      marketItems: await getAllMarketItems(),
      inventory: await getInventoryByPlayerId(playerId),
      questLog: await getQuestLogByPlayerId(playerId),
    });
  } catch (error) {
    console.error('Fehler beim Kaufen des Items:', error);
    res.status(500).json({ error: 'Datenbankfehler' });
  }
});

// Route: Item verkaufen für Consumables
router.post('/sell', getPlayer, async (req, res) => {
  const playerId = req.player.id;
  const { itemName, strength, worth } = req.body;

  console.log(`Received sell request for item: ${itemName}, Stärke: ${strength}, Wert: ${worth}`);

  if (!itemName || strength === undefined || worth === undefined) {
    return res.status(400).json({ message: 'Itemname, Stärke und Wert sind erforderlich.' });
  }

  try {
    // Finde das Item im Inventar basierend auf Name, Stärke und Wert sowie Kategorie 'consumable'
    const inventoryItem = (await getInventoryByPlayerId(playerId)).find(item =>
      item.name === itemName &&
      item.category === 'consumable' &&
      item.strength === strength &&
      item.worth === worth
    );

    if (!inventoryItem) {
      console.log(`Item nicht gefunden: Name=${itemName}, Stärke=${strength}, Wert=${worth}`);
      return res.status(404).json({ message: 'Item nicht im Inventar gefunden.' });
    }

    if (inventoryItem.quantity <= 0) {
      return res.status(400).json({ message: 'Nicht genügend Items zum Verkaufen.' });
    }

    // Verkaufspreis ist der gleiche wie Kaufpreis
    const itemWorth = await getItemWorth(itemName);

    if (itemWorth === 0) {
      return res.status(400).json({ message: 'Wert des Items konnte nicht ermittelt werden.' });
    }

    // Reduziere die Menge des Items
    await removeItemFromInventory(playerId, inventoryItem.id, 1);

    // Erhöhe das Spieler-Geld
    await updatePlayer({
      id: playerId,
      money: req.player.money + itemWorth
    });

    // Loggen des Verkaufs
    await addQuestLog(playerId, `Verkauft: ${itemName} für ${itemWorth} Münzen.`);

    res.json({
      message: `${itemName} wurde verkauft für ${itemWorth} Münzen.`,
      playerStatus: {
        money: req.player.money + itemWorth,
        hp: req.player.hp,
        maxHp: req.player.max_hp,
      },
      inventory: await getInventoryByPlayerId(playerId),
      questLog: await getQuestLogByPlayerId(playerId),
    });
  } catch (error) {
    console.error('Fehler beim Verkaufen des Items:', error);
    res.status(500).json({ error: 'Datenbankfehler' });
  }
});

module.exports = router;
