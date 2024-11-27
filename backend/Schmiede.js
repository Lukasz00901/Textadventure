// backend/Schmiede.js

const express = require('express');
const router = express.Router();
const { inventoryItems, PlayerHP, PlayerMaxHP, playerMoney } = require('./Inventar_Inhalt');

const smithyItems = [
  { 
    name: 'Schwert', 
    type: 'weapon', 
    worth: 10, // Ursprünglich price: 15 → worth: 8
    price: 20,
    strength: 2, 
    category: 'equipment', 
    quantity: 1 
  },
  { 
    name: 'Axt', 
    type: 'weapon', 
    worth: 17, // Ursprünglich price: 15 → worth: 8
    price: 35,
    strength: 3, 
    category: 'equipment', 
    quantity: 1 
  },
  { 
    name: 'Schild', 
    type: 'armor', 
    worth: 10, // Ursprünglich price: 15 → worth: 8
    price: 20,
    strength: 1, 
    category: 'equipment', 
    quantity: 1 
  },
  { 
    name: 'Rüstung', 
    type: 'armor', 
    worth: 25, // Ursprünglich price: 15 → worth: 8
    price: 50,
    strength: 3, 
    category: 'equipment', 
    quantity: 1 
  },
];

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

const allItems = [...smithyItems, ...forestItems, ...mineItems];

let activeQuests = [];
let questLog = [];
let completedQuestsCount = 0;
let lastCooldownStartTime = null;
const questCooldown = 5 * 1000;
const maxCompletedQuestsBeforeCooldown = 3;
let questIdCounter = 1;

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

    while (requirements.length < mineRequirementCount) {
      const randomItem = mineItems[Math.floor(Math.random() * mineItems.length)];
      const randomQuantity = Math.floor(Math.random() * 5) + 1;

      if (!requirements.find(req => req.name === randomItem.name)) {
        requirements.push({ name: randomItem.name, quantity: randomQuantity });
      }
    }

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

const sleepCost = 10;

router.get('/player-status', (req, res) => {
  res.json({
    money: playerMoney[0],
    hp: PlayerHP[0],
    maxHp: PlayerMaxHP[0],
    sleepCost,
  });
});

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

router.get('/items', (req, res) => {
  res.json(smithyItems);
});

router.get('/quest-log', (req, res) => {
  res.json(questLog);
});

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
    // Geänderte Zeile: Füge alle relevanten Eigenschaften hinzu
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

router.post('/sell', (req, res) => {
  const { itemName } = req.body;
  const inventoryItem = inventoryItems.find(item => item.name === itemName);

  if (inventoryItem) {
    if (inventoryItem.quantity > 0) {
      inventoryItem.quantity -= 1;
      if (inventoryItem.quantity === 0) {
        const index = inventoryItems.indexOf(inventoryItem);
        inventoryItems.splice(index, 1);
      }

      questLog.push(`Verkauft: ${itemName} für ${getItemWorth(itemName)} Gold.`);

      res.json({
        message: 'Item verkauft.',
        inventoryItems,
        questLog,
      });
    } else {
      res.status(400).json({ message: 'Nicht genügend Items zum Verkaufen.' });
    }
  } else {
    res.status(404).json({ message: 'Item nicht im Inventar gefunden.' });
  }
});

const getItemWorth = (itemName) => {
  const item = smithyItems.find(item => item.name === itemName) || inventoryItems.find(item => item.name === itemName);
  return item ? item.worth : 0;
};

router.post('/accept-quest', (req, res) => {
  if (lastCooldownStartTime) {
    const now = Date.now();
    const timeSinceCooldownStart = now - lastCooldownStartTime;

    if (timeSinceCooldownStart < questCooldown) {
      const remainingTime = questCooldown - timeSinceCooldownStart;
      const remainingSeconds = Math.ceil(remainingTime / 1000);
      return res.status(400).json({ message: `Du kannst neue Quests erst in ${remainingSeconds} Sekunde(n) annehmen.` });
    }
  }

  if (activeQuests.length >= 3) {
    return res.status(400).json({ message: 'Du hast bereits die maximale Anzahl an aktiven Quests (3).' });
  }

  const newQuest = generateRandomQuest();
  activeQuests.push(newQuest);
  questLog.push(`Neue Quest angenommen: ${newQuest.name} in ${newQuest.location}.`);

  res.json({
    message: 'Neue Quest angenommen.',
    quest: newQuest,
    activeQuests,
    questLog,
  });
});

router.get('/quests', (req, res) => {
  res.json(activeQuests);
});

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

  quest.completed = true;
  activeQuests.splice(questIndex, 1);
  completedQuestsCount += 1;
  questLog.push(`Quest abgeschlossen: ${quest.name}. Belohnung erhalten! 10 Gold`);
  playerMoney[0] += 10;

  if (completedQuestsCount >= maxCompletedQuestsBeforeCooldown) {
    lastCooldownStartTime = Date.now();
    questLog.push({
      type: 'Cooldown',
      message: `Cooldown gestartet: 0 Minute(n) und 5 Sekunde(n) verbleibend.`,
      remainingTime: {
        minutes: 0,
        seconds: 5,
      },
    });

    const cooldownInterval = setInterval(() => {
      const now = Date.now();
      const timeSinceCooldownStart = now - lastCooldownStartTime;

      if (timeSinceCooldownStart >= questCooldown) {
        const index = questLog.findIndex(entry => entry.type === 'Cooldown');
        if (index !== -1) {
          questLog.splice(index, 1);
        }
        clearInterval(cooldownInterval);
        completedQuestsCount = 0;
      } else {
        const remainingTime = questCooldown - timeSinceCooldownStart;
        const remainingSeconds = Math.floor(remainingTime / 1000);

        const cooldownEntry = questLog.find(entry => entry.type === 'Cooldown');
        if (cooldownEntry) {
          cooldownEntry.message = `Cooldown läuft: ${remainingSeconds} Sekunde(n) verbleibend.`;
          cooldownEntry.remainingTime = {
            minutes: 0,
            seconds: remainingSeconds,
          };
        }
      }
    }, 1000);
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
