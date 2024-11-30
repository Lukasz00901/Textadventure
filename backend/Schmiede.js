// backend/Schmiede.js

const express = require('express');
const cors = require('cors'); // Importiere CORS
const router = express.Router();
const { inventoryItems, PlayerHP, PlayerMaxHP, playerMoney } = require('./Inventar_Inhalt');

// Aktiviere CORS für alle Routen
router.use(cors());

// Definiere die Schmiede-Items
const smithyItems = [
  { 
    name: 'Schwert', 
    type: 'weapon', 
    worth: 10, // Wert für Verkauf
    price: 20, // Preis für Kauf
    strength: 2, 
    category: 'equipment', 
    quantity: 5 
  },
  { 
    name: 'Axt', 
    type: 'weapon', 
    worth: 17, 
    price: 35,
    strength: 3, 
    category: 'equipment', 
    quantity: 3 
  },
  { 
    name: 'Schild', 
    type: 'amor', 
    worth: 10, 
    price: 20,
    strength: 1, 
    category: 'equipment', 
    quantity: 4 
  },
  { 
    name: 'Lederharnisch', 
    type: 'amor', 
    worth: 15, 
    price: 30,
    strength: 2, 
    category: 'equipment', 
    quantity: 2 
  },
  { 
    name: 'Rüstung', 
    type: 'amor', 
    worth: 25, 
    price: 50,
    strength: 3, 
    category: 'equipment', 
    quantity: 2 
  },
];

// Weitere Items (Wald- und Mine-Items) können hier definiert werden, falls benötigt
const forestItems = [
  { name: "Fichtenholz", type: "Material", category: "misc", worth: 3, strength: 0 },
  { name: "Rinde", type: "Material", category: "misc", worth: 2, strength: 0 },
  { name: "Stöcke", type: "Material", category: "misc", worth: 2, strength: 0 },
  { name: "Zapfen", type: "Material", category: "misc", worth: 1, strength: 0 },
  { name: "Pfifferlinge", type: "Material", category: "misc", worth: 3, strength: 0 },
  { name: "Steinpilze", type: "Material", category: "misc", worth: 3, strength: 0 },
  { name: "Harz", type: "Material", category: "misc", worth: 2, strength: 0 },
  { name: "Kräuter", type: "Material", category: "misc", worth: 2, strength: 0 },
];

const mineItems = [
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
  { name: "Ranken", type: "Material", category: "misc", worth: 2, strength: 0 },
];

// Kombiniere alle Items (falls benötigt)
const allItems = [...smithyItems, ...forestItems, ...mineItems];

// Quests und Quest-Log
let activeQuests = [];
let questLog = [];
let completedQuestsCount = 0;
let lastCooldownStartTime = null;
const questCooldown = 5 * 60 * 1000; // 5 Minuten
const maxCompletedQuestsBeforeCooldown = 3;
let questIdCounter = 1;

// Funktion: Zufällige Quest generieren
const generateRandomQuest = () => {
  const locations = ["Mine", "Wald", "Mine & Wald"];
  const selectedLocation = locations[Math.floor(Math.random() * locations.length)];

  let possibleItems = [];
  let requirements = [];
  let numberOfRequirements = Math.floor(Math.random() * 3) + 1;

  if (selectedLocation === "Mine") {
    possibleItems = mineItems;
  } else if (selectedLocation === "Wald") {
    possibleItems = forestItems;
  } else if (selectedLocation === "Mine & Wald") {
    if (numberOfRequirements < 2) {
      numberOfRequirements = 2;
    }

    const mineRequirementCount = 1;
    const forestRequirementCount = numberOfRequirements - mineRequirementCount;

    // Füge ein Item aus der Mine hinzu
    while (requirements.length < mineRequirementCount) {
      const randomItem = mineItems[Math.floor(Math.random() * mineItems.length)];
      const randomQuantity = Math.floor(Math.random() * 5) + 1;

      if (!requirements.find(req => req.name === randomItem.name)) {
        requirements.push({ name: randomItem.name, quantity: randomQuantity });
      }
    }

    // Füge Items aus dem Wald hinzu
    while (requirements.length < numberOfRequirements) {
      const randomItem = forestItems[Math.floor(Math.random() * forestItems.length)];
      const randomQuantity = Math.floor(Math.random() * 5) + 1;

      if (!requirements.find(req => req.name === randomItem.name)) {
        requirements.push({ name: randomItem.name, quantity: randomQuantity });
      }
    }

    return {
      id: questIdCounter++,
      name: 'Sammle Ressourcen',
      requirements,
      location: selectedLocation,
      completed: false,
    };
  }

  while (requirements.length < numberOfRequirements) {
    const randomItem = possibleItems[Math.floor(Math.random() * possibleItems.length)];
    const randomQuantity = Math.floor(Math.random() * 5) + 1;

    if (!requirements.find(req => req.name === randomItem.name)) {
      requirements.push({ name: randomItem.name, quantity: randomQuantity });
    }
  }

  return {
    id: questIdCounter++,
    name: 'Sammle Ressourcen',
    requirements,
    location: selectedLocation,
    completed: false,
  };
};

// Kosten fürs Schlafen
const sleepCost = 10;

// Hilfsfunktion: Wert eines Items ermitteln
const getItemWorth = (item) => {
  // Nimm den Wert direkt aus dem Item-Objekt
  return item.worth || 0;
};

// Route: Spielerstatus abrufen
router.get('/player-status', (req, res) => {
  res.json({
    money: playerMoney[0],
    hp: PlayerHP[0],
    maxHp: PlayerMaxHP[0],
    sleepCost,
  });
});

// Route: Schlafen
router.post('/sleep', (req, res) => {
  if (playerMoney[0] >= sleepCost) {
    playerMoney[0] -= sleepCost;
    PlayerHP[0] = PlayerMaxHP[0];
    questLog.push('Du hast geschlafen und bist wieder fit!');
    res.json({
      message: 'Du hast geschlafen und bist wieder fit!',
      playerStatus: {
        money: playerMoney[0],
        hp: PlayerHP[0],
        maxHp: PlayerMaxHP[0],
      },
      questLog,
    });
  } else {
    res.status(400).json({ message: 'Nicht genug Geld, um zu schlafen.' });
  }
});

// Route: Alle Schmiede-Items abrufen
router.get('/items', (req, res) => {
  res.json(smithyItems);
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
  console.log(`Received buy request for item: ${itemName}`);

  const smithyItem = smithyItems.find(item => item.name === itemName);
  if (!smithyItem) {
    return res.status(404).json({ message: 'Item nicht gefunden.' });
  }

  if (smithyItem.quantity <= 0) {
    return res.status(400).json({ message: 'Item ist ausverkauft.' });
  }

  if (playerMoney[0] < smithyItem.price) {
    return res.status(400).json({ message: 'Nicht genug Geld, um das Item zu kaufen.' });
  }

  playerMoney[0] -= smithyItem.price;
  smithyItem.quantity -= 1;

  const existingItem = inventoryItems.find(item => 
    item.name === itemName && 
    item.type === smithyItem.type && 
    item.strength === smithyItem.strength && 
    item.worth === smithyItem.worth
  );

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    // Füge alle relevanten Eigenschaften hinzu
    const { name, type, worth, strength, category } = smithyItem;
    inventoryItems.push({ name, type, worth, strength, category, quantity: 1 });
  }

  questLog.push(`Gekauft: ${smithyItem.name} für ${smithyItem.price} Münzen.`);

  res.json({
    message: `${smithyItem.name} wurde gekauft.`,
    playerStatus: {
      money: playerMoney[0],
      hp: PlayerHP[0],
      maxHp: PlayerMaxHP[0],
    },
    smithyItems,
    inventoryItems,
    questLog,
  });
});

// Route: Item verkaufen für Equipment
router.post('/sell', (req, res) => {
  const { itemName, strength, worth } = req.body;
  console.log(`Received sell request for item: ${itemName}, Stärke: ${strength}, Wert: ${worth}`);

  if (!itemName || strength === undefined || worth === undefined) {
    return res.status(400).json({ message: 'Itemname, Stärke und Wert sind erforderlich.' });
  }

  // Logge das aktuelle Inventar
  console.log('Aktuelles Inventar:', inventoryItems);

  // Finde das Item im Inventar basierend auf Name, Stärke und Wert sowie Kategorie 'equipment'
  const inventoryItem = inventoryItems.find(item => 
    item.name === itemName && 
    item.category === 'equipment' && 
    item.strength === strength && 
    item.worth === worth
  );

  if (inventoryItem) {
    console.log(`Gefundenes Item: ${JSON.stringify(inventoryItem)}`);

    if (inventoryItem.quantity > 0) {
      // Überprüfe die Kategorie direkt aus dem inventoryItem
      const isEquipment = inventoryItem.category === 'equipment';

      if (!isEquipment) {
        return res.status(400).json({ message: 'Dieses Item kann nicht verkauft werden.' });
      }

      // Verwende den Wert direkt aus dem inventoryItem
      const itemWorth = getItemWorth(inventoryItem);

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

// Route: Quest annehmen
router.post('/accept-quest', (req, res) => {
  // Überprüfe den Cooldown
  if (lastCooldownStartTime) {
    const now = Date.now();
    const timeSinceCooldownStart = now - lastCooldownStartTime;

    if (timeSinceCooldownStart < questCooldown) {
      const remainingTime = questCooldown - timeSinceCooldownStart;
      const remainingMinutes = Math.floor(remainingTime / (60 * 1000));
      const remainingSeconds = Math.floor((remainingTime % (60 * 1000)) / 1000);
      return res.status(400).json({ message: `Du kannst neue Quests erst in ${remainingMinutes} Minute(n) und ${remainingSeconds} Sekunde(n) annehmen.` });
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
        inventoryItems.splice(index, 1);
      }
    }
  });

  // **Belohnung hinzufügen (z.B., "equipment"-Item oder Münzen)**
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

  // Überprüfe, ob der Cooldown gestartet werden muss
  if (completedQuestsCount >= maxCompletedQuestsBeforeCooldown) {
    lastCooldownStartTime = Date.now();

    // Loggen des Cooldowns
    questLog.push({
      type: 'Cooldown',
      message: `Cooldown gestartet: 5 Minute(n) verbleibend.`,
      remainingTime: {
        minutes: 5,
        seconds: 0,
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
        const remainingMinutes = Math.floor(remainingTime / (60 * 1000));
        const remainingSeconds = Math.floor((remainingTime % (60 * 1000)) / 1000);

        // Aktualisiere die Nachricht im Cooldown-Eintrag
        const cooldownEntry = questLog.find(entry => entry.type === 'Cooldown');
        if (cooldownEntry) {
          cooldownEntry.message = `Cooldown läuft: ${remainingMinutes} Minute(n) und ${remainingSeconds} Sekunde(n) verbleibend.`;
          cooldownEntry.remainingTime = {
            minutes: remainingMinutes,
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

  if (type === 'armor') { // Korrigierte Schreibweise von 'amor' zu 'armor'
    // Für Rüstungen prüfen wir, ob eine Rüstung mit demselben Namen, Stärke und Wert existiert
    const existingArmor = inventoryItems.find(item => 
      item.name === itemName && 
      item.type === 'armor' && 
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
    // Für andere Items wird standardmäßig gestapelt
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

// Exportiere den Router
module.exports = router;
