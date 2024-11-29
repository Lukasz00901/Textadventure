// backend/Dungeon.js

const express = require('express');
const router = express.Router();
const cors = require('cors');
const pool = require('./db'); // Datenbankverbindung
const { getPlayer, getPlayerMiddleware } = require('./middlewares/getPlayer'); // Middleware zur Spieleridentifikation
const {
  getPlayerById,
  updatePlayer,
  createPlayer
} = require('./models/playerModel');
const {
  getAllItems,
  getItemByNameAndType,
  addItem
} = require('./models/itemModel');
const {
  getInventoryByPlayerId,
  addItemToInventory,
  removeItemFromInventory
} = require('./models/inventoryModel');

// Middleware zum Parsen von JSON
router.use(express.json());

// CORS-Konfiguration
router.use(cors({
  origin: 'http://localhost:3001' // Erlaube nur Anfragen von diesem Ursprung
}));

// Importiere die Middleware zur Spieleridentifikation
const { getPlayer: identifyPlayer } = require('./middlewares/getPlayer');

// Utility Funktion zur Generierung einer zufälligen Ganzzahl zwischen min und max (inklusive)
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Event- und Gegnerlisten
const weaponNames = [
  'Rückenbrecher (Zweihänder)', 'Hauptspalte (Zweihänder)', 'Sturmspalter (Zweihänder)',
  'Rippenreißer (Zweihänder)', 'Donnerklinge (Zweihänder)', 'Sonnenwächter (Zweihänder)',
  'Sturmklinge (Einhänder)', 'Rundschneider (Einhänder)', 'Hornklinge (Einhänder)',
  'Eisenherz (Einhänder)', 'Schutzklinge (Einhänder)', 'Schildbrecher (Äxt)',
  'Eichenschneider (Äxt)', 'Kriegsspalter (Äxt)', 'Kreuzschneider (Äxt)',
  'Rückenbeil (Äxt)', 'Sturmspalter (Äxt)', 'Donnerbeil (Äxt)',
  'Feuerbeil (Äxt)', 'Nachtklinge (Dolche)', 'Gabel (Dolch)',
  'Edelklinge (Dolch)', 'Feldzahn (Dolch)', 'Blutfeder (Dolch)',
  'Nachtsplitter (Dolch)', 'Blutdorn (Dolch)', 'Winddolch (Dolch)',
  'Nachtdolch (Dolch)', 'Blutdolch (Dolch)', 'Blütendolch (Dolch)',
  'Edellanze', 'Stechlanze', 'Waldlanze', 'Mondlanze', 'Schattenlanze',
  'Dornenlanze', 'Frostlanze', 'Donnerlanze', 'Glutlanze', 'Feuerlanze',
  'Sternlanze', 'Wurfspeer', 'Sturmspeer', 'Langspeer', 'Stechspeer',
  'Himmelsspeer', 'Lichtspeer', 'Donnerspeer', 'Eisenspeer',
  'Steinbrecher (Keule)', 'Schlagkolben (Keule)', 'Schädelhammer (Keule)',
  'Schlachtkeule (Keule)', 'Knochenkeule (Keule)', 'Schutzkeule (Keule)',
  'Schädelspalter (Keule)', 'Sturmbrecher (Keule)', 'Mondbrecher (Keule)'
];

const armorNames = [
  'Lederharnisch', 'Kettenhemd', 'Plattenrüstung', 'Schuppenpanzer', 'Geweihter Schild',
  'Stahlrüstung', 'Drachenleder', 'Magische Robe', 'Titanharnisch', 'Silberpanzer'
];

const materialNames = [
  'Knochen', 'Leder', 'Fasern', 'Pelzreste', 'Stofffetzen', 'Steinscherben',
  'Metallfragmente', 'Treibholz', 'Staubpartikel', 'Kristallstücke',
  'Glasfragmente', 'Schrottteile', 'Kieseln', 'Fellbüschel'
];

const eventNames = ['Bibliothek', 'Speisekammer', 'Waffenkammer', 'Gang', 'Gemächer des Bösen', 'Küche'];

const enemyNames = ['Skelett', 'Troll', 'Zombie', 'Ratte', 'Stev', 'Bandit'];

const trapTexts = [
  'Du bist in eine Falle getappt und wirst von Dornen getroffen.',
  'Eine versteckte Falle schnappte zu und du erleidest Schaden.',
  'Eine Pfeilfalle aktiviert sich und trifft dich.'
];

// Definiere die unlockDifficulty für jede Trankart
const potionUnlockDifficulty = {
  'Kleiner Heiltrank': 1,  // Verfügbar ab Schwierigkeitsgrad 1
  'Normaler Heiltrank': 3,  // Verfügbar ab Schwierigkeitsgrad 3
  'Großer Heiltrank': 5,    // Verfügbar ab Schwierigkeitsgrad 5
  'Mega Heiltrank': 7,      // Verfügbar ab Schwierigkeitsgrad 7
  'Mana-Trank': 9           // Verfügbar ab Schwierigkeitsgrad 9
};

// Definiere die unlockDifficulty für jede Rüstungsart
const armorUnlockDifficulty = {
  'Lederharnisch': 1,        // Verfügbar ab Schwierigkeitsgrad 1
  'Kettenhemd': 2,           // Verfügbar ab Schwierigkeitsgrad 2
  'Plattenrüstung': 3,       // Verfügbar ab Schwierigkeitsgrad 3
  'Schuppenpanzer': 4,       // Verfügbar ab Schwierigkeitsgrad 4
  'Geweihter Schild': 5,     // Verfügbar ab Schwierigkeitsgrad 5
  'Stahlrüstung': 6,         // Verfügbar ab Schwierigkeitsgrad 6
  'Drachenleder': 7,         // Verfügbar ab Schwierigkeitsgrad 7
  'Magische Robe': 8,        // Verfügbar ab Schwierigkeitsgrad 8
  'Titanharnisch': 9,        // Verfügbar ab Schwierigkeitsgrad 9
  'Silberpanzer': 10         // Verfügbar ab Schwierigkeitsgrad 10
};

// Define tavernItems inklusive Rüstungen und andere Items
const tavernItems = [
  // Getränke und Speisen
  { name: 'Bierkrug', type: 'Trank', strength: 0, worth: 3, category: 'drink', quantity: 20 },
  { name: 'Weinflasche', type: 'Trank', strength: 0, worth: 7, category: 'drink', quantity: 10 },
  { name: 'Braten', type: 'Speise', strength: 0, worth: 15, category: 'food', quantity: 8 },
  { name: 'Eintopf', type: 'Speise', strength: 0, worth: 6, category: 'food', quantity: 15 },
  { name: 'Honigwein', type: 'Trank', strength: 0, worth: 12, category: 'drink', quantity: 12 },
  { name: 'Käseplatte', type: 'Speise', strength: 0, worth: 18, category: 'food', quantity: 5 },

  // Rüstungen
  { name: 'Lederharnisch', type: 'amor', strength: 5, worth: 30, category: 'equipment', quantity: 10 },
  { name: 'Kettenhemd', type: 'amor', strength: 10, worth: 60, category: 'equipment', quantity: 8 },
  { name: 'Plattenrüstung', type: 'amor', strength: 15, worth: 120, category: 'equipment', quantity: 5 },
  // ... Füge weitere Rüstungen und Waffen entsprechend hinzu
];

// Handler-Funktionen für Events
const handleFight = async (req, res) => {
  const playerId = req.player.id;

  try {
    // Hole den Spieler mit ausgerüsteter Waffe und Rüstung
    const player = await getPlayerById(playerId);
    const weapon = player.current_weapon_id ? await getItemById(player.current_weapon_id) : null;
    const armor = player.current_amor_id ? await getItemById(player.current_amor_id) : null;

    if (!weapon) {
      return res.status(400).json({ message: 'Keine Waffe ausgerüstet.' });
    }

    // Gegner erstellen
    const enemyName = enemyNames[getRandomInt(0, enemyNames.length - 1)];
    const enemyHP = getRandomInt(6, 14) * player.max_difficulty;
    const enemyDamage = getRandomInt(2, 5) * player.max_difficulty;

    let playerCurrentHP = player.hp;
    let enemyCurrentHPVal = enemyHP;

    // Kampf Schleife
    while (playerCurrentHP > 0 && enemyCurrentHPVal > 0) {
      // Spieler greift zuerst an
      enemyCurrentHPVal -= weapon.strength;
      if (enemyCurrentHPVal <= 0) break;

      // Gegner greift an
      let damageReceived = enemyDamage;
      if (armor && armor.strength) {
        damageReceived = Math.max(enemyDamage - armor.strength, 0);
      }
      playerCurrentHP -= damageReceived;
    }

    if (playerCurrentHP > 0) {
      // Spieler gewinnt
      const moneyEarned = getRandomInt(1, 8) * player.max_difficulty;
      const epEarned = getRandomInt(2, 5) * player.max_difficulty;
      const roomsCompleted = (player.roomsCompleted || 0) + 1;
      let { money, ep, max_difficulty, playerLevel, nextEPThreshold, max_hp } = player;

      money += moneyEarned;
      ep += epEarned;

      // Level-Up Logik
      let levelUpMessage = '';
      while (ep >= nextEPThreshold) {
        playerLevel += 1;
        ep -= nextEPThreshold;
        nextEPThreshold = Math.round(nextEPThreshold * 1.5);
        max_hp += 5;
        levelUpMessage += `\nHerzlichen Glückwunsch! Du hast Level ${playerLevel} erreicht! Deine maximale HP wurde auf ${max_hp} erhöht.`;
      }

      // Aktualisiere den Spieler in der Datenbank
      await updatePlayer({
        id: playerId,
        money,
        hp: playerCurrentHP,
        max_hp,
        ep,
        max_difficulty,
        playerLevel,
        nextEPThreshold,
        roomsCompleted
      });

      let responseMessage = `Du hast gegen ${enemyName} gekämpft und gewonnen! Du erhältst ${moneyEarned} Münzen und ${epEarned} EP.`;

      if (levelUpMessage) {
        responseMessage += levelUpMessage;
      }

      res.json({ message: responseMessage });
    } else {
      // Spieler verliert
      const moneyLost = Math.floor(player.money * (getRandomInt(10, 50) / 100));
      const money = player.money - moneyLost;
      const hp = player.max_hp;
      const roomsCompleted = 0;

      await updatePlayer({
        id: playerId,
        money,
        hp,
        max_hp: player.max_hp,
        ep: player.ep,
        max_difficulty: player.max_difficulty,
        playerLevel: player.playerLevel,
        nextEPThreshold: player.nextEPThreshold,
        roomsCompleted
      });

      res.json({ message: `Du wurdest von ${enemyName} besiegt! Du verlierst ${moneyLost} Münzen und deine HP werden zurückgesetzt.` });
    }
  } catch (error) {
    console.error('Fehler beim Verarbeiten des Kampfes:', error);
    res.status(500).json({ message: 'Fehler beim Verarbeiten des Kampfes.' });
  }
};

const handleChest = async (req, res) => {
  const playerId = req.player.id;

  try {
    const loot = generateLoot(req.player.max_difficulty);
    console.log(`Loot generiert: ${JSON.stringify(loot)}`); // Debugging-Log

    if (loot.type === 'weapon' || loot.type === 'Trank' || loot.type === 'Material' || loot.type === 'amor') {
      const item = await getItemByNameAndType(loot.name, loot.type);

      if (item) {
        // Füge das Loot zum Inventar hinzu
        await addItemToInventory(playerId, item.id, 1);
      } else {
        // Wenn der Gegenstand noch nicht in der Datenbank ist, füge ihn hinzu
        const newItemId = await addItem({
          name: loot.name,
          type: loot.type,
          strength: loot.strength || null,
          worth: loot.worth || 0,
          category: loot.category || 'misc',
          quantity: 1
        });
        await addItemToInventory(playerId, newItemId, 1);
      }
    }

    // Erhöhe die Anzahl der abgeschlossenen Räume
    const roomsCompleted = (req.player.roomsCompleted || 0) + 1;

    // Aktualisiere den Spieler in der Datenbank
    await pool.query(
      'UPDATE players SET roomsCompleted = ? WHERE id = ?',
      [roomsCompleted, playerId]
    );

    res.json({ message: `Du hast eine Truhe gefunden! Du erhältst: ${loot.name}`, loot });
  } catch (error) {
    console.error('Fehler beim Verarbeiten der Truhe:', error);
    res.status(500).json({ message: 'Fehler beim Verarbeiten der Truhe.' });
  }
};

const handleTrap = async (req, res) => {
  const playerId = req.player.id;

  try {
    // Hole den Spieler
    const player = await getPlayerById(playerId);
    const armor = player.current_amor_id ? await getItemById(player.current_amor_id) : null;

    const trapText = trapTexts[getRandomInt(0, trapTexts.length - 1)];
    let damage = getRandomInt(1, 3) * player.max_difficulty;

    if (armor && armor.strength) {
      damage = Math.max(damage - armor.strength, 0);
    }

    let newHP = player.hp - damage;

    if (newHP > 0) {
      // Aktualisiere die HP des Spielers
      await pool.query(
        'UPDATE players SET hp = ? WHERE id = ?',
        [newHP, playerId]
      );

      res.json({ message: `${trapText} Du erleidest ${damage} Schaden.` });
    } else {
      // Spieler stirbt
      const moneyLost = Math.floor(player.money * (getRandomInt(10, 50) / 100));
      const money = player.money - moneyLost;
      const hp = player.max_hp;
      const roomsCompleted = 0;

      await updatePlayer({
        id: playerId,
        money,
        hp,
        max_hp: player.max_hp,
        ep: player.ep,
        max_difficulty: player.max_difficulty,
        playerLevel: player.playerLevel,
        nextEPThreshold: player.nextEPThreshold,
        roomsCompleted
      });

      res.json({ message: `Du hast eine tödliche Falle ausgelöst! Du verlierst ${moneyLost} Münzen und deine HP werden zurückgesetzt.` });
    }
  } catch (error) {
    console.error('Fehler beim Verarbeiten der Falle:', error);
    res.status(500).json({ message: 'Fehler beim Verarbeiten der Falle.' });
  }
};

const handleEmptyRoom = async (req, res) => {
  const playerId = req.player.id;

  try {
    // Erhöhe die Anzahl der abgeschlossenen Räume
    const roomsCompleted = (req.player.roomsCompleted || 0) + 1;

    // Aktualisiere den Spieler in der Datenbank
    await pool.query(
      'UPDATE players SET roomsCompleted = ? WHERE id = ?',
      [roomsCompleted, playerId]
    );

    res.json({ message: 'Der Raum ist leer. Nichts passiert.' });
  } catch (error) {
    console.error('Fehler beim Verarbeiten des leeren Raums:', error);
    res.status(500).json({ message: 'Fehler beim Verarbeiten des leeren Raums.' });
  }
};

// Loot Erstellung: Tränke, Waffen, Materialien, Amor
const generateLoot = (difficulty) => {
  // Bestimme, basierend auf dem Schwierigkeitsgrad, welche Lootkategorien verfügbar sind
  const lootCategories = ['Trank', 'weapon', 'Material', 'amor'];

  // Wähle eine zufällige Lootkategorie
  const selectedCategory = lootCategories[getRandomInt(0, lootCategories.length - 1)];
  console.log(`Loot Kategorie ausgewählt: ${selectedCategory}`);

  let loot;

  switch (selectedCategory) {
    case 'Trank':
      // Filtere Tränke basierend auf der aktuellen Schwierigkeitsstufe
      const availablePotions = tavernItems.filter(potion => 
        potion.type === 'Trank' && 
        potionUnlockDifficulty[potion.name] <= difficulty && 
        potion.quantity > 0
      );
      console.log(`Verfügbare Tränke für Schwierigkeitsgrad ${difficulty}: ${availablePotions.map(p => p.name).join(', ')}`);
      if (availablePotions.length === 0) {
        console.log('Keine Tränke verfügbar.');
        return { name: 'Nichts', type: 'none' };
      }
      loot = availablePotions[getRandomInt(0, availablePotions.length - 1)];
      break;

    case 'weapon':
      // Erstelle eine zufällige Waffe
      const weaponName = weaponNames[getRandomInt(0, weaponNames.length - 1)];
      const weaponStrength = getRandomInt(2, 4) * difficulty;
      const weaponWorth = Math.floor((getRandomInt(2, 5) * difficulty) / 2);
      loot = {
        name: weaponName,
        type: 'weapon',
        category: 'equipment',
        strength: weaponStrength,
        worth: weaponWorth
      };
      console.log(`Waffe generiert: ${JSON.stringify(loot)}`);
      break;

    case 'Material':
      // Erstelle eine zufällige Material
      const materialName = materialNames[getRandomInt(0, materialNames.length - 1)];
      const materialWorth = Math.floor((getRandomInt(2, 5) * difficulty) / 2);
      loot = {
        name: materialName,
        type: 'Material',
        strength: 0,
        category: 'misc',
        worth: materialWorth
      };
      console.log(`Material generiert: ${JSON.stringify(loot)}`);
      break;

    case 'amor':
      // Filtere Rüstungen basierend auf der aktuellen Schwierigkeitsstufe
      const availableArmors = armorNames.filter(armor => {
        const unlock = armorUnlockDifficulty[armor];
        return unlock <= difficulty;
      });

      console.log(`Verfügbare Rüstungen für Schwierigkeitsgrad ${difficulty}: ${availableArmors.join(', ')}`);

      if (availableArmors.length === 0) {
        console.log('Keine Rüstungen verfügbar.');
        return { name: 'Nichts', type: 'none' };
      }

      // Erstelle eine zufällige Rüstung aus den verfügbaren Rüstungen
      const amorName = availableArmors[getRandomInt(0, availableArmors.length - 1)];

      // Definieren der gewünschten Bereiche basierend auf dem Schwierigkeitsgrad
      const strengthMin = difficulty;
      const strengthMax = difficulty * 2;
      const worthMin = difficulty;
      const worthMax = difficulty * 2;

      const amorStrength = getRandomInt(strengthMin, strengthMax);
      const amorWorth = getRandomInt(worthMin, worthMax);

      loot = {
        name: amorName,
        type: 'amor',
        category: 'equipment',
        strength: amorStrength,
        worth: amorWorth
      };
      console.log(`Rüstung generiert: ${JSON.stringify(loot)}`);
      break;

    default:
      loot = { name: 'Nichts', type: 'none' };
  }

  return loot;
};

// GET Difficulty
router.get('/difficulty', identifyPlayer, async (req, res) => {
  const player = req.player;
  res.json({ difficulty: player.max_difficulty, multiplier: player.max_difficulty });
});

// POST Difficulty
router.post('/difficulty', identifyPlayer, async (req, res) => {
  const player = req.player;
  const { difficulty } = req.body;

  // Validierung: difficulty muss eine ganze Zahl ab 1 sein
  if (!difficulty || typeof difficulty !== 'number' || difficulty < 1) {
    return res.status(400).json({ message: 'Ungültiger Schwierigkeitsgrad. Muss eine ganze Zahl ab 1 sein.' });
  }

  try {
    if (difficulty > player.max_difficulty) {
      // Erhöhe die Schwierigkeitsstufe, wenn Bedingungen erfüllt sind
      if (difficulty === player.max_difficulty + 1 && player.roomsCompleted >= 20) {
        await pool.query(
          'UPDATE players SET max_difficulty = ?, roomsCompleted = 0 WHERE id = ?',
          [difficulty, player.id]
        );

        // Optionale Aktualisierungen wie Player EP
        // await pool.query('UPDATE players SET playerEP = ? WHERE id = ?', [player.playerEP, player.id]);

        res.json({ message: `Schwierigkeitsgrad auf ${difficulty} gesetzt.` });
      } else {
        res.status(400).json({ message: 'Nicht genug Räume abgeschlossen oder ungültiger Schwierigkeitsgrad.' });
      }
    } else if (difficulty < player.max_difficulty) {
      // Verringern der Schwierigkeitsstufe
      await pool.query(
        'UPDATE players SET max_difficulty = ? WHERE id = ?',
        [difficulty, player.id]
      );
      res.json({ message: `Schwierigkeitsgrad auf ${difficulty} verringert.` });
    } else {
      // Schwierigkeit bleibt gleich
      res.json({ message: `Schwierigkeitsgrad bleibt bei ${difficulty}.` });
    }
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Schwierigkeitsgrads:', error);
    res.status(500).json({ message: 'Fehler beim Aktualisieren des Schwierigkeitsgrads.' });
  }
});

// GET Weapon (Aktuell ausgerüstete Waffe abrufen)
router.get('/weapon', identifyPlayer, async (req, res) => {
  const player = req.player;

  try {
    const weapon = player.current_weapon_id ? await getItemById(player.current_weapon_id) : null;
    res.json({ currentWeapon: weapon });
  } catch (error) {
    console.error('Fehler beim Abrufen der Waffe:', error);
    res.status(500).json({ message: 'Fehler beim Abrufen der Waffe.' });
  }
});

// POST Weapon (Waffe ausrüsten)
router.post('/weapon', identifyPlayer, async (req, res) => {
  const playerId = req.player.id;
  const { weaponName } = req.body;

  if (!weaponName) {
    return res.status(400).json({ message: 'Kein Waffenname angegeben.' });
  }

  try {
    const weapon = await getItemByNameAndType(weaponName, 'weapon');
    if (!weapon) {
      return res.status(400).json({ message: 'Waffe nicht gefunden oder ungültig.' });
    }

    // Aktualisiere das current_weapon_id in der players-Tabelle
    await pool.query(
      'UPDATE players SET current_weapon_id = ? WHERE id = ?',
      [weapon.id, playerId]
    );

    res.json({ message: `Waffe ${weaponName} ausgerüstet.`, currentWeapon: weapon });
  } catch (error) {
    console.error('Fehler beim Ausrüsten der Waffe:', error);
    res.status(500).json({ message: 'Fehler beim Ausrüsten der Waffe.' });
  }
});

// GET Amor (Aktuell ausgerüstete Rüstung abrufen)
router.get('/amor', identifyPlayer, async (req, res) => {
  const player = req.player;

  try {
    const armor = player.current_amor_id ? await getItemById(player.current_amor_id) : null;
    res.json({ currentAmor: armor });
  } catch (error) {
    console.error('Fehler beim Abrufen der Rüstung:', error);
    res.status(500).json({ message: 'Fehler beim Abrufen der Rüstung.' });
  }
});

// POST Amor (Rüstung ausrüsten)
router.post('/amor', identifyPlayer, async (req, res) => {
  const playerId = req.player.id;
  const { amorName } = req.body;

  if (!amorName) {
    return res.status(400).json({ message: 'Kein Rüstungsname angegeben.' });
  }

  try {
    const armor = await getItemByNameAndType(amorName, 'amor');
    if (!armor) {
      return res.status(400).json({ message: 'Rüstung nicht gefunden oder ungültig.' });
    }

    // Aktualisiere das current_amor_id in der players-Tabelle
    await pool.query(
      'UPDATE players SET current_amor_id = ? WHERE id = ?',
      [armor.id, playerId]
    );

    res.json({ message: `Rüstung ${amorName} ausgerüstet.`, currentAmor: armor });
  } catch (error) {
    console.error('Fehler beim Ausrüsten der Rüstung:', error);
    res.status(500).json({ message: 'Fehler beim Ausrüsten der Rüstung.' });
  }
});

// GET Inventory
router.get('/inventory', identifyPlayer, async (req, res) => {
  const playerId = req.player.id;
  try {
    const inventory = await getInventoryByPlayerId(playerId);
    res.json({ inventory });
  } catch (error) {
    console.error('Fehler beim Abrufen des Inventars:', error);
    res.status(500).json({ message: 'Fehler beim Abrufen des Inventars.' });
  }
});

// GET Player Stats
router.get('/player-stats', identifyPlayer, async (req, res) => {
  const player = req.player;
  try {
    // Hole aktuell ausgerüstete Waffe und Rüstung
    const weapon = player.current_weapon_id ? await getItemById(player.current_weapon_id) : null;
    const armor = player.current_amor_id ? await getItemById(player.current_amor_id) : null;

    res.json({
      player: {
        id: player.id,
        name: player.name,
        money: player.money,
        hp: player.hp,
        max_hp: player.max_hp,
        ep: player.ep,
        max_difficulty: player.max_difficulty,
        playerLevel: player.playerLevel,
        nextEPThreshold: player.nextEPThreshold,
        roomsCompleted: player.roomsCompleted,
        currentWeapon: weapon,
        currentAmor: armor
      }
    });
  } catch (error) {
    console.error('Fehler beim Abrufen der Spielerstatistiken:', error);
    res.status(500).json({ message: 'Fehler beim Abrufen der Spielerstatistiken.' });
  }
});

// GET Event
router.get('/event', identifyPlayer, async (req, res) => {
  const player = req.player;
  const events = ['kampf', 'truhe', 'falle', 'leer'];
  const selectedEvent = events[getRandomInt(0, events.length - 1)];
  const roomName = eventNames[getRandomInt(0, eventNames.length - 1)];

  res.json({ event: selectedEvent, roomName });
});

// POST Event
router.post('/event', identifyPlayer, async (req, res) => {
  const { event, roomName } = req.body;

  if (!event || !roomName) {
    return res.status(400).json({ message: 'Ungültige Event-Daten.' });
  }

  switch (event) {
    case 'kampf':
      await handleFight(req, res);
      break;
    case 'truhe':
      await handleChest(req, res);
      break;
    case 'falle':
      await handleTrap(req, res);
      break;
    case 'leer':
      await handleEmptyRoom(req, res);
      break;
    default:
      res.status(400).json({ message: 'Ungültiges Event.' });
  }
});

// POST Drink Potion
router.post('/drink-potion', identifyPlayer, async (req, res) => {
  const playerId = req.player.id;
  const { potionName } = req.body;

  if (!potionName) {
    return res.status(400).json({ message: 'Kein Trankname angegeben.' });
  }

  try {
    // Finde den Trank
    const potion = await getItemByNameAndType(potionName, 'Trank');
    if (!potion) {
      return res.status(400).json({ message: 'Trank nicht gefunden im Inventar.' });
    }

    // Überprüfe die Menge im Inventar
    const inventory = await getInventoryByPlayerId(playerId);
    const potionEntry = inventory.find(item => item.id === potion.id);
    if (!potionEntry || potionEntry.quantity < 1) {
      return res.status(400).json({ message: 'Keine Tränke mehr vorhanden.' });
    }

    // Konsumiere den Trank
    await removeItemFromInventory(playerId, potion.id, 1);

    // Erhöhe die HP des Spielers, aber nicht über max_hp
    const newHP = Math.min(req.player.hp + (potion.strength || 0), req.player.max_hp);
    const actualHealed = newHP - req.player.hp;

    // Aktualisiere die HP in der Datenbank
    await pool.query(
      'UPDATE players SET hp = ? WHERE id = ?',
      [newHP, playerId]
    );

    res.json({ message: `Du hast ${potion.name} getrunken und ${actualHealed} HP wiederhergestellt.` });
  } catch (error) {
    console.error('Fehler beim Trinken des Tranks:', error);
    res.status(500).json({ message: 'Fehler beim Trinken des Tranks.' });
  }
});

// Exportiere den Router
module.exports = router;
