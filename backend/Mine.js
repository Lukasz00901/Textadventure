const express = require('express');
const router = express.Router();
let { inventoryItems } = require('./Inventar_Inhalt');

// Route für das Mining von Erzen
router.post('/mine', (req, res) => {
  const items = [
    { name: "Eisenerz", type: "Material", category: "misc" },
    { name: "Kohle", type: "Material", category: "misc" },
    { name: "Golderz", type: "Material", category: "misc" },
    { name: "Uran", type: "Material", category: "misc" },
    { name: "Osmium", type: "Material", category: "misc" },
    { name: "Diamanten", type: "Material", category: "misc" },
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