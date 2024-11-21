const express = require('express');
const router = express.Router();
const { inventoryItems } = require('./Inventar_Inhalt');

// Schmiede-Items
const smithyItems = [
  { name: 'Rückenbrecher (Zweihänder)', type: 'weapon', price: 150, strength: 80, category: 'weapon', worth: 75, quantity: 5 },
  { name: 'Sturmklinge (Einhänder)', type: 'weapon', price: 100, strength: 50, category: 'weapon', worth: 50, quantity: 8 },
  { name: 'Schildbrecher (Axt)', type: 'weapon', price: 120, strength: 70, category: 'weapon', worth: 60, quantity: 6 },
  { name: 'Nachtklinge (Dolch)', type: 'weapon', price: 50, strength: 35, category: 'weapon', worth: 25, quantity: 10 },
  { name: 'Edellanze', type: 'weapon', price: 140, strength: 65, category: 'weapon', worth: 70, quantity: 4 },
  { name: 'Wurfspeer', type: 'weapon', price: 80, strength: 45, category: 'weapon', worth: 40, quantity: 7 },
  { name: 'Steinbrecher (Keule)', type: 'weapon', price: 110, strength: 60, category: 'weapon', worth: 55, quantity: 6 },
];

// Items aus Mine.js und Wald.js
const mineItems = [
  { name: "Eisenerz", type: "Material", category: "misc", worth: 3 },
  { name: "Kohle", type: "Material", category: "misc", worth: 3 },
  { name: "Golderz", type: "Material", category: "misc", worth: 3 },
  { name: "Uran", type: "Material", category: "misc", worth: 3 },
  { name: "Osmium", type: "Material", category: "misc", worth: 3 },
  { name: "Diamanten", type: "Material", category: "misc", worth: 3 },
  { name: "Kupfererz", type: "Material", category: "misc", worth: 3 },
];

const forestItems = [
  { name: "Fichtenholz", type: "Material", category: "misc" },
  { name: "Rinde", type: "Material", category: "misc" },
];

// Kombiniere Items aus Mine und Wald
const allItems = [...mineItems, ...forestItems];

// Aktive Quest
let activeQuest = null;

// Funktion: Zufällige Quest generieren
const generateRandomQuest = () => {
  const numberOfRequirements = Math.floor(Math.random() * 3) + 1; // 1 bis 3 Anforderungen
  const requirements = [];

  while (requirements.length < numberOfRequirements) {
    const randomItem = allItems[Math.floor(Math.random() * allItems.length)];
    const randomQuantity = Math.floor(Math.random() * 5) + 1; // 1 bis 5 Stück

    // Prüfen, ob das Item bereits in den Anforderungen ist
    if (!requirements.find(req => req.name === randomItem.name)) {
      requirements.push({ name: randomItem.name, quantity: randomQuantity });
    }
  }

  return {
    name: 'Sammle Ressourcen',
    requirements,
    completed: false,
  };
};

// Route: Neue Quest generieren
router.post('/quest/new', (req, res) => {
  activeQuest = generateRandomQuest();
  res.json(activeQuest);
});

// Route: Aktive Quest abrufen
router.get('/quest', (req, res) => {
  if (!activeQuest) {
    return res.status(404).json({ message: 'Keine aktive Quest gefunden.' });
  }
  res.json(activeQuest);
});

// Route: Quest abschließen
router.post('/complete-quest', (req, res) => {
  if (!activeQuest) {
    return res.status(404).json({ message: 'Keine aktive Quest vorhanden.' });
  }

  if (activeQuest.completed) {
    return res.status(400).json({ message: 'Quest bereits abgeschlossen!' });
  }

  const missingItems = activeQuest.requirements.filter(req => {
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
  activeQuest.requirements.forEach(req => {
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
  activeQuest.completed = true;

  res.json({ message: 'Quest abgeschlossen!', inventoryItems });
});

// Route: Alle Schmiede-Items abrufen
router.get('/items', (req, res) => {
  res.json(smithyItems);
});

// Route: Item kaufen
router.post('/buy', (req, res) => {
  const { itemName } = req.body;
  const smithyItem = smithyItems.find(item => item.name === itemName);

  if (smithyItem && smithyItem.quantity > 0) {
    const existingItem = inventoryItems.find(item => item.name === itemName);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      inventoryItems.push({ ...smithyItem, quantity: 1 });
    }

    smithyItem.quantity -= 1;

    res.json({ inventoryItems });
  } else {
    res.status(400).json({ message: 'Item nicht verfügbar.' });
  }
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
        inventoryItems.splice(index, 1); // Entferne Item, wenn Quantity 0 ist
      }
      res.json({ message: 'Item verkauft.', inventoryItems });
    } else {
      res.status(400).json({ message: 'Nicht genügend Items zum Verkaufen.' });
    }
  } else {
    res.status(404).json({ message: 'Item nicht im Inventar gefunden.' });
  }
});

module.exports = router;
