// backend/Dungeon.js

const express = require('express');
const router = express.Router();
const { inventoryItems, PlayerHP, PlayerMaxHP, playerMoney, playerEP, MaxDifficulty } = require('./Inventar_Inhalt');

// Middleware zum Parsen von JSON
router.use(express.json());

// CORS-Konfiguration


// Game State (in-memory, für Produktion sollte eine Datenbank verwendet werden)
let gameState = {
  difficulty: 1,
  roomsCompleted: 0, // Raumzähler
  currentWeapon: null,
  currentarmor: null, // Aktuelle Rüstung als 'armor'
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
    type: 'armor', 
    price: 50, 
    worth: 30, 
    quantity: 10, 
    category: 'equipment', 
    unlockDifficulty: armorUnlockDifficulty['Lederharnisch'] 
  },
  { 
    name: 'Kettenhemd', 
    type: 'armor', 
    price: 100, 
    worth: 60, 
    quantity: 8, 
    category: 'equipment', 
    unlockDifficulty: armorUnlockDifficulty['Kettenhemd'] 
  },
  { 
    name: 'Plattenrüstung', 
    type: 'armor', 
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

// GET armor (statt Armor)
router.get('/armor', (req, res) => {
  res.json({ currentarmor: gameState.currentarmor });
});

// POST armor (statt Armor)
router.post('/armor', (req, res) => {
  const { armorName, strength, worth } = req.body;
  if (!armorName) {
    return res.status(400).json({ message: 'Kein Rüstungsname angegeben.' });
  }

  // Sucht nach dem ersten passenden Armorsubset
  const armorIndex = inventoryItems.findIndex(item => 
    item.name === armorName && 
    item.type === 'armor' &&
    (strength === undefined || item.strength === strength) &&
    (worth === undefined || item.worth === worth)
  );

  if (armorIndex !== -1) {
    const armor = inventoryItems[armorIndex];
    gameState.currentarmor = armor;
    res.json({ message: `Rüstung ${armorName} ausgerüstet.`, currentarmor: gameState.currentarmor });
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
    currentarmor: gameState.currentarmor, // Aktuelle Rüstung hinzufügen
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
    if (gameState.currentarmor && gameState.currentarmor.strength) { // Änderung von currentArmor zu currentarmor
      damageReceived = Math.max(enemyDamage - gameState.currentarmor.strength, 0); // Änderung von currentArmor zu currentarmor
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

  // Füge das Loot zum Inventar hinzu, falls es eine Waffe, Trank, Material oder armor ist
  if (loot.type === 'weapon' || loot.type === 'Trank' || loot.type === 'Material' || loot.type === 'armor') { 
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
    } else if (loot.type === 'armor') {
      // **Rüstungen werden gestapelt, wenn Name, Stärke und Wert gleich sind**
      const existingArmor = inventoryItems.find(item => 
        item.name === loot.name && 
        item.type === 'armor' && 
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
      // **Andere Items (Tränke, Materialien, Consumables) werden standardmäßig gestapelt**
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

  if (gameState.currentarmor && gameState.currentarmor.strength) { 
    damage = Math.max(damage - gameState.currentarmor.strength, 0); 
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

// Loot Erstellung: Tränke, Waffen, Materialien, armor
const generateLoot = () => {
  // Bestimme, basierend auf dem Schwierigkeitsgrad, welche Lootkategorien verfügbar sind
  const lootCategories = ['Trank', 'weapon', 'Material', 'armor', 'consumable']; // Hinzugefügt 'consumable'

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

    case 'armor':
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
      const armorName = availableArmors[getRandomInt(0, availableArmors.length - 1)];

      // Definieren der gewünschten Bereiche basierend auf dem Schwierigkeitsgrad
      const strengthMin = gameState.difficulty;
      const strengthMax = gameState.difficulty * 2;
      const worthMin = gameState.difficulty;
      const worthMax = gameState.difficulty * 2;

      const armorStrength = getRandomInt(strengthMin, strengthMax);
      const armorWorth = getRandomInt(worthMin, worthMax);

      loot = {
        name: armorName,
        type: 'armor',
        category: 'equipment',
        strength: armorStrength,
        worth: armorWorth // Korrigiert von 'amorWorth' zu 'armorWorth'
      };
      console.log(`Rüstung generiert: ${JSON.stringify(loot)}`);
      break;

    case 'consumable':
      // Erstelle ein zufälliges konsumierbares Item
      const consumableNames = ['Energiekristall', 'Elixier der Stärke', 'Verjüngungstrank']; // Beispielnamen
      const consumableName = consumableNames[getRandomInt(0, consumableNames.length - 1)];
      const consumableStrength = getRandomInt(5, 15); // Beispiel für Heilung oder andere Effekte
      const consumableWorth = Math.floor(consumableStrength / 2);
      loot = {
        name: consumableName,
        type: 'consumable',
        category: 'consumable',
        strength: consumableStrength,
        worth: consumableWorth
      };
      console.log(`Consumable generiert: ${JSON.stringify(loot)}`);
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
    return res.status(400).json({ message: 'Kein Trank- oder konsumierbares Item angegeben.' });
  }

  // Finde den Trank oder ein konsumierbares Item im Inventar
  const potionIndex = inventoryItems.findIndex(item => 
    (item.name === potionName && item.type === 'Trank') ||
    (item.name === potionName && item.category === 'consumable')
  );

  if (potionIndex === -1) {
    return res.status(400).json({ message: 'Trank oder konsumierbares Item nicht im Inventar gefunden.' });
  }

  const potion = inventoryItems[potionIndex];

  if (potion.quantity < 1) {
    return res.status(400).json({ message: 'Keine Tränke oder konsumierbaren Items mehr vorhanden.' });
  }

  // Konsumiere den Trank oder das konsumierbare Item
  potion.quantity -= 1;
  console.log(`Item konsumiert: ${potion.name}, verbleibende Menge: ${potion.quantity}`);

  // Bestimme den Effekt basierend auf dem Item-Typ
  let actualHealed = 0;
  let actualEffect = '';

  if (potion.type === 'Trank') {
    // Heiltrank Logik
    const healedAmount = potion.strength || 0;
    const newHP = Math.min(gameState.playerHP + healedAmount, gameState.playerMaxHP);
    actualHealed = newHP - gameState.playerHP;
    gameState.playerHP = newHP;
    PlayerHP[0] = gameState.playerHP;
    actualEffect = `${actualHealed} HP wiederhergestellt`;
  } else if (potion.category === 'consumable') {
    // Andere Konsumierbare Logik (z.B. Buffs, Mana-Wiederherstellung)
    // Hier wird angenommen, dass 'strength' als Heilwert genutzt wird
    const effectAmount = potion.strength || 0;
    const newHP = Math.min(gameState.playerHP + effectAmount, gameState.playerMaxHP);
    actualHealed = newHP - gameState.playerHP;
    gameState.playerHP = newHP;
    PlayerHP[0] = gameState.playerHP;
    actualEffect = `${actualHealed} HP wiederhergestellt`; // Passe dies an, falls andere Effekte gewünscht sind
  }

  // Aktualisiere das Inventar
  inventoryItems[potionIndex] = potion;

  res.json({ message: `Du hast ${potion.name} konsumiert und ${actualEffect}.` });
});

// Exportiere den Router
module.exports = router;
