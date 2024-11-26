// backend/Dungeon.js

const express = require('express');
const router = express.Router();
const { inventoryItems, PlayerHP, PlayerMaxHP, playerMoney, playerEP, MaxDifficulty } = require('./Inventar_Inhalt');

// Middleware zum Parsen von JSON
router.use(express.json());

// CORS-Konfiguration
const cors = require('cors');
router.use(cors({
  origin: 'http://localhost:3001' // Erlaube nur Anfragen von diesem Ursprung
}));

// Game State (in-memory, für Produktion sollte eine Datenbank verwendet werden)
let gameState = {
  difficulty: 1,
  roomsCompleted: 0, // Raumzähler
  currentWeapon: null,
  playerHP: PlayerHP[0],
  playerMaxHP: PlayerMaxHP[0],
  playerMoney: playerMoney[0],
  playerEP: playerEP[0], // EP hinzufügen
};

// Listen für Loot
const potions = inventoryItems.filter(item => item.type === 'Trank');

// Definiere die unlockDifficulty für jede Trankart
const potionUnlockDifficulty = {
  'Kleiner Heiltrank': 1,  // Verfügbar ab Schwierigkeitsgrad 1
  'Normaler Heiltrank': 3,  // Verfügbar ab Schwierigkeitsgrad 3
  'Großer Heiltrank': 5,    // Verfügbar ab Schwierigkeitsgrad 5
  'Mega Heiltrank': 7,      // Verfügbar ab Schwierigkeitsgrad 7
  'Mana-Trank': 9           // Verfügbar ab Schwierigkeitsgrad 9
};

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

// Utility Funktionen
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// GET Difficulty
router.get('/difficulty', (req, res) => {
  res.json({ difficulty: gameState.difficulty, multiplier: gameState.difficulty });
});

// POST Difficulty
router.post('/difficulty', (req, res) => {
  const { difficulty } = req.body;
  
  // Validierung: difficulty muss eine ganze Zahl zwischen 1 und MaxDifficulty[0] +1 sein
  if (!difficulty || typeof difficulty !== 'number' || difficulty < 1) {
    return res.status(400).json({ message: 'Ungültiger Schwierigkeitsgrad. Muss eine ganze Zahl ab 1 sein.' });
  }

  if (difficulty > MaxDifficulty[0] + 1) {
    return res.status(400).json({ message: `Schwierigkeitsgrad kann nur auf ${MaxDifficulty[0] + 1} erhöht werden.` });
  }

  if (difficulty > gameState.difficulty) {
    // Erhöhen der Schwierigkeitsstufe
    if (difficulty === gameState.difficulty + 1 && gameState.roomsCompleted >= 20) {
      gameState.difficulty = difficulty;
      gameState.roomsCompleted = 0;

      // Update MaxDifficulty, falls notwendig
      if (difficulty > MaxDifficulty[0]) {
        MaxDifficulty[0] = difficulty;
      }

      // Update Player EP im Spielzustand
      gameState.playerEP = playerEP[0];

      res.json({ message: `Schwierigkeitsgrad auf ${difficulty} gesetzt.` });
    } else {
      res.status(400).json({ message: 'Nicht genug Räume abgeschlossen oder ungültiger Schwierigkeitsgrad.' });
    }
  } else if (difficulty < gameState.difficulty) {
    // Verringern der Schwierigkeitsstufe
    gameState.difficulty = difficulty;
    res.json({ message: `Schwierigkeitsgrad auf ${difficulty} verringert.` });
  } else {
    // Schwierigkeit bleibt gleich
    res.json({ message: `Schwierigkeitsgrad bleibt bei ${difficulty}.` });
  }
});

// GET Weapon
router.get('/weapon', (req, res) => {
  res.json({ currentWeapon: gameState.currentWeapon });
});

// POST Weapon
router.post('/weapon', (req, res) => {
  const { weaponName } = req.body;
  if (!weaponName) {
    return res.status(400).json({ message: 'Kein Waffenname angegeben.' });
  }

  const weapon = inventoryItems.find(item => item.name === weaponName && item.type === 'weapon');

  if (weapon) {
    gameState.currentWeapon = weapon;
    res.json({ message: `Waffe ${weaponName} ausgerüstet.`, currentWeapon: gameState.currentWeapon });
  } else {
    res.status(400).json({ message: 'Waffe nicht gefunden oder ungültig.' });
  }
});

// GET Inventory
router.get('/inventory', (req, res) => {
  res.json({ inventoryItems });
});

// GET Player Stats
router.get('/player-stats', (req, res) => {
  res.json({
    PlayerHP: PlayerHP[0],
    PlayerMaxHP: PlayerMaxHP[0],
    playerMoney: playerMoney[0],
    playerEP: playerEP[0], // EP hinzufügen
    roomsCompleted: gameState.roomsCompleted,
    MaxDifficulty: MaxDifficulty[0] // MaxDifficulty hinzufügen
  });
});

// GET Event
router.get('/event', (req, res) => {
  const events = ['kampf', 'truhe', 'falle', 'leer'];
  const selectedEvent = events[getRandomInt(0, events.length - 1)];
  const roomName = eventNames[getRandomInt(0, eventNames.length - 1)];

  res.json({ event: selectedEvent, roomName });
});

// POST Event
router.post('/event', (req, res) => {
  const { event, roomName } = req.body;

  if (!event || !roomName) {
    return res.status(400).json({ message: 'Ungültige Event-Daten.' });
  }

  switch (event) {
    case 'kampf':
      handleFight(res);
      break;
    case 'truhe':
      handleChest(res);
      break;
    case 'falle':
      handleTrap(res);
      break;
    case 'leer':
      handleEmptyRoom(res);
      break;
    default:
      res.status(400).json({ message: 'Ungültiges Event.' });
  }
});

// Kampf Handler
const handleFight = (res) => {
  // PlayerHP neu abrufen
  gameState.playerHP = PlayerHP[0];
  
  if (!gameState.currentWeapon) {
    return res.status(400).json({ message: 'Keine Waffe ausgerüstet.' });
  }

  // Gegner erstellen
  const enemyName = enemyNames[getRandomInt(0, enemyNames.length - 1)];
  const enemyHP = getRandomInt(6, 14) * gameState.difficulty;
  const enemyDamage = getRandomInt(2, 5) * gameState.difficulty;

  let playerCurrentHP = gameState.playerHP;
  let enemyCurrentHP = enemyHP;

  // Kampf Schleife
  while (playerCurrentHP > 0 && enemyCurrentHP > 0) {
    // Spieler greift zuerst an
    enemyCurrentHP -= gameState.currentWeapon.strength;
    if (enemyCurrentHP <= 0) break;

    // Gegner greift an
    let damageReceived = enemyDamage;
    gameState.playerHP -= damageReceived;
    playerCurrentHP = gameState.playerHP;
  }

  if (playerCurrentHP > 0) {
    // Spieler gewinnt
    const moneyEarned = getRandomInt(1, 8) * gameState.difficulty;
    const epEarned = getRandomInt(2, 5) * gameState.difficulty; // EP skalieren mit difficulty
    gameState.playerMoney += moneyEarned;
    gameState.playerEP += epEarned; // EP hinzufügen
    playerMoney[0] = gameState.playerMoney;
    playerEP[0] = gameState.playerEP;
    gameState.roomsCompleted += 1; // Raumzähler erhöht
    gameState.playerHP = playerCurrentHP;
    PlayerHP[0] = gameState.playerHP;

    res.json({ 
      message: `Du hast gegen ${enemyName} gekämpft und gewonnen! Du erhältst ${moneyEarned} Gold und ${epEarned} EP.` 
    });
  } else {
    // Spieler verliert
    const moneyLost = Math.floor(gameState.playerMoney * (getRandomInt(10, 50) / 100));
    gameState.playerMoney -= moneyLost;
    gameState.roomsCompleted = 0; // Raumzähler zurückgesetzt
    gameState.playerHP = gameState.playerMaxHP;
    PlayerHP[0] = gameState.playerHP;
    playerMoney[0] = gameState.playerMoney;
    res.json({ 
      message: `Du wurdest von ${enemyName} besiegt! Du verlierst ${moneyLost} Gold und deine HP werden zurückgesetzt.` 
    });
  }
};

// Truhe Handler
const handleChest = (res) => {
  const loot = generateLoot();
  console.log(`Loot generiert: ${JSON.stringify(loot)}`); // Debugging-Log

  // Füge das Loot zum Inventar hinzu, falls es eine Waffe, Trank oder Material ist
  if (loot.type === 'weapon' || loot.type === 'Trank' || loot.type === 'Material') {
    const existingItem = inventoryItems.find(item => item.name === loot.name && item.type === loot.type);
    if (existingItem) {
      existingItem.quantity += 1;
      console.log(`Existierender Gegenstand aktualisiert: ${existingItem.name}, neue Menge: ${existingItem.quantity}`); // Debugging-Log
    } else {
      inventoryItems.push({
        name: loot.name,
        type: loot.type,
        worth: loot.worth || 0, // worth statt price
        strength: loot.strength || 0,
        category: loot.category,
        quantity: 1
      });
      console.log(`Neuer Gegenstand hinzugefügt: ${loot.name}`); // Debugging-Log
    }
  }
  gameState.roomsCompleted += 1; // Raumzähler erhöht
  res.json({ message: `Du hast eine Truhe gefunden! Du erhältst: ${loot.name}`, loot });
};

// Falle Handler
const handleTrap = (res) => {
  // PlayerHP neu abrufen
  gameState.playerHP = PlayerHP[0];
  
  const trapText = trapTexts[getRandomInt(0, trapTexts.length - 1)];
  let damage = getRandomInt(1, 3) * gameState.difficulty;

  gameState.playerHP -= damage;
  PlayerHP[0] = gameState.playerHP;

  console.log(`Falle ausgelöst: ${trapText}, Schaden: ${damage}`); // Debugging-Log

  if (gameState.playerHP > 0) {
    res.json({ message: `${trapText} Du erleidest ${damage} Schaden.` });
  } else {
    // Spieler stirbt
    const moneyLost = Math.floor(gameState.playerMoney * (getRandomInt(10, 50) / 100));
    gameState.playerMoney -= moneyLost;
    gameState.roomsCompleted = 0; // Raumzähler zurückgesetzt
    gameState.playerHP = gameState.playerMaxHP;
    PlayerHP[0] = gameState.playerHP;
    playerMoney[0] = gameState.playerMoney;
    res.json({ message: `Du hast eine tödliche Falle ausgelöst! Du verlierst ${moneyLost} Gold und deine HP werden zurückgesetzt.` });
  }
};

// Leerer Raum Handler
const handleEmptyRoom = (res) => {
  gameState.roomsCompleted += 1; // Raumzähler erhöht
  res.json({ message: 'Der Raum ist leer. Nichts passiert.' });
};

// Loot Erstellung: Tränke, Waffen, Materialien
const generateLoot = () => {
  // Bestimme, basierend auf dem Schwierigkeitsgrad, welche Lootkategorien verfügbar sind
  const lootCategories = ['Trank', 'weapon', 'Material'];

  // Wähle eine zufällige Lootkategorie
  const selectedCategory = lootCategories[getRandomInt(0, lootCategories.length - 1)];
  console.log(`Loot Kategorie ausgewählt: ${selectedCategory}`); // Debugging-Log

  let loot;

  switch (selectedCategory) {
    case 'Trank':
      // Filtere Tränke basierend auf der aktuellen Schwierigkeitsstufe
      const availablePotions = potions.filter(potion => {
        const unlock = potionUnlockDifficulty[potion.name];
        return unlock === gameState.difficulty && potion.quantity > 0;
      });
      console.log(`Verfügbare Tränke für Schwierigkeitsgrad ${gameState.difficulty}: ${availablePotions.map(p => p.name).join(', ')}`); // Debugging-Log
      if (availablePotions.length === 0) {
        // Wenn keine Tränke verfügbar sind, generiere kein Loot
        console.log('Keine Tränke verfügbar.');
        return { name: 'Nichts', type: 'none' };
      }
      loot = availablePotions[getRandomInt(0, availablePotions.length - 1)];
      break;
    case 'weapon':
      // Erstelle eine zufällige Waffe
      const weaponName = weaponNames[getRandomInt(0, weaponNames.length - 1)];
      const weaponStrength = getRandomInt(2, 4) * gameState.difficulty;
      const weaponWorth = Math.floor((getRandomInt(2, 5) * gameState.difficulty) / 2); // Halbiere den Wert und runde ab
      loot = {
        name: weaponName,
        type: 'weapon',
        category: 'equipment',
        strength: weaponStrength,
        worth: weaponWorth
      };
      console.log(`Waffe generiert: ${JSON.stringify(loot)}`); // Debugging-Log
      break;
    case 'Material':
      const materialName = materialNames[getRandomInt(0, materialNames.length - 1)];
      const materialWorth = Math.floor((getRandomInt(2, 5) * gameState.difficulty) / 2); // Halbiere den Wert und runde ab
      loot = {
        name: materialName,
        type: 'Material',
        strength: 0,
        category: 'misc',
        worth: materialWorth
      };
      console.log(`Material generiert: ${JSON.stringify(loot)}`); // Debugging-Log
      break;
    default:
      loot = { name: 'Nichts', type: 'none' };
  }

  return loot;
};

// POST Drink Potion
router.post('/drink-potion', (req, res) => {
  const { potionName } = req.body;

  if (!potionName) {
    return res.status(400).json({ message: 'Kein Trankname angegeben.' });
  }

  // Finde den Trank im Inventar
  const potionIndex = inventoryItems.findIndex(item => item.name === potionName && item.type === 'Trank');

  if (potionIndex === -1) {
    return res.status(400).json({ message: 'Trank nicht gefunden im Inventar.' });
  }

  const potion = inventoryItems[potionIndex];

  if (potion.quantity < 1) {
    return res.status(400).json({ message: 'Keine Tränke mehr vorhanden.' });
  }

  // Trank konsumieren
  potion.quantity -= 1;
  console.log(`Trank konsumiert: ${potion.name}, verbleibende Menge: ${potion.quantity}`); // Debugging-Log

  // Erhöhe die HP des Spielers, aber nicht über PlayerMaxHP
  const healedAmount = potion.strength;
  const newHP = Math.min(gameState.playerHP + healedAmount, gameState.playerMaxHP);
  const actualHealed = newHP - gameState.playerHP;
  gameState.playerHP = newHP;
  PlayerHP[0] = gameState.playerHP;

  // Aktualisiere das Inventar
  inventoryItems[potionIndex] = potion;

  res.json({ message: `Du hast ${potion.name} getrunken und ${actualHealed} HP wiederhergestellt.` });
});

// Exportiere den Router
module.exports = router;