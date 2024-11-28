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
    type: 'armor', 
    worth: 10, 
    price: 20,
    strength: 1, 
    category: 'equipment', 
    quantity: 4 
  },
  { 
    name: 'Rüstung', 
    type: 'armor', 
    worth: 25, 
    price: 50,
    strength: 3, 
    category: 'equipment', 
    quantity: 2 
  },
];

// Definiere Wald- und Mine-Items (falls benötigt)
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
const questCooldown = 5 * 1000; // 5 Sekunden
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
const getItemWorth = (itemName) => {
  const item = smithyItems.find(item => item.name === itemName) || inventoryItems.find(item => item.name === itemName);
  return item ? item.worth : 0;
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

  const existingItem = inventoryItems.find(item => item.name === itemName);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    // Füge alle relevanten Eigenschaften hinzu
    const { name, type, worth, strength, category } = smithyItem;
    inventoryItems.push({ name, type, worth, strength, category, quantity: 1 });
  }

  questLog.push(`Gekauft: ${smithyItem.name} für ${smithyItem.price} Gold.`);

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

// Route: Item verkaufen
router.post('/sell', (req, res) => {
  const { itemName } = req.body;
  const inventoryItem = inventoryItems.find(item => item.name === itemName);

  console.log(`Received sell request for item: ${itemName}`);
  console.log('Inventory Item:', inventoryItem);

  if (inventoryItem) {
    if (inventoryItem.quantity > 0) {
      // Überprüfe die Kategorie direkt aus dem inventoryItem
      const isMisc = inventoryItem.category === 'misc';
      console.log(`Is item '${itemName}' misc?`, isMisc ? 'Ja' : 'Nein');

      if (!isMisc) {
        return res.status(400).json({ message: 'Dieses Item kann nicht verkauft werden.' });
      }

      // Verwende den Wert direkt aus dem inventoryItem
      const itemWorth = getItemWorth(itemName);
      console.log(`Item Worth for '${itemName}':`, itemWorth);

      if (itemWorth === 0) {
        console.log(`Item worth for ${itemName} is 0.`);
        return res.status(400).json({ message: 'Wert des Items konnte nicht ermittelt werden.' });
      }

      inventoryItem.quantity -= 1;
      if (inventoryItem.quantity === 0) {
        const index = inventoryItems.indexOf(inventoryItem);
        inventoryItems.splice(index, 1); // Item entfernen
      }

      playerMoney[0] += itemWorth; // Spieler-Geld erhöhen

      // Loggen des Verkaufs
      questLog.push(`Verkauft: ${itemName} für ${itemWorth} Gold.`);

      res.json({
        message: `${itemName} wurde verkauft für ${itemWorth} Gold.`,
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

  // Generiere eine zufällige Quest
  const newQuest = generateRandomQuest();
  activeQuests.push(newQuest);

  // Loggen der Quest-Annahme
  questLog.push(`Neue Quest angenommen: ${newQuest.name} in ${newQuest.location}.`);

  res.json({
    message: 'Neue Quest angenommen.',
    quest: newQuest,
    activeQuests,
    questLog,
  });
});

// Route: Aktive Quests abrufen
router.get('/quests', (req, res) => {
  res.json(activeQuests);
});

// Route: Quest abschließen
router.post('/complete-quest', (req, res) => {
  const { questId } = req.body;

  if (!questId) {
    return res.status(400).json({ message: 'Quest-ID wird benötigt.' });
  }

  const questIndex = activeQuests.findIndex(q => q.id === questId);

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

  // Belohnung hinzufügen (z.B., "misc"-Item oder Gold)
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
  questLog.push(`Quest abgeschlossen: ${quest.name}. Belohnung erhalten! 10 Gold`);

  // Belohnung hinzufügen (z.B. 10 Gold)
  playerMoney[0] += 10;

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
    questLog,
    activeQuests,
  });
});

module.exports = router;
