// backend/Taverne.js

const express = require('express');
const cors = require('cors'); // Importiere CORS
const router = express.Router();
const { inventoryItems, PlayerHP, PlayerMaxHP, playerMoney } = require('./Inventar_Inhalt');

// Aktiviere CORS für alle Routen
router.use(cors());

// Importiere Mine- und Wald-Items
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
const questCooldown = 5 * 1000; // 5 Sekunden in Millisekunden
const maxCompletedQuestsBeforeCooldown = 3;

// Quest-ID-Zähler
let questIdCounter = 1;

// Funktion: Zufällige Quest generieren mit Standortinformation und eindeutiger ID
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
      id: questIdCounter++, // Eindeutige ID hinzufügen und erhöhen
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
    id: questIdCounter++, // Eindeutige ID hinzufügen und erhöhen
    name: 'Sammle Ressourcen',
    requirements,
    location: selectedLocation, // Standort hinzufügen
    completed: false,
  };
};

// Taverne-Items
const tavernItems = [
  { name: 'Bierkrug', type: 'Getränk', price: 5, worth: 3, strength: 8, quantity: 20, category: 'drink' },
  { name: 'Weinflasche', type: 'Getränk', price: 12, worth: 7, strength: 8,  quantity: 10, category: 'drink' },
  { name: 'Braten', type: 'Speise', price: 20, worth: 15, strength: 10, quantity: 8, category: 'food' },
  { name: 'Eintopf', type: 'Speise', price: 10, worth: 6, strength: 8, quantity: 15, category: 'food' },
  { name: 'Honigwein', type: 'Getränk', price: 18, worth: 12, strength: 5, quantity: 12, category: 'drink' },
  { name: 'Käseplatte', type: 'Speise', price: 25, worth: 18, strength: 10, quantity: 5, category: 'food' },
];

// Button: Schlafen
const sleepCost = 5; // Kosten fürs Schlafen

// Route: Spielerstatus abrufen
router.get('/player-status', (req, res) => {
  res.json({
    money: playerMoney[0],
    hp: PlayerHP[0],
    maxHp: PlayerMaxHP[0],
    sleepCost, // Kosten fürs Schlafen hinzufügen
  });
});

// Route: Schlafen
router.post('/sleep', (req, res) => {
  if (playerMoney[0] >= sleepCost) {
    playerMoney[0] -= sleepCost; // Abziehen der Schlafkosten
    PlayerHP[0] = PlayerMaxHP[0]; // Spieler erholt sich vollständig

    // Loggen der Schlafaktion
    questLog.push(`Du hast geschlafen und bist wieder fit!`);

    res.json({
      message: 'Du hast geschlafen und bist wieder fit!',
      playerStatus: {
        money: playerMoney[0],
        hp: PlayerHP[0],
        maxHp: PlayerMaxHP[0],
      },
      questLog, // Aktualisiertes Quest-Log zurücksenden
    });
  } else {
    res.status(400).json({ message: 'Nicht genug Geld, um zu schlafen.' });
  }
});

// Route: Alle Taverne-Items abrufen
router.get('/items', (req, res) => {
  res.json(tavernItems);
});

// Route: Quest-Log abrufen
router.get('/quest-log', (req, res) => {
  res.json(questLog);
});

// Route: Inventar abrufen
router.get('/inventory', (req, res) => {
  res.json(inventoryItems);
});

// Hilfsfunktion: Wert eines Items ermitteln
const getItemWorth = (item) => {
  // Nimm den Wert direkt aus dem Item-Objekt
  return item.worth || 0;
};

// Route: Item kaufen
router.post('/buy', (req, res) => {
  const { itemName } = req.body;
  console.log(`Received buy request for item: ${itemName}`);

  const tavernItem = tavernItems.find(item => item.name === itemName);
  if (!tavernItem) {
    return res.status(404).json({ message: 'Item nicht gefunden.' });
  }

  if (tavernItem.quantity <= 0) {
    return res.status(400).json({ message: 'Item ist ausverkauft.' });
  }

  if (playerMoney[0] < tavernItem.price) {
    return res.status(400).json({ message: 'Nicht genug Geld, um das Item zu kaufen.' });
  }

  playerMoney[0] -= tavernItem.price;
  tavernItem.quantity -= 1;

  const existingItem = inventoryItems.find(item => item.name === itemName);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    // **Wichtig:** Füge alle Eigenschaften des Items hinzu, nicht nur Name und Quantity
    inventoryItems.push({ ...tavernItem, quantity: 1 });
    console.log('Added new item to inventory:', { ...tavernItem, quantity: 1 });
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
  const { itemName } = req.body;
  console.log(`Received sell request for item: ${itemName}`);
  const inventoryItem = inventoryItems.find(item => item.name === itemName);

  console.log('Inventory Item:', inventoryItem);

  if (inventoryItem) {
    if (inventoryItem.quantity > 0) {
      // **Änderung:** Überprüfe die Kategorie direkt aus dem inventoryItem
      const isMisc = inventoryItem.category === 'misc';
      console.log(`Is item '${itemName}' misc?`, isMisc ? 'Ja' : 'Nein');

      if (!isMisc) {
        return res.status(400).json({ message: 'Dieses Item kann nicht verkauft werden.' });
      }

      // **Änderung:** Verwende den Wert direkt aus dem inventoryItem
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

module.exports = router;
