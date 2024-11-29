// backend/Schmiede.js

const express = require('express');
const router = express.Router();
const cors = require('cors'); // Importiere CORS

// Importiere die Datenzugriffsmodelle
const { getPlayerById, updatePlayerStatus } = require('./models/playerModel');
const { getSmithyItems, getSmithyItemByName, decreaseSmithyItemQuantity } = require('./models/smithyModel');
const { getItemByNameAndType, addItem } = require('./models/itemModel');
const { getInventoryByPlayerId, addItemToInventory, removeItemFromInventory } = require('./models/inventoryModel');
const { addQuestLog } = require('./models/questLogModel');

// Importiere die Middleware zur Spieleridentifikation
const { getPlayer } = require('./middlewares/getPlayer');

// Middleware zum Parsen von JSON
router.use(express.json());

// CORS-Konfiguration (falls nicht bereits global konfiguriert)
router.use(cors({
  origin: 'http://localhost:3001' // Passe die erlaubten Ursprünge nach Bedarf an
}));

// Hilfsfunktion: Wert eines Items ermitteln (für den Verkauf)
const getItemWorth = async (itemName, connection = null) => {
  const item = await getItemByNameAndType(itemName, null, connection);
  return item ? item.worth : 0; // Annahme: Wert ist der Verkaufswert
};

// Route: Spielerstatus abrufen
router.get('/player-status', getPlayer, async (req, res) => {
  const player = req.player;

  res.json({
    money: player.money,
    hp: player.hp,
    maxHp: player.max_hp,
    sleepCost: 10, // Beispielwert, falls benötigt
  });
});

// Route: Schlafen
router.post('/sleep', getPlayer, async (req, res) => {
  const playerId = req.player.id;
  const sleepCost = 10;

  try {
    const player = await getPlayerById(playerId);

    if (player.money >= sleepCost) {
      // Aktualisiere den Spielerstatus
      await updatePlayerStatus(playerId, {
        money: player.money - sleepCost,
        hp: player.max_hp
      });

      // Loggen des Schlafens
      await addQuestLog(playerId, 'Du hast geschlafen und bist wieder fit!');

      res.json({
        message: 'Du hast geschlafen und bist wieder fit!',
        playerStatus: {
          money: player.money - sleepCost,
          hp: player.max_hp,
          maxHp: player.max_hp,
        },
      });
    } else {
      res.status(400).json({ message: 'Nicht genug Geld, um zu schlafen.' });
    }
  } catch (error) {
    console.error('Fehler beim Schlafen:', error);
    res.status(500).json({ error: 'Datenbankfehler' });
  }
});

// Route: Alle Schmiede-Items abrufen
router.get('/items', getPlayer, async (req, res) => {
  try {
    const smithyItems = await getSmithyItems();
    res.json(smithyItems);
  } catch (error) {
    console.error('Fehler beim Abrufen der Schmiede-Items:', error);
    res.status(500).json({ error: 'Datenbankfehler' });
  }
});

// Route: Quest-Log abrufen
router.get('/quest-log', getPlayer, async (req, res) => {
  const playerId = req.player.id;

  try {
    const logs = await getQuestLogByPlayerId(playerId);
    res.json(logs);
  } catch (error) {
    console.error('Fehler beim Abrufen des Quest-Logs:', error);
    res.status(500).json({ error: 'Datenbankfehler' });
  }
});

// Route: Inventar abrufen
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

// Route: Item kaufen
router.post('/buy', getPlayer, async (req, res) => {
  const playerId = req.player.id;
  const { itemName } = req.body;

  if (!itemName) {
    return res.status(400).json({ message: 'Itemname ist erforderlich.' });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Hole das Schmiede-Item
    const smithyItem = await getSmithyItemByName(itemName, connection);

    if (!smithyItem) {
      await connection.rollback();
      return res.status(404).json({ message: 'Item nicht gefunden.' });
    }

    if (smithyItem.quantity <= 0) {
      await connection.rollback();
      return res.status(400).json({ message: 'Item ist ausverkauft.' });
    }

    const player = await getPlayerById(playerId, connection);

    if (player.money < smithyItem.price) {
      await connection.rollback();
      return res.status(400).json({ message: 'Nicht genug Geld, um das Item zu kaufen.' });
    }

    // Deduziere den Preis vom Spieler
    await updatePlayerStatus(playerId, {
      money: player.money - smithyItem.price
    }, connection);

    // Reduziere die Menge des Items in der Schmiede
    await decreaseSmithyItemQuantity(smithyItem.id, 1, connection);

    // Füge das Item zum Inventar hinzu
    await addItemToInventory(playerId, smithyItem.id, 1, connection);

    // Loggen des Kaufs
    await addQuestLog(playerId, `Gekauft: ${smithyItem.name} für ${smithyItem.price} Münzen.`);

    await connection.commit();

    res.json({
      message: `${smithyItem.name} wurde gekauft.`,
      playerStatus: {
        money: player.money - smithyItem.price,
        hp: player.hp,
        maxHp: player.max_hp,
      },
      smithyItems: await getSmithyItems(connection),
      inventory: await getInventoryByPlayerId(playerId, connection),
      questLog: await getQuestLogByPlayerId(playerId, connection),
    });
  } catch (error) {
    await connection.rollback();
    console.error('Fehler beim Kaufen des Items:', error);
    res.status(500).json({ error: 'Datenbankfehler' });
  } finally {
    connection.release();
  }
});

// Route: Item verkaufen für Equipment
router.post('/sell', getPlayer, async (req, res) => {
  const playerId = req.player.id;
  const { itemName, strength, worth } = req.body;

  console.log(`Received sell request for item: ${itemName}, Stärke: ${strength}, Wert: ${worth}`);

  if (!itemName || strength === undefined || worth === undefined) {
    return res.status(400).json({ message: 'Itemname, Stärke und Wert sind erforderlich.' });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Finde das Item im Inventar basierend auf Name, Stärke und Wert sowie Kategorie 'equipment'
    const [rows] = await connection.query(
      `
      SELECT inventory.item_id, inventory.quantity
      FROM inventory
      JOIN items ON inventory.item_id = items.id
      WHERE inventory.player_id = ? AND items.name = ? AND items.strength = ? AND items.worth = ? AND items.category = 'equipment'
      `,
      [playerId, itemName, strength, worth]
    );

    if (rows.length === 0) {
      await connection.rollback();
      console.log(`Item nicht gefunden: Name=${itemName}, Stärke=${strength}, Wert=${worth}`);
      return res.status(404).json({ message: 'Item nicht im Inventar gefunden.' });
    }

    const inventoryItem = rows[0];

    if (inventoryItem.quantity <= 0) {
      await connection.rollback();
      return res.status(400).json({ message: 'Nicht genügend Items zum Verkaufen.' });
    }

    // Hole das Item aus der Items-Tabelle
    const item = await getItemById(inventoryItem.item_id, connection);
    if (!item) {
      await connection.rollback();
      return res.status(404).json({ message: 'Item nicht gefunden.' });
    }

    // Bestimme den Verkaufspreis (hier nehmen wir den 'worth' Wert)
    const itemWorth = item.worth;

    if (itemWorth === 0) {
      await connection.rollback();
      return res.status(400).json({ message: 'Wert des Items konnte nicht ermittelt werden.' });
    }

    // Reduziere die Menge des Items im Inventar
    await removeItemFromInventory(playerId, inventoryItem.item_id, 1, connection);

    // Erhöhe das Spieler-Geld
    const player = await getPlayerById(playerId, connection);
    await updatePlayerStatus(playerId, {
      money: player.money + itemWorth
    }, connection);

    // Loggen des Verkaufs
    await addQuestLog(playerId, `Verkauft: ${item.name} für ${itemWorth} Münzen.`);

    await connection.commit();

    res.json({
      message: `${item.name} wurde verkauft für ${itemWorth} Münzen.`,
      playerStatus: {
        money: player.money + itemWorth,
        hp: player.hp,
        maxHp: player.max_hp,
      },
      inventory: await getInventoryByPlayerId(playerId, connection),
      questLog: await getQuestLogByPlayerId(playerId, connection),
    });
  } catch (error) {
    await connection.rollback();
    console.error('Fehler beim Verkaufen des Items:', error);
    res.status(500).json({ error: 'Datenbankfehler' });
  } finally {
    connection.release();
  }
});

// Route: Quest annehmen
router.post('/accept-quest', getPlayer, async (req, res) => {
  const playerId = req.player.id;
  const questCooldown = 5 * 60 * 1000; // 5 Minuten
  const maxCompletedQuestsBeforeCooldown = 3;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Hole den aktuellen Spielerstatus
    const player = await getPlayerById(playerId, connection);

    // Überprüfe den Cooldown
    if (player.completed_quests_count >= maxCompletedQuestsBeforeCooldown) {
      const lastCooldownEnd = new Date(player.gather_cooldown_end_time);
      const now = new Date();
      if (lastCooldownEnd && lastCooldownEnd > now) {
        const remainingTimeMs = lastCooldownEnd - now;
        const remainingMinutes = Math.ceil(remainingTimeMs / 60000);
        await connection.rollback();
        return res.status(400).json({ message: `Cooldown aktiv. Bitte warte ${remainingMinutes} Minuten.` });
      } else {
        // Setze den Zähler zurück
        await updatePlayerStatus(playerId, {
          completed_quests_count: 0,
          gather_cooldown_end_time: null
        }, connection);
      }
    }

    // Überprüfe die Anzahl der aktiven Quests (angenommen, max 3)
    const [activeQuests] = await connection.query(
      'SELECT * FROM active_quests WHERE player_id = ?',
      [playerId]
    );

    if (activeQuests.length >= 3) {
      await connection.rollback();
      return res.status(400).json({ message: 'Du hast bereits die maximale Anzahl an aktiven Quests (3).' });
    }

    // Generiere eine zufällige Quest
    const newQuest = generateRandomQuest();

    // Füge die neue Quest zur aktiven Quest-Tabelle hinzu
    await connection.query(
      `INSERT INTO active_quests (player_id, quest_id, name, requirements, location, completed) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        playerId,
        newQuest.id,
        newQuest.name,
        JSON.stringify(newQuest.requirements),
        newQuest.location,
        false
      ]
    );

    // Loggen der Quest-Annahme
    await addQuestLog(playerId, `Neue Quest angenommen: ${newQuest.name} in ${newQuest.location}.`);

    // Erhöhe den abgeschlossenen Quest-Zähler
    await updatePlayerStatus(playerId, {
      completed_quests_count: player.completed_quests_count
    }, connection);

    await connection.commit();

    res.json({
      message: 'Neue Quest angenommen.',
      quest: newQuest, // Sende die gesamte Quest mit ID zurück
      activeQuests: await getActiveQuestsByPlayerId(playerId, connection),
      questLog: await getQuestLogByPlayerId(playerId, connection),
    });
  } catch (error) {
    await connection.rollback();
    console.error('Fehler beim Annehmen der Quest:', error);
    res.status(500).json({ error: 'Datenbankfehler' });
  } finally {
    connection.release();
  }
});

// Route: Aktive Quests abrufen
router.get('/quests', getPlayer, async (req, res) => {
  const playerId = req.player.id;

  try {
    const activeQuests = await getActiveQuestsByPlayerId(playerId);
    res.json(activeQuests);
  } catch (error) {
    console.error('Fehler beim Abrufen der aktiven Quests:', error);
    res.status(500).json({ error: 'Datenbankfehler' });
  }
});

// Route: Quest abschließen
router.post('/complete-quest', getPlayer, async (req, res) => {
  const playerId = req.player.id;
  const { questId } = req.body; // Verwende questId statt questName

  if (!questId) {
    return res.status(400).json({ message: 'Quest-ID wird benötigt.' });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Finde die aktive Quest
    const [questRows] = await connection.query(
      'SELECT * FROM active_quests WHERE player_id = ? AND quest_id = ?',
      [playerId, questId]
    );

    if (questRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Aktive Quest nicht gefunden.' });
    }

    const quest = questRows[0];

    if (quest.completed) {
      await connection.rollback();
      return res.status(400).json({ message: 'Quest bereits abgeschlossen!' });
    }

    const requirements = JSON.parse(quest.requirements);

    // Überprüfe, ob der Spieler die Anforderungen erfüllt
    const [inventory] = await connection.query(
      `
      SELECT items.name, inventory.quantity
      FROM inventory
      JOIN items ON inventory.item_id = items.id
      WHERE inventory.player_id = ?
      `,
      [playerId]
    );

    const missingItems = requirements.filter(req => {
      const inventoryItem = inventory.find(item => item.name === req.name);
      return !inventoryItem || inventoryItem.quantity < req.quantity;
    });

    if (missingItems.length > 0) {
      await connection.rollback();
      return res.status(400).json({
        message: 'Nicht genügend Gegenstände, um die Quest abzuschließen.',
        missingItems,
      });
    }

    // Ziehe die benötigten Gegenstände ab
    for (const req of requirements) {
      const [itemRows] = await connection.query(
        'SELECT id, quantity FROM items WHERE name = ? AND category = "equipment"',
        [req.name]
      );

      if (itemRows.length === 0) continue;

      const item = itemRows[0];
      const inventoryItem = inventory.find(inv => inv.name === req.name);

      if (inventoryItem) {
        if (inventoryItem.quantity > req.quantity) {
          await connection.query(
            'UPDATE inventory SET quantity = quantity - ? WHERE player_id = ? AND item_id = ?',
            [req.quantity, playerId, item.id]
          );
        } else {
          await connection.query(
            'DELETE FROM inventory WHERE player_id = ? AND item_id = ?',
            [playerId, item.id]
          );
        }
      }
    }

    // Füge die Belohnung hinzu (z.B., Münzen oder neue Items)
    const rewardMoney = 10;
    await updatePlayerStatus(playerId, {
      money: req.player.money + rewardMoney
    }, connection);

    // Logge den Quest-Abschluss
    await addQuestLog(playerId, `Quest abgeschlossen: ${quest.name}. Belohnung erhalten! ${rewardMoney} Münzen`);

    // Entferne die Quest aus den aktiven Quests
    await connection.query(
      'DELETE FROM active_quests WHERE player_id = ? AND quest_id = ?',
      [playerId, questId]
    );

    // Erhöhe den abgeschlossenen Quest-Zähler
    await connection.query(
      'UPDATE players SET completed_quests_count = completed_quests_count + 1 WHERE id = ?',
      [playerId]
    );

    // Überprüfe, ob ein Cooldown gestartet werden muss
    const [updatedPlayerRows] = await connection.query('SELECT completed_quests_count FROM players WHERE id = ?', [playerId]);
    const updatedPlayer = updatedPlayerRows[0];

    if (updatedPlayer.completed_quests_count >= 3) {
      const cooldownEndTime = new Date(Date.now() + 5 * 60 * 1000); // 5 Minuten
      await updatePlayerStatus(playerId, {
        gather_cooldown_end_time: cooldownEndTime,
        completed_quests_count: 0
      }, connection);

      // Loggen des Cooldowns
      await addQuestLog(playerId, `Cooldown gestartet: 5 Minuten. Du kannst jetzt keine neuen Quests annehmen.`);
    }

    await connection.commit();

    res.json({
      message: 'Quest abgeschlossen!',
      playerStatus: {
        money: req.player.money + rewardMoney,
        hp: req.player.hp,
        maxHp: req.player.max_hp,
      },
      inventory: await getInventoryByPlayerId(playerId, connection),
      questLog: await getQuestLogByPlayerId(playerId, connection),
      activeQuests: await getActiveQuestsByPlayerId(playerId, connection),
    });
  } catch (error) {
    await connection.rollback();
    console.error('Fehler beim Abschließen der Quest:', error);
    res.status(500).json({ error: 'Datenbankfehler' });
  } finally {
    connection.release();
  }
});

// Route: Item hinzufügen (nur zu Testzwecken)
router.post('/add-item', getPlayer, async (req, res) => {
  const playerId = req.player.id;
  const { itemName, type, category, worth, strength, quantity } = req.body;

  if (!itemName || !type || !category || worth === undefined || strength === undefined || quantity === undefined) {
    return res.status(400).json({ message: 'Alle Felder sind erforderlich.' });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    let existingItem = await getItemByNameAndType(itemName, type, connection);

    if (!existingItem) {
      // Füge das Item zur Items-Tabelle hinzu
      const newItemId = await addItem({
        name: itemName,
        type,
        category,
        worth,
        strength,
        quantity: 0 // Initialisieren bei 0, da es ins Inventar gelegt wird
      }, connection);
      existingItem = await getItemByNameAndType(itemName, type, connection);
    }

    // Füge das Item zum Inventar hinzu
    await addItemToInventory(playerId, existingItem.id, quantity, connection);

    // Loggen des Hinzufügens
    await addQuestLog(playerId, `Hinzugefügt: ${itemName} (Kategorie: ${category}) für ${quantity} Stück.`);

    await connection.commit();

    res.json({
      message: `${itemName} wurde dem Inventar hinzugefügt.`,
      inventory: await getInventoryByPlayerId(playerId, connection),
      questLog: await getQuestLogByPlayerId(playerId, connection),
    });
  } catch (error) {
    await connection.rollback();
    console.error('Fehler beim Hinzufügen des Items:', error);
    res.status(500).json({ error: 'Datenbankfehler' });
  } finally {
    connection.release();
  }
});

module.exports = router;
