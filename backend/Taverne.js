// Backend Taverne.js
const express = require('express');
const router = express.Router();
const { inventoryItems } = require('./Inventar_Inhalt');
let playerMoney = [12500]; // Geld des Spielers
let PlayerHP = [50]; // Aktuelle HP des Spielers
let PlayerMaxHP = [50]; // Maximale HP des Spielers
const sleepCost = 5; // Kosten fürs Schlafen
let activeQuest = null; // Aktive Quest global definieren

// Beispielhafte Quests
const quests = [
  {
    name: 'Goblin-Räuber ausschalten',
    requirements: [
      { name: 'Goblin', quantity: 10 },
      { name: 'Schwert', quantity: 1 },
    ],
    completed: false,
  },
  {
    name: 'Heilkräuter sammeln',
    requirements: [
      { name: 'Heilkräuter', quantity: 5 },
    ],
    completed: false,
  },
  {
    name: 'Ritter unterstützen',
    requirements: [
      { name: 'Rüstung', quantity: 1 },
      { name: 'Schwert', quantity: 1 },
    ],
    completed: false,
  },
];

// Taverne-Items
const tavernItems = [
  { name: 'Bierkrug', type: 'Getränk', price: 5, worth: 3, quantity: 20 },
  { name: 'Weinflasche', type: 'Getränk', price: 12, worth: 7, quantity: 10 },
  { name: 'Braten', type: 'Speise', price: 20, worth: 15, quantity: 8 },
  { name: 'Eintopf', type: 'Speise', price: 10, worth: 6, quantity: 15 },
  { name: 'Honigwein', type: 'Getränk', price: 18, worth: 12, quantity: 12 },
  { name: 'Käseplatte', type: 'Speise', price: 25, worth: 18, quantity: 5 },
];

// Route: Spielerstatus abrufen
router.get('/player-status', (req, res) => {
  res.json({
    money: playerMoney[0],
    hp: PlayerHP[0],
    maxHp: PlayerMaxHP[0],
    sleepCost, // Kosten fürs Schlafen hinzufügen
  });
});

// Button: Schlafen
router.post('/sleep', (req, res) => {
  if (playerMoney[0] >= sleepCost) {
    playerMoney[0] -= sleepCost; // Abziehen der Schlafkosten
    PlayerHP[0] = PlayerMaxHP[0]; // Spieler erholt sich vollständig
    res.json({
      message: 'Du hast geschlafen und bist wieder fit!',
      playerStatus: {
        money: playerMoney[0],
        hp: PlayerHP[0],
        maxHp: PlayerMaxHP[0],
      },
    });
  } else {
    res.status(400).json({ message: 'Nicht genug Geld, um zu schlafen.' });
  }
});

// Route: Alle Taverne-Items abrufen
router.get('/items', (req, res) => {
  res.json(tavernItems);
});

// Route: Item kaufen
router.post('/buy', (req, res) => {
  const { itemName } = req.body;

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
    inventoryItems.push({ name: tavernItem.name, quantity: 1 });
  }

  res.json({
    message: `${tavernItem.name} wurde gekauft.`,
    playerStatus: {
      money: playerMoney[0],
      hp: PlayerHP[0],
      maxHp: PlayerMaxHP[0],
    },
    tavernItems,
    inventoryItems,
  });
});

// Neue Route: Quest annehmen
router.post('/accept-quest', (req, res) => {
  if (activeQuest && !activeQuest.completed) {
    return res.status(400).json({ message: 'Du hast bereits eine aktive Quest.' });
  }

  // Wähle eine zufällige Quest aus der Questliste
  const availableQuests = quests.filter(q => !q.completed);
  if (availableQuests.length === 0) {
    return res.status(400).json({ message: 'Keine verfügbaren Quests.' });
  }

  const randomIndex = Math.floor(Math.random() * availableQuests.length);
  activeQuest = { ...availableQuests[randomIndex] };

  res.json({
    message: 'Neue Quest angenommen.',
    quest: activeQuest,
  });
});

// Route: Aktive Quest abrufen
router.get('/quest', (req, res) => {
  if (activeQuest) {
    res.json(activeQuest);
  } else {
    res.json(null);
  }
});

module.exports = router;
