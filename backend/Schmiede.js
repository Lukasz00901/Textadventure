// Backend Schmiede.js
const express = require('express');
const router = express.Router();
const { inventoryItems } = require('./Inventar_Inhalt');

// Importiere Mine- und Wald-Items und Dungeon-Items 
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
  { name: "Schifer", type: "Material", category: "misc", worth: 3, strength: 0 },
  { name: "Feuerstein", type: "Material", category: "misc", worth: 3, strength: 0 },
  
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
  { name: "Ranken", type: "Material", category: "misc", worth: 2, strength: 0 },
];

// Kombiniere Items aus Mine und Wald
const allItems = [...mineItems, ...forestItems];

// Aktive Quests als Array
let activeQuests = [];

// Quest-Log
let questLog = [];

// Zähler für abgeschlossene Quests
let completedQuestsCount = 0;

// Cooldown-Mechanismus
let lastCooldownStartTime = null;
const questCooldown = 60 * 1000; // 1 Minute in Millisekunden
const maxCompletedQuestsBeforeCooldown = 3;

// Funktion: Zufällige Quest generieren mit Standortinformation
const generateRandomQuest = () => {
  const locations = ["Mine", "Wald", "Wald & Mine"];
  const selectedLocation = locations[Math.floor(Math.random() * locations.length)];

  let possibleItems = [];
  let requirements = [];
  let numberOfRequirements = Math.floor(Math.random() * 3) + 1; // 1 bis 3 Anforderungen

  if (selectedLocation === "Mine") {
    possibleItems = mineItems;
  } else if (selectedLocation === "Wald") {
    possibleItems = forestItems;
  } else if (selectedLocation === "Wald & Mine") {
    // Bei "Wald & Mine" sicherstellen, dass mindestens ein Item aus der Mine und eines aus dem Wald kommt
    if (numberOfRequirements < 2) {
      numberOfRequirements = 2; // Mindestens zwei Anforderungen, eine aus jeder Quelle
    }

    const mineRequirementCount = 1;
    const forestRequirementCount = numberOfRequirements - mineRequirementCount;

    // Füge ein Item aus der Mine hinzu
    while (requirements.length < mineRequirementCount) {
      const randomItem = mineItems[Math.floor(Math.random() * mineItems.length)];
      const randomQuantity = Math.floor(Math.random() * 5) + 1; // 1 bis 5 Stück

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
      name: 'Sammle Ressourcen',
      requirements,
      location: selectedLocation, // Standort hinzufügen
      completed: false,
    };
  }

  // Für "Mine" und "Wald" wie bisher
  while (requirements.length < numberOfRequirements) {
    const randomItem = possibleItems[Math.floor(Math.random() * possibleItems.length)];
    const randomQuantity = Math.floor(Math.random() * 5) + 1; // 1 bis 5 Stück

    // Prüfen, ob das Item bereits in den Anforderungen ist
    if (!requirements.find(req => req.name === randomItem.name)) {
      requirements.push({ name: randomItem.name, quantity: randomQuantity });
    }
  }

  return {
    name: 'Sammle Ressourcen',
    requirements,
    location: selectedLocation, // Standort hinzufügen
    completed: false,
  };
};

// Schmiede-Items
const smithyItems = [
  { name: 'Bierkrug', type: 'Getränk', price: 5, worth: 3, quantity: 20 },
  { name: 'Weinflasche', type: 'Getränk', price: 12, worth: 7, quantity: 10 },
  { name: 'Braten', type: 'Speise', price: 20, worth: 15, quantity: 8 },
  { name: 'Eintopf', type: 'Speise', price: 10, worth: 6, quantity: 15 },
  { name: 'Honigwein', type: 'Getränk', price: 18, worth: 12, quantity: 12 },
  { name: 'Käseplatte', type: 'Speise', price: 25, worth: 18, quantity: 5 },
];

let playerMoney = [12500]; // Geld des Spielers
let PlayerHP = [50]; // Aktuelle HP des Spielers
let PlayerMaxHP = [50]; // Maximale HP des Spielers


// Route: Spielerstatus abrufen
router.get('/player-status', (req, res) => {
  res.json({
    money: playerMoney[0],
    hp: PlayerHP[0],
    maxHp: PlayerMaxHP[0],
  });
});


// Route: Alle Schmiede-Items abrufen
router.get('/items', (req, res) => {
  res.json(smithyItems);
});

// Route: Quest-Log abrufen
router.get('/quest-log', (req, res) => {
  res.json(questLog);
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
    inventoryItems.push({ name: smithyItem.name, quantity: 1 });
  }

  // Loggen des Kaufes
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
    questLog, // Aktualisiertes Quest-Log zurücksenden
  });
});

// Route: Item verkaufen
router.post('/sell', (req, res) => {
  const { itemName } = req.body;
  const inventoryItem = inventoryItems.find(item => item.name === itemName);

  if (inventoryItem) {
    if (inventoryItem.quantity > 0) {
      inventoryItem.quantity -= 1;
      if (inventoryItem.quantity === 0) {
        const index = inventoryItems.indexOf(inventoryItem);
        inventoryItems.splice(index, 1); // Item entfernen
      }

      // Loggen des Verkaufs
      questLog.push(`Verkauft: ${itemName} für ${getItemWorth(itemName)} Gold.`);

      res.json({
        message: 'Item verkauft.',
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

// Hilfsfunktion: Wert eines Items ermitteln
const getItemWorth = (itemName) => {
  const item = smithyItems.find(item => item.name === itemName) || inventoryItems.find(item => item.name === itemName);
  return item ? item.worth : 0;
};

// Route: Quest annehmen
router.post('/accept-quest', (req, res) => {
  // Überprüfe den Cooldown
  if (lastCooldownStartTime) {
    const now = Date.now();
    const timeSinceCooldownStart = now - lastCooldownStartTime;

    if (timeSinceCooldownStart < questCooldown) {
      const remainingTime = questCooldown - timeSinceCooldownStart;
      const remainingMinutes = Math.floor(remainingTime / 60000);
      const remainingSeconds = Math.ceil((remainingTime % 60000) / 1000);
      return res.status(400).json({ message: `Du kannst neue Quests erst in ${remainingMinutes} Minute(n) und ${remainingSeconds} Sekunde(n) annehmen.` });
    }
  }

  // Überprüfe die Anzahl der aktiven Quests
  if (activeQuests.length >= 3) {
    return res.status(400).json({ message: 'Du hast bereits die maximale Anzahl an aktiven Quests (3).' });
  }

  // Generiere eine zufällige Quest mit Standortinformation
  const newQuest = generateRandomQuest();
  activeQuests.push(newQuest);

  // Loggen der Quest-Annahme
  questLog.push(`Neue Quest angenommen: ${newQuest.name} in ${newQuest.location}.`);

  res.json({
    message: 'Neue Quest angenommen.',
    quest: newQuest,
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
  const { questName } = req.body;

  if (!questName) {
    return res.status(400).json({ message: 'Questname wird benötigt.' });
  }

  const questIndex = activeQuests.findIndex(q => q.name === questName);

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

  // Quest als abgeschlossen markieren
  quest.completed = true;

  // Entferne die Quest aus den aktiven Quests
  activeQuests.splice(questIndex, 1);

  // Erhöhe den Zähler für abgeschlossene Quests
  completedQuestsCount += 1;

  // Loggen des Quest-Abschlusses
  questLog.push(`Quest abgeschlossen: ${quest.name}. Belohnung erhalten!`);

  // Überprüfe, ob der Cooldown gestartet werden muss
  if (completedQuestsCount >= maxCompletedQuestsBeforeCooldown) {
    lastCooldownStartTime = Date.now();

    // Loggen des Cooldowns
    questLog.push({
      type: 'Cooldown',
      message: `Cooldown gestartet: 1 Minute(n) und 0 Sekunde(n) verbleibend.`,
      remainingTime: {
        minutes: 1,
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
        const remainingMinutes = Math.floor(remainingTime / 60000);
        const remainingSeconds = Math.floor((remainingTime % 60000) / 1000);

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
    inventoryItems,
    questLog, // Aktualisiertes Quest-Log zurücksenden
    activeQuests,
  });
});

module.exports = router;

