// backend/Wald.js

const express = require('express');
const router = express.Router();
const cors = require('cors');

// Importiere die Datenzugriffsmodelle
const { getPlayerById, updatePlayerGathering } = require('./models/playerModel');
const { addGatheredMaterial } = require('./models/gatheredMaterialsModel');
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

// Route für das Sammeln von Ressourcen
router.post('/gather', getPlayer, async (req, res) => {
  const playerId = req.player.id;
  const now = new Date();

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Hole den aktuellen Spielerstatus
    const [playerRows] = await connection.query('SELECT * FROM players WHERE id = ?', [playerId]);
    const player = playerRows[0];

    // Überprüfen, ob Cooldown aktiv ist
    if (player.gather_cooldown_end_time && new Date(player.gather_cooldown_end_time) > now) {
      const remainingTimeMs = new Date(player.gather_cooldown_end_time) - now;
      const remainingMinutes = Math.ceil(remainingTimeMs / 60000);
      await connection.rollback();
      return res.status(429).json({
        message: `Cooldown aktiv. Bitte warte ${remainingMinutes} Minuten.`,
        cooldown: true,
        remainingTime: remainingTimeMs,
      });
    }

    // Sammelaktionen zählen
    let gatherCount = player.gather_count + 1;
    let cooldown = false;
    let cooldownEndTime = null;

    // Nach 3 Sammelaktionen Cooldown aktivieren
    if (gatherCount >= 3) {
      cooldown = true;
      cooldownEndTime = new Date(now.getTime() + 5 * 60 * 1000); // 5 Minuten
      gatherCount = 0; // Zurücksetzen nach Cooldown
    }

    // Definiere die verfügbaren Ressourcen
    const items = [
      { name: "Fichtenholz", type: "Material", category: "misc", worth: 3, strength: 0 },
      { name: "Rinde", type: "Material", category: "misc", worth: 2, strength: 0 },
      { name: "Stöcke", type: "Material", category: "misc", worth: 2, strength: 0 },
      { name: "Zapfen", type: "Material", category: "misc", worth: 1, strength: 0 },
      { name: "Pfifferlinge", type: "Material", category: "misc", worth: 3, strength: 0 },
      { name: "Steinpilze", type: "Material", category: "misc", worth: 3, strength: 0 },
      { name: "Harz", type: "Material", category: "misc", worth: 2, strength: 0 },
      { name: "Kräuter", type: "Material", category: "misc", worth: 2, strength: 0 },
      { name: "Ranken", type: "Material", category: "misc", worth: 2, strength: 0 },
    ];

    const addedItems = []; // Nur die tatsächlich hinzugefügten Items

    // Generiere zufällige Mengen für die Ressourcen
    const resourceQuantities = {
      "Fichtenholz": Math.floor(Math.random() * 5) + 1,       // 1 bis 5
      "Rinde": Math.floor(Math.random() * 3) + 1,            // 1 bis 3
      "Stöcke": Math.floor(Math.random() * 4) + 1,           // 1 bis 4
      "Zapfen": Math.floor(Math.random() * 2) + 1,           // 1 bis 2
      "Pfifferlinge": Math.floor(Math.random() * 3) + 1,     // 1 bis 3
      "Steinpilze": Math.floor(Math.random() * 3) + 1,       // 1 bis 3
      "Harz": Math.floor(Math.random() * 2) + 1,             // 1 bis 2
      "Kräuter": Math.floor(Math.random() * 2) + 1,         // 1 bis 2
      "Ranken": Math.floor(Math.random() * 2) + 1,           // 1 bis 2
    };

    // Iteriere durch alle möglichen Ressourcen und füge ggf. hinzu
    for (const item of items) {
      const quantity = resourceQuantities[item.name];
      if (quantity > 0) {
        let existingItem = await getItemByNameAndType(item.name, item.type, connection);

        if (!existingItem) {
          // Füge das Item zur Items-Tabelle hinzu, falls es noch nicht existiert
          const newItemId = await addItem({
            name: item.name,
            type: item.type,
            category: item.category,
            worth: item.worth,
            strength: item.strength,
            quantity: 0 // Initialerweise 0, da es im Inventar verwaltet wird
          }, connection);
          existingItem = await getItemByNameAndType(item.name, item.type, connection);
        }

        // Füge das Item zum Inventar hinzu
        await addItemToInventory(playerId, existingItem.id, quantity, connection);
        await addGatheredMaterial(playerId, { ...item, quantity }, connection);
        addedItems.push({ name: item.name, quantity });
      }
    }

    // Aktualisiere den Spielerstatus in der Datenbank
    await updatePlayerGathering(playerId, gatherCount, cooldown ? cooldownEndTime : null, connection);

    await connection.commit();

    res.status(201).json({
      message: 'Ressourcen erfolgreich gesammelt!',
      addedItems, // Nur die hinzugefügten Items zurückgeben
      cooldown: cooldown,
      cooldownEndTime: cooldown ? cooldownEndTime : null,
    });
  } catch (error) {
    await connection.rollback();
    console.error('Fehler beim Sammeln:', error);
    res.status(500).json({ error: 'Datenbankfehler' });
  } finally {
    connection.release();
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

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Entferne alle Items aus dem Inventar des Spielers
    await connection.query('DELETE FROM inventory WHERE player_id = ?', [playerId]);

    // Entferne alle gesammelten Materialien des Spielers
    await connection.query('DELETE FROM gathered_materials WHERE player_id = ?', [playerId]);

    // Optional: Setze den gather_count und cooldown zurück
    await updatePlayerGathering(playerId, 0, null, connection);

    await connection.commit();

    res.status(200).json({
      message: 'Inventar geleert.',
    });
  } catch (error) {
    await connection.rollback();
    console.error('Fehler beim Leeren des Inventars:', error);
    res.status(500).json({ error: 'Datenbankfehler' });
  } finally {
    connection.release();
  }
});

module.exports = router;
