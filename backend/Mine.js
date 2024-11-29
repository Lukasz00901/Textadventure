// backend/Mine.js

const express = require('express');
const router = express.Router();
const cors = require('cors');

// Importiere die Datenzugriffsmodelle
const { getPlayerById, updatePlayerMining } = require('./models/playerModel');
const { addMinedMaterial } = require('./models/minedMaterialsModel');
const { getItemByNameAndType, addItem } = require('./models/itemModel');
const { getInventoryByPlayerId, addItemToInventory } = require('./models/inventoryModel');

// Importiere die Middleware zur Spieleridentifikation
const { getPlayer } = require('./middlewares/getPlayer');

// Middleware zum Parsen von JSON
router.use(express.json());

// CORS-Konfiguration (falls nicht bereits global konfiguriert)
router.use(cors({
  origin: 'http://localhost:3001' // Passe die erlaubten Ursprünge nach Bedarf an
}));

// Hilfsfunktion: Wert eines Items ermitteln (für den Verkauf)
const getItemWorth = async (itemName) => {
  const item = await getItemByNameAndType(itemName);
  return item ? item.worth : 0; // Annahme: Wert ist der Verkaufswert
};

// Route für das Mining von Erzen
router.post('/mine', getPlayer, async (req, res) => {
  const playerId = req.player.id;
  const now = new Date();

  try {
    // Hole den aktuellen Spielerstatus
    const player = await getPlayerById(playerId);

    // Überprüfen, ob Cooldown aktiv ist
    if (player.cooldown_end_time && new Date(player.cooldown_end_time) > now) {
      const remainingTimeMs = new Date(player.cooldown_end_time) - now;
      const remainingMinutes = Math.ceil(remainingTimeMs / 60000);
      return res.status(429).json({
        message: `Cooldown aktiv. Bitte warte ${remainingMinutes} Minuten.`,
        cooldown: true,
        remainingTime: remainingTimeMs,
      });
    }

    // Schürfaktionen zählen
    let mineCount = player.mine_count + 1;
    let cooldown = false;
    let cooldownEndTime = null;

    // Nach 3 Schürfaktionen Cooldown aktivieren
    if (mineCount >= 3) {
      cooldown = true;
      cooldownEndTime = new Date(now.getTime() + 5 * 60 * 1000); // 5 Minuten
      mineCount = 0; // Zurücksetzen nach Cooldown
    }

    // Definiere die verfügbaren Erze
    const items = [
      { name: "Eisenerz", type: "Material", category: "misc", worth: 3, strength: 0 },
      { name: "Kohle", type: "Material", category: "misc", worth: 2, strength: 0 },
      { name: "Golderz", type: "Material", category: "misc", worth: 4, strength: 0 },
      { name: "Silbererz", type: "Material", category: "misc", worth: 4, strength: 0 },
      { name: "Zinnerz", type: "Material", category: "misc", worth: 3, strength: 0 },
      { name: "Diamanten", type: "Material", category: "misc", worth: 6, strength: 0 },
      { name: "Kupfererz", type: "Material", category: "misc", worth: 2, strength: 0 },
      { name: "Zinkerz", type: "Material", category: "misc", worth: 2, strength: 0 },
      { name: "Schwefelerz", type: "Material", category: "misc", worth: 3, strength: 0 },
      { name: "Bleierz", type: "Material", category: "misc", worth: 3, strength: 0 },
      { name: "Lehm", type: "Material", category: "misc", worth: 3, strength: 0 },
      { name: "Kalkstein", type: "Material", category: "misc", worth: 3, strength: 0 },
      { name: "Schiefer", type: "Material", category: "misc", worth: 3, strength: 0 },
      { name: "Feuerstein", type: "Material", category: "misc", worth: 3, strength: 0 },
    ];

    const addedItems = []; // Nur die tatsächlich hinzugefügten Items

    // Iteriere durch alle möglichen Erze und füge ggf. hinzu
    for (const item of items) {
      const quantity = Math.floor(Math.random() * 3); // 0 bis 2 Einheiten
      if (quantity > 0) {
        let existingItem = await getItemByNameAndType(item.name, item.type);

        if (!existingItem) {
          // Füge das Item zur Items-Tabelle hinzu, falls es noch nicht existiert
          const newItemId = await addItem({
            name: item.name,
            type: item.type,
            category: item.category,
            worth: item.worth,
            strength: item.strength,
            quantity: 0 // Initialerweise 0, da es im Inventar verwaltet wird
          });
          existingItem = await getItemById(newItemId);
        }

        // Füge das Item zum Inventar hinzu
        await addItemToInventory(playerId, existingItem.id, quantity);
        addedItems.push({ name: item.name, quantity });
      }
    }

    // Aktualisiere den Spielerstatus in der Datenbank
    await updatePlayerMining(playerId, mineCount, cooldown ? cooldownEndTime : null);

    res.status(201).json({
      message: 'Erze erfolgreich geschürft!',
      addedItems, // Nur die hinzugefügten Items zurückgeben
      cooldown: cooldown,
      cooldownEndTime: cooldown ? cooldownEndTime : null,
    });
  } catch (error) {
    console.error('Fehler beim Mining:', error);
    res.status(500).json({ error: 'Datenbankfehler' });
  }
});

// Route, um das aktuelle Inventar abzurufen
router.get('/inventory', getPlayer, async (req, res) => {
  const playerId = req.player.id;

  try {
    const inventory = await getInventoryByPlayerId(playerId);
    res.status(200).json({
      message: 'Aktuelles Inventar abgerufen.',
      inventory: inventory,
    });
  } catch (error) {
    console.error('Fehler beim Abrufen des Inventars:', error);
    res.status(500).json({ error: 'Datenbankfehler' });
  }
});

// Route, um das Inventar zu löschen (z. B. zum Zurücksetzen)
router.delete('/inventory', getPlayer, async (req, res) => {
  const playerId = req.player.id;

  try {
    // Entferne alle Items aus dem Inventar des Spielers
    await pool.query('DELETE FROM inventory WHERE player_id = ?', [playerId]);

    // Optional: Setze den mine_count und cooldown zurück
    await updatePlayerMining(playerId, 0, null);

    res.status(200).json({
      message: 'Inventar geleert.',
    });
  } catch (error) {
    console.error('Fehler beim Leeren des Inventars:', error);
    res.status(500).json({ error: 'Datenbankfehler' });
  }
});

module.exports = router;
