// backend/inventory.js

const express = require('express');
const router = express.Router();
const cors = require('cors');

// Importiere die Datenzugriffsmodelle
const {
  getInventoryByPlayerId,
  addItemToInventory,
  removeItemFromInventory
} = require('./models/inventoryModel');
const { getItemByNameAndType } = require('./models/itemModel');

// Importiere die Middleware zur Spieleridentifikation
const { getPlayer } = require('./middlewares/getPlayer');

// Middleware zum Parsen von JSON
router.use(express.json());

// CORS-Konfiguration (falls nicht bereits global konfiguriert)
router.use(cors({
  origin: 'http://localhost:3001' // Passe die erlaubten Ursprünge nach Bedarf an
}));

// Utility Funktion zur Generierung einer zufälligen Ganzzahl zwischen min und max (inklusive)
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// GET: Alle Items aus dem Inventar abrufen
router.get('/all/items', getPlayer, async (req, res) => {
  const playerId = req.player.id;

  try {
    const inventory = await getInventoryByPlayerId(playerId);
    res.status(200).json({
      message: 'Alle Items abgerufen.',
      items: inventory
    });
  } catch (error) {
    console.error('Fehler beim Abrufen des Inventars:', error);
    res.status(500).json({ error: 'Datenbankfehler' });
  }
});

// GET: Items nach Kategorie abrufen
router.get('/equipment/items', getPlayer, async (req, res) => {
  const playerId = req.player.id;

  try {
    const inventory = await getInventoryByPlayerId(playerId);
    const equipmentItems = inventory.filter(item => item.category === 'equipment');
    res.status(200).json({
      message: 'Alle Equipment-Items abgerufen.',
      items: equipmentItems
    });
  } catch (error) {
    console.error('Fehler beim Abrufen der Equipment-Items:', error);
    res.status(500).json({ error: 'Datenbankfehler' });
  }
});

router.get('/consumable/items', getPlayer, async (req, res) => {
  const playerId = req.player.id;

  try {
    const inventory = await getInventoryByPlayerId(playerId);
    const consumableItems = inventory.filter(item => item.category === 'consumable');
    res.status(200).json({
      message: 'Alle Consumable-Items abgerufen.',
      items: consumableItems
    });
  } catch (error) {
    console.error('Fehler beim Abrufen der Consumable-Items:', error);
    res.status(500).json({ error: 'Datenbankfehler' });
  }
});

router.get('/misc/items', getPlayer, async (req, res) => {
  const playerId = req.player.id;

  try {
    const inventory = await getInventoryByPlayerId(playerId);
    const miscItems = inventory.filter(item => item.category === 'misc');
    res.status(200).json({
      message: 'Alle Misc-Items abgerufen.',
      items: miscItems
    });
  } catch (error) {
    console.error('Fehler beim Abrufen der Misc-Items:', error);
    res.status(500).json({ error: 'Datenbankfehler' });
  }
});

// GET: Items nach Strength sortieren
router.get('/items/sort/strength', getPlayer, async (req, res) => {
  const playerId = req.player.id;

  try {
    const inventory = await getInventoryByPlayerId(playerId);
    const sortedItems = inventory.sort((a, b) => b.strength - a.strength);
    res.status(200).json({
      message: 'Items nach Strength sortiert.',
      items: sortedItems
    });
  } catch (error) {
    console.error('Fehler beim Sortieren der Items nach Strength:', error);
    res.status(500).json({ error: 'Datenbankfehler' });
  }
});

// GET: Items nach Worth sortieren
router.get('/items/sort/worth', getPlayer, async (req, res) => {
  const playerId = req.player.id;

  try {
    const inventory = await getInventoryByPlayerId(playerId);
    const sortedItems = inventory.sort((a, b) => b.worth - a.worth);
    res.status(200).json({
      message: 'Items nach Worth sortiert.',
      items: sortedItems
    });
  } catch (error) {
    console.error('Fehler beim Sortieren der Items nach Worth:', error);
    res.status(500).json({ error: 'Datenbankfehler' });
  }
});

// GET: Items nach Name (A-Z) sortieren
router.get('/items/sort/name', getPlayer, async (req, res) => {
  const playerId = req.player.id;

  try {
    const inventory = await getInventoryByPlayerId(playerId);
    const sortedItems = inventory.sort((a, b) => a.name.localeCompare(b.name));
    res.status(200).json({
      message: 'Items nach Name sortiert.',
      items: sortedItems
    });
  } catch (error) {
    console.error('Fehler beim Sortieren der Items nach Name:', error);
    res.status(500).json({ error: 'Datenbankfehler' });
  }
});

// GET: Items nach Quantity sortieren
router.get('/items/sort/quantity', getPlayer, async (req, res) => {
  const playerId = req.player.id;

  try {
    const inventory = await getInventoryByPlayerId(playerId);
    const sortedItems = inventory.sort((a, b) => b.quantity - a.quantity);
    res.status(200).json({
      message: 'Items nach Quantity sortiert.',
      items: sortedItems
    });
  } catch (error) {
    console.error('Fehler beim Sortieren der Items nach Quantity:', error);
    res.status(500).json({ error: 'Datenbankfehler' });
  }
});

// DELETE: Bestimmte Menge eines Items anhand des Namens löschen
router.delete('/item/:name', getPlayer, async (req, res) => {
  const playerId = req.player.id;
  const itemName = req.params.name;
  const deleteQuantity = parseInt(req.body.quantity, 10) || 1; // Standardmäßig 1

  try {
    // Finde das Item basierend auf dem Namen und dem Spieler
    const item = await getItemByNameAndType(itemName, null); // Typ kann unterschiedlich sein

    if (!item) {
      console.log(`Item mit Namen "${itemName}" nicht gefunden.`);
      return res.status(404).json({
        message: `Item mit dem Namen "${itemName}" wurde nicht gefunden.`,
      });
    }

    // Überprüfe die Menge im Inventar
    const inventory = await getInventoryByPlayerId(playerId);
    const inventoryItem = inventory.find(invItem => invItem.id === item.id);

    if (!inventoryItem) {
      console.log(`Item mit Namen "${itemName}" ist nicht im Inventar des Spielers.`);
      return res.status(404).json({
        message: `Item mit dem Namen "${itemName}" ist nicht im Inventar.`,
      });
    }

    if (deleteQuantity <= 0) {
      console.log('Ungültige Löschmenge:', deleteQuantity);
      return res.status(400).json({
        message: 'Die zu löschende Menge muss größer als 0 sein.',
      });
    }

    if (deleteQuantity >= inventoryItem.quantity) {
      // Lösche das gesamte Item
      await removeItemFromInventory(playerId, item.id, inventoryItem.quantity);
      res.status(200).json({
        message: `Item "${item.name}" wurde vollständig gelöscht.`,
        deletedQuantity: inventoryItem.quantity,
        remainingQuantity: 0,
      });
    } else {
      // Reduziere die Menge des Items
      await removeItemFromInventory(playerId, item.id, deleteQuantity);
      res.status(200).json({
        message: `Es wurden ${deleteQuantity} von "${item.name}" gelöscht.`,
        deletedQuantity: deleteQuantity,
        remainingQuantity: inventoryItem.quantity - deleteQuantity,
      });
    }
  } catch (error) {
    console.error('Fehler beim Löschen des Items:', error);
    res.status(500).json({ error: 'Datenbankfehler' });
  }
});

module.exports = router;
