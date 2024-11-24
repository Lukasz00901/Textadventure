const express = require('express');
const router = express.Router();
let { inventoryItems } = require('./Inventar_Inhalt');

// Route für das Mining von Erzen
router.post('/mine', (req, res) => {
  const items = [
    { name: "Eisenerz", type: "Material", category: "misc", worth: 3, strength: 0},
    { name: "Kohle", type: "Material", category: "misc", worth: 2, strength: 0}, 
    { name: "Golderz", type: "Material", category: "misc", worth: 4, strength: 0 },
    { name: "Silbererz", type: "Material", category: "misc", worth: 4, strength: 0},
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

  const addedItems = []; // Nur die tatsächlich hinzugefügten Items

  // Iteriere durch alle möglichen Erze und füge ggf. hinzu
  items.forEach((item) => {
    const quantity = Math.floor(Math.random() * 3); // 0 bis 2 Einheiten
    if (quantity > 0) {
      const itemIndex = inventoryItems.findIndex((invItem) => invItem.name === item.name);
      if (itemIndex !== -1) {
        // Erhöhe die Menge, wenn das Item bereits existiert
        inventoryItems[itemIndex].quantity += quantity;
      } else {
        // Füge ein neues Item hinzu
        inventoryItems.push({ ...item, quantity });
      }
      addedItems.push({ name: item.name, quantity }); // Für die Rückmeldung
    }
  });

  res.status(201).json({
    message: 'Erze erfolgreich geschürft!',
    addedItems, // Nur die hinzugefügten Items zurückgeben
  });
});

module.exports = router;