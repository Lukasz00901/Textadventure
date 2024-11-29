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
  currentAmor: null, // Aktuelle Rüstung als 'amor'
  playerHP: PlayerHP[0],
  playerMaxHP: PlayerMaxHP[0],
  playerMoney: playerMoney[0],
  playerEP: playerEP[0], // EP hinzufügen
  playerLevel: 1, // Spielerlevel hinzufügen
  nextEPThreshold: 100 // Nächste EP-Schwelle
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

// Define tavernItems inklusive Rüstungen
const tavernItems = [
  // Getränke und Speisen
  { name: 'Bierkrug', type: 'Getränk', price: 5, worth: 3, quantity: 20, category: 'drink' },
  { name: 'Weinflasche', type: 'Getränk', price: 12, worth: 7, quantity: 10, category: 'drink' },
  { name: 'Braten', type: 'Speise', price: 20, worth: 15, quantity: 8, category: 'food' },
  { name: 'Eintopf', type: 'Speise', price: 10, worth: 6, quantity: 15, category: 'food' },
  { name: 'Honigwein', type: 'Getränk', price: 18, worth: 12, quantity: 12, category: 'drink' },
  { name: 'Käseplatte', type: 'Speise', price: 25, worth: 18, quantity: 5, category: 'food' },

  // Rüstungen
  { 
    name: 'Lederharnisch', 
    type: 'amor', 
    price: 50, 
    worth: 30, 
    quantity: 10, 
    category: 'equipment', 
    unlockDifficulty: armorUnlockDifficulty['Lederharnisch'] 
  },
  { 
    name: 'Kettenhemd', 
    type: 'amor', 
    price: 100, 
    worth: 60, 
    quantity: 8, 
    category: 'equipment', 
    unlockDifficulty: armorUnlockDifficulty['Kettenhemd'] 
  },
  { 
    name: 'Plattenrüstung', 
    type: 'amor', 
    price: 200, 
    worth: 120, 
    quantity: 5, 
    category: 'equipment', 
    unlockDifficulty: armorUnlockDifficulty['Plattenrüstung'] 
  },
  // ... Füge weitere Rüstungen entsprechend hinzu
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
  
  // Validierung: difficulty muss eine ganze Zahl ab 1 sein
  if (!difficulty || typeof difficulty !== 'number' || difficulty < 1) {
    return res.status(400).json({ message: 'Ungültiger Schwierigkeitsgrad. Muss eine ganze Zahl ab 1 sein.' });
  }

  // Erhöhen der Schwierigkeitsstufe
  if (difficulty > gameState.difficulty) {
    if (difficulty <= MaxDifficulty[0]) {
      // Setze auf eine bereits erreichte Schwierigkeit
      gameState.difficulty = difficulty;
      gameState.roomsCompleted = 0;
      res.json({ message: `Schwierigkeitsgrad auf ${difficulty} gesetzt.` });
    } else if (difficulty === MaxDifficulty[0] + 1 && gameState.roomsCompleted >= 20) {
      // Erhöhe auf eine neue Schwierigkeit
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

  // Sucht nach dem ersten Waffenitem, das übereinstimmt
  const weaponIndex = inventoryItems.findIndex(item => item.name === weaponName && item.type === 'weapon');

  if (weaponIndex !== -1) {
    const weapon = inventoryItems[weaponIndex];
    gameState.currentWeapon = weapon;
    res.json({ message: `Waffe ${weaponName} ausgerüstet.`, currentWeapon: gameState.currentWeapon });
  } else {
    res.status(400).json({ message: 'Waffe nicht gefunden oder ungültig.' });
  }
});

// GET Amor (statt Armor)
router.get('/amor', (req, res) => {
  res.json({ currentAmor: gameState.currentAmor });
});

// POST Amor (statt Armor)
router.post('/amor', (req, res) => {
  const { amorName, strength, worth } = req.body;
  if (!amorName) {
    return res.status(400).json({ message: 'Kein Rüstungsname angegeben.' });
  }

  // Sucht nach dem ersten passenden Armorsubset
  const amorIndex = inventoryItems.findIndex(item => 
    item.name === amorName && 
    item.type === 'amor' &&
    (strength === undefined || item.strength === strength) &&
    (worth === undefined || item.worth === worth)
  );

  if (amorIndex !== -1) {
    const amor = inventoryItems[amorIndex];
    gameState.currentAmor = amor;
    res.json({ message: `Rüstung ${amorName} ausgerüstet.`, currentAmor: gameState.currentAmor });
  } else {
    res.status(400).json({ message: 'Rüstung nicht gefunden oder ungültig.' });
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
    MaxDifficulty: MaxDifficulty[0], // MaxDifficulty hinzufügen
    currentAmor: gameState.currentAmor, // Aktuelle Rüstung hinzufügen
    playerLevel: gameState.playerLevel, // Spielerlevel hinzufügen
    nextEPThreshold: gameState.nextEPThreshold // Nächste EP-Schwelle hinzufügen
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
  let enemyCurrentHPVal = enemyHP;

  // Kampf Schleife
  while (playerCurrentHP > 0 && enemyCurrentHPVal > 0) {
    // Spieler greift zuerst an
    enemyCurrentHPVal -= gameState.currentWeapon.strength;
    if (enemyCurrentHPVal <= 0) break;

    // Gegner greift an
    let damageReceived = enemyDamage;
    if (gameState.currentAmor && gameState.currentAmor.strength) { // Änderung von currentArmor zu currentAmor
      damageReceived = Math.max(enemyDamage - gameState.currentAmor.strength, 0); // Änderung von currentArmor zu currentAmor
    }
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

    let levelUpMessage = '';

    // Check EP Threshold
    while (gameState.playerEP >= gameState.nextEPThreshold) {
      gameState.playerLevel += 1;
      gameState.playerEP -= gameState.nextEPThreshold;
      gameState.nextEPThreshold = Math.round(gameState.nextEPThreshold * 1.5); // Änderung von 2.1 zu 1.5
      gameState.playerMaxHP += 5;
      PlayerMaxHP[0] = gameState.playerMaxHP;
      levelUpMessage += `\nHerzlichen Glückwunsch! Du hast Level ${gameState.playerLevel} erreicht! Deine maximale HP wurde auf ${gameState.playerMaxHP} erhöht.`;
    }

    let responseMessage = `Du hast gegen ${enemyName} gekämpft und gewonnen! Du erhältst ${moneyEarned} Münzen und ${epEarned} EP.`;

    if (levelUpMessage) {
      responseMessage += levelUpMessage;
    }

    res.json({ 
      message: responseMessage 
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
      message: `Du wurdest von ${enemyName} besiegt! Du verlierst ${moneyLost} Münzen und deine HP werden zurückgesetzt.` 
    });
  }
};

// Truhe Handler
const handleChest = (res) => {
  const loot = generateLoot();
  console.log(`Loot generiert: ${JSON.stringify(loot)}`); // Debugging-Log

  // Füge das Loot zum Inventar hinzu, falls es eine Waffe, Trank, Material oder Amor ist
  if (loot.type === 'weapon' || loot.type === 'Trank' || loot.type === 'Material' || loot.type === 'amor') { 
    if (loot.type === 'weapon') {
      // **Waffen werden als separate Einträge hinzugefügt**
      inventoryItems.push({
        name: loot.name,
        type: loot.type,
        worth: loot.worth || 0,
        strength: loot.strength || 0,
        category: loot.category,
        quantity: 1
      });
      console.log(`Neue Waffe hinzugefügt: ${loot.name} mit Stärke ${loot.strength} und Wert ${loot.worth}`);
    } else if (loot.type === 'amor') {
      // **Rüstungen werden gestapelt, wenn Name, Stärke und Wert gleich sind**
      const existingArmor = inventoryItems.find(item => 
        item.name === loot.name && 
        item.type === 'amor' && 
        item.strength === loot.strength && 
        item.worth === loot.worth
      );

      if (existingArmor) {
        existingArmor.quantity += 1;
        console.log(`Existierende Rüstung gestapelt: ${existingArmor.name}, neue Menge: ${existingArmor.quantity}`);
      } else {
        inventoryItems.push({
          name: loot.name,
          type: loot.type,
          worth: loot.worth || 0,
          strength: loot.strength || 0,
          category: loot.category,
          quantity: 1
        });
        console.log(`Neue Rüstung hinzugefügt: ${loot.name} mit Stärke ${loot.strength} und Wert ${loot.worth}`);
      }
    } else {
      // **Andere Items (Tränke, Materialien) werden standardmäßig gestapelt**
      const existingItem = inventoryItems.find(item => item.name === loot.name && item.type === loot.type);
      if (existingItem) {
        existingItem.quantity += 1;
        console.log(`Existierender Gegenstand aktualisiert: ${existingItem.name}, neue Menge: ${existingItem.quantity}`);
      } else {
        inventoryItems.push({
          name: loot.name,
          type: loot.type,
          worth: loot.worth || 0,
          strength: loot.strength || 0,
          category: loot.category,
          quantity: 1
        });
        console.log(`Neuer Gegenstand hinzugefügt: ${loot.name}`);
      }
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

  if (gameState.currentAmor && gameState.currentAmor.strength) { 
    damage = Math.max(damage - gameState.currentAmor.strength, 0); 
  }

  gameState.playerHP -= damage;
  PlayerHP[0] = gameState.playerHP;

  console.log(`Falle ausgelöst: ${trapText}, Schaden: ${damage}`);

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
    res.json({ message: `Du hast eine tödliche Falle ausgelöst! Du verlierst ${moneyLost} Münzen und deine HP werden zurückgesetzt.` });
  }
};

// Leerer Raum Handler
const handleEmptyRoom = (res) => {
  gameState.roomsCompleted += 1; // Raumzähler erhöht
  res.json({ message: 'Der Raum ist leer. Nichts passiert.' });
};

// Loot Erstellung: Tränke, Waffen, Materialien, Amor
const generateLoot = () => {
  // Bestimme, basierend auf dem Schwierigkeitsgrad, welche Lootkategorien verfügbar sind
  const lootCategories = ['Trank', 'weapon', 'Material', 'amor'];

  // Wähle eine zufällige Lootkategorie
  const selectedCategory = lootCategories[getRandomInt(0, lootCategories.length - 1)];
  console.log(`Loot Kategorie ausgewählt: ${selectedCategory}`);

  let loot;

  switch (selectedCategory) {
    case 'Trank':
      // Filtere Tränke basierend auf der aktuellen Schwierigkeitsstufe
      const availablePotions = potions.filter(potion => {
        const unlock = potionUnlockDifficulty[potion.name];
        return unlock <= gameState.difficulty && potion.quantity > 0;
      });
      console.log(`Verfügbare Tränke für Schwierigkeitsgrad ${gameState.difficulty}: ${availablePotions.map(p => p.name).join(', ')}`);
      if (availablePotions.length === 0) {
        console.log('Keine Tränke verfügbar.');
        return { name: 'Nichts', type: 'none' };
      }
      loot = availablePotions[getRandomInt(0, availablePotions.length - 1)];
      break;

    case 'weapon':
      // Erstelle eine zufällige Waffe
      const weaponName = weaponNames[getRandomInt(0, weaponNames.length - 1)];
      const weaponStrength = getRandomInt(2, 4) * gameState.difficulty;
      const weaponWorth = Math.floor((getRandomInt(2, 5) * gameState.difficulty) / 2);
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
      const materialWorth = Math.floor((getRandomInt(2, 5) * gameState.difficulty) / 2);
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
        return unlock <= gameState.difficulty;
      });

      console.log(`Verfügbare Rüstungen für Schwierigkeitsgrad ${gameState.difficulty}: ${availableArmors.join(', ')}`);

      if (availableArmors.length === 0) {
        console.log('Keine Rüstungen verfügbar.');
        return { name: 'Nichts', type: 'none' };
      }

      // Erstelle eine zufällige Rüstung aus den verfügbaren Rüstungen
      const amorName = availableArmors[getRandomInt(0, availableArmors.length - 1)];

      // Definieren der gewünschten Bereiche basierend auf dem Schwierigkeitsgrad
      const strengthMin = gameState.difficulty;
      const strengthMax = gameState.difficulty * 2;
      const worthMin = gameState.difficulty;
      const worthMax = gameState.difficulty * 2;

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
  console.log(`Trank konsumiert: ${potion.name}, verbleibende Menge: ${potion.quantity}`);

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

// Route: Item kaufen
router.post('/buy', (req, res) => {
  const { itemName } = req.body;
  console.log(`Received buy request for item: ${itemName}`);

  const tavernItem = tavernItems.find(item => item.name === itemName);
  if (!tavernItem) {
    return res.status(404).json({ message: 'Item nicht gefunden.' });
  }

  // Überprüfe, ob das Item eine Rüstung ist und ob der Schwierigkeitsgrad ausreicht
  if (tavernItem.type === 'amor') {
    const requiredDifficulty = tavernItem.unlockDifficulty;
    if (gameState.difficulty < requiredDifficulty) {
      return res.status(400).json({ message: `Diese Rüstung ist erst ab Schwierigkeitsgrad ${requiredDifficulty} verfügbar.` });
    }
  }

  if (tavernItem.quantity <= 0) {
    return res.status(400).json({ message: 'Item ist ausverkauft.' });
  }

  if (playerMoney[0] < tavernItem.price) {
    return res.status(400).json({ message: 'Nicht genug Geld, um das Item zu kaufen.' });
  }

  playerMoney[0] -= tavernItem.price;
  tavernItem.quantity -= 1;

  if (tavernItem.type === 'weapon') {
    // **Waffen werden als separate Einträge hinzugefügt**
    inventoryItems.push({ 
      name: tavernItem.name, 
      type: tavernItem.type, 
      worth: tavernItem.worth, 
      strength: tavernItem.strength, 
      category: tavernItem.category, 
      quantity: 1 
    });
    console.log(`Neue Waffe gekauft: ${tavernItem.name} mit Stärke ${tavernItem.strength} und Wert ${tavernItem.worth}`);
  } else if (tavernItem.type === 'amor') {
    // **Rüstungen werden gestapelt, wenn Name, Stärke und Wert gleich sind**
    const existingArmor = inventoryItems.find(item => 
      item.name === tavernItem.name && 
      item.type === 'amor' && 
      item.strength === tavernItem.strength && 
      item.worth === tavernItem.worth
    );

    if (existingArmor) {
      existingArmor.quantity += 1;
      console.log(`Existierende Rüstung gestapelt: ${existingArmor.name}, neue Menge: ${existingArmor.quantity}`);
    } else {
      inventoryItems.push({ 
        name: tavernItem.name, 
        type: tavernItem.type, 
        worth: tavernItem.worth, 
        strength: tavernItem.strength, 
        category: tavernItem.category, 
        quantity: 1 
      });
      console.log(`Neue Rüstung gekauft: ${tavernItem.name} mit Stärke ${tavernItem.strength} und Wert ${tavernItem.worth}`);
    }
  } else {
    // **Andere Items (Tränke, Materialien) werden standardmäßig gestapelt**
    const existingItem = inventoryItems.find(item => item.name === itemName && item.type === tavernItem.type);
    if (existingItem) {
      existingItem.quantity += 1;
      console.log(`Existierender Gegenstand aktualisiert: ${existingItem.name}, neue Menge: ${existingItem.quantity}`);
    } else {
      inventoryItems.push({ 
        name: tavernItem.name, 
        type: tavernItem.type, 
        worth: tavernItem.worth, 
        strength: tavernItem.strength, 
        category: tavernItem.category, 
        quantity: 1 
      });
      console.log(`Neuer Gegenstand gekauft: ${tavernItem.name}`);
    }
  }

  // Loggen des Kaufes
  questLog.push(`Gekauft: ${tavernItem.name} für ${tavernItem.price} Münzen.`);

  res.json({
    message: `${tavernItem.name} wurde gekauft.`,
    playerStatus: {
      money: playerMoney[0],
      hp: PlayerHP[0],
      maxHp: PlayerMaxHP[0],
    },
    tavernItems,
    inventoryItems,
    questLog, // Aktualisiertes Quest-Log zurücksenden
  });
});

// Route: Item verkaufen
router.post('/sell', (req, res) => {
  const { itemName, strength, worth } = req.body;
  console.log(`Received sell request for item: ${itemName}`);

  if (!itemName) {
    return res.status(400).json({ message: 'Kein Itemname angegeben.' });
  }

  let inventoryItem;

  if (strength !== undefined && worth !== undefined) {
    // **Für Rüstungen mit spezifischen Stärke- und Wertangaben**
    inventoryItem = inventoryItems.find(item => 
      item.name === itemName && 
      (strength === undefined || item.strength === strength) &&
      (worth === undefined || item.worth === worth)
    );
  } else {
    // **Für andere Items ohne spezifische Stärke und Wert**
    inventoryItem = inventoryItems.find(item => item.name === itemName);
  }

  console.log('Inventory Item:', inventoryItem);

  if (inventoryItem) {
    if (inventoryItem.quantity > 0) {
      // **Überprüfe die Kategorie direkt aus dem inventoryItem**
      const isSellable = inventoryItem.category === 'misc' || inventoryItem.type === 'weapon' || inventoryItem.type === 'amor';
      console.log(`Is item '${itemName}' sellable?`, isSellable ? 'Ja' : 'Nein');

      if (!isSellable) {
        return res.status(400).json({ message: 'Dieses Item kann nicht verkauft werden.' });
      }

      // **Verwende den Wert direkt aus dem inventoryItem**
      const itemWorth = getItemWorth(inventoryItem);
      console.log(`Item Worth for '${itemName}':`, itemWorth);

      if (itemWorth === 0) {
        console.log(`Item worth for ${itemName} is 0.`);
        return res.status(400).json({ message: 'Wert des Items konnte nicht ermittelt werden.' });
      }

      inventoryItem.quantity -= 1;
      if (inventoryItem.quantity === 0) {
        const index = inventoryItems.indexOf(inventoryItem);
        inventoryItems.splice(index, 1); // Item entfernen
        console.log(`Item entfernt: ${itemName}`);
      }

      playerMoney[0] += itemWorth; // Spieler-Geld erhöhen

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
    res.status(404).json({ message: 'Item nicht im Inventar gefunden.' });
  }
});

// Route: Quest annehmen
router.post('/accept-quest', (req, res) => {
  // Überprüfe den Cooldown
  if (lastCooldownStartTime) {
    const now = Date.now();
    const timeSinceCooldownStart = now - lastCooldownStartTime;

    if (timeSinceCooldownStart < questCooldown) {
      const remainingTime = questCooldown - timeSinceCooldownStart;
      const remainingSeconds = Math.ceil(remainingTime / 1000);
      return res.status(400).json({ message: `Du kannst neue Quests erst in ${remainingSeconds} Sekunde(n) annehmen.` });
    }
  }

  // Überprüfe die Anzahl der aktiven Quests
  if (activeQuests.length >= 3) {
    return res.status(400).json({ message: 'Du hast bereits die maximale Anzahl an aktiven Quests (3).' });
  }

  // Generiere eine zufällige Quest mit Standortinformation und eindeutiger ID
  const newQuest = generateRandomQuest();
  activeQuests.push(newQuest);

  // Loggen der Quest-Annahme
  questLog.push(`Neue Quest angenommen: ${newQuest.name} in ${newQuest.location}.`);

  res.json({
    message: 'Neue Quest angenommen.',
    quest: newQuest, // Sende die gesamte Quest mit ID zurück
    activeQuests,
    questLog, // Aktualisiertes Quest-Log zurücksenden
  });
});

// Route: Aktive Quests abrufen
router.get('/quests', (req, res) => {
  res.json(activeQuests);
});

// Route: Quest abschließen
router.post('/complete-quest', (req, res) => {
  const { questId } = req.body; // Verwende questId statt questName

  if (!questId) {
    return res.status(400).json({ message: 'Quest-ID wird benötigt.' });
  }

  const questIndex = activeQuests.findIndex(q => q.id === questId); // Suche nach ID

  if (questIndex === -1) {
    return res.status(404).json({ message: 'Aktive Quest nicht gefunden.' });
  }

  const quest = activeQuests[questIndex];

  if (quest.completed) {
    return res.status(400).json({ message: 'Quest bereits abgeschlossen!' });
  }

  const missingItems = quest.requirements.filter(req => {
    const inventoryItem = inventoryItems.find(item => item.name === req.name);
    return !inventoryItem || inventoryItem.quantity < req.quantity;
  });

  if (missingItems.length > 0) {
    return res.status(400).json({
      message: 'Nicht genügend Gegenstände, um die Quest abzuschließen.',
      missingItems,
    });
  }

  // Gegenstände abziehen und aus dem Inventar entfernen, falls Menge 0 erreicht
  quest.requirements.forEach(req => {
    const inventoryItem = inventoryItems.find(item => item.name === req.name);
    if (inventoryItem) {
      inventoryItem.quantity -= req.quantity;
      if (inventoryItem.quantity <= 0) {
        const index = inventoryItems.indexOf(inventoryItem);
        inventoryItems.splice(index, 1); // Item entfernen
      }
    }
  });

  // **Optional:** Belohnung hinzufügen (z.B., "misc"-Item)
  const rewardItem = { name: "Fasern", type: "Material", category: "misc", worth: 2, strength: 0, quantity: 2 };
  const existingRewardItem = inventoryItems.find(item => item.name === rewardItem.name);
  if (existingRewardItem) {
    existingRewardItem.quantity += rewardItem.quantity;
  } else {
    inventoryItems.push(rewardItem);
    console.log('Added reward item to inventory:', rewardItem);
  }
  questLog.push(`Belohnung erhalten: ${rewardItem.name} (${rewardItem.quantity} Stück).`);

  // Quest als abgeschlossen markieren
  quest.completed = true;

  // Entferne die Quest aus den aktiven Quests
  activeQuests.splice(questIndex, 1);

  // Erhöhe den Zähler für abgeschlossene Quests
  completedQuestsCount += 1;

  // Loggen des Quest-Abschlusses
  questLog.push(`Quest abgeschlossen: ${quest.name}. Belohnung erhalten! 10 Münzen`);

  // Belohnung hinzufügen (z.B. 10 Münzen)
  playerMoney[0] += 10;
  gameState.playerMoney = playerMoney[0]; // Synchronisierung

  // Überprüfe, ob der Cooldown gestartet werden muss
  if (completedQuestsCount >= maxCompletedQuestsBeforeCooldown) {
    lastCooldownStartTime = Date.now();

    // Loggen des Cooldowns
    questLog.push({
      type: 'Cooldown',
      message: `Cooldown gestartet: 0 Minute(n) und 5 Sekunde(n) verbleibend.`,
      remainingTime: {
        minutes: 0,
        seconds: 5,
      },
    });

    // Starte den Cooldown-Timer
    const cooldownInterval = setInterval(() => {
      const now = Date.now();
      const timeSinceCooldownStart = now - lastCooldownStartTime;

      if (timeSinceCooldownStart >= questCooldown) {
        // Cooldown beendet, entferne den Cooldown-Eintrag
        const index = questLog.findIndex(entry => entry.type === 'Cooldown');
        if (index !== -1) {
          questLog.splice(index, 1);
        }
        clearInterval(cooldownInterval);
        completedQuestsCount = 0; // Setze den Zähler zurück
      } else {
        // Aktualisiere die verbleibende Zeit
        const remainingTime = questCooldown - timeSinceCooldownStart;
        const remainingSeconds = Math.floor(remainingTime / 1000);

        // Aktualisiere die Nachricht im Cooldown-Eintrag
        const cooldownEntry = questLog.find(entry => entry.type === 'Cooldown');
        if (cooldownEntry) {
          cooldownEntry.message = `Cooldown läuft: ${remainingSeconds} Sekunde(n) verbleibend.`;
          cooldownEntry.remainingTime = {
            minutes: 0,
            seconds: remainingSeconds,
          };
        }
      }
    }, 1000); // Aktualisiere jede Sekunde
  }

  res.json({
    message: 'Quest abgeschlossen!',
    playerStatus: {
      money: playerMoney[0],
      hp: PlayerHP[0],
      maxHp: PlayerMaxHP[0],
    },
    inventoryItems,
    questLog, // Aktualisiertes Quest-Log zurücksenden
    activeQuests,
  });
});

// Route: Item hinzufügen (nur zu Testzwecken)
router.post('/add-item', (req, res) => {
  const { itemName, type, category, worth, strength, quantity } = req.body;

  if (!itemName || !type || !category || worth === undefined || strength === undefined || quantity === undefined) {
    return res.status(400).json({ message: 'Alle Felder sind erforderlich.' });
  }

  if (type === 'amor') {
    // **Für Rüstungen prüfen wir, ob eine Rüstung mit demselben Namen, Stärke und Wert existiert**
    const existingArmor = inventoryItems.find(item => 
      item.name === itemName && 
      item.type === 'amor' && 
      item.strength === strength && 
      item.worth === worth
    );

    if (existingArmor) {
      existingArmor.quantity += quantity;
      console.log(`Existierende Rüstung gestapelt: ${existingArmor.name}, neue Menge: ${existingArmor.quantity}`);
    } else {
      inventoryItems.push({ 
        name: itemName, 
        type, 
        category, 
        worth, 
        strength, 
        quantity 
      });
      console.log('Added new armor to inventory:', { name: itemName, type, category, worth, strength, quantity });
    }
  } else {
    // **Für andere Items wird standardmäßig gestapelt**
    const existingItem = inventoryItems.find(item => item.name === itemName && item.type === type);
    if (existingItem) {
      existingItem.quantity += quantity;
      console.log(`Existierender Gegenstand aktualisiert: ${existingItem.name}, neue Menge: ${existingItem.quantity}`);
    } else {
      inventoryItems.push({ 
        name: itemName, 
        type, 
        category, 
        worth, 
        strength, 
        quantity 
      });
      console.log('Added new item to inventory:', { name: itemName, type, category, worth, strength, quantity });
    }
  }

  // Loggen des Hinzufügens
  questLog.push(`Hinzugefügt: ${itemName} (Kategorie: ${category}) für ${quantity} Stück.`);

  res.json({
    message: `${itemName} wurde dem Inventar hinzugefügt.`,
    inventoryItems,
    questLog,
  });
});

// Hilfsfunktion: Wert eines Items ermitteln
const getItemWorth = (item) => {
  // Nimm den Wert direkt aus dem Item-Objekt
  return item.worth || 0;
};

// Exportiere den Router
module.exports = router;
