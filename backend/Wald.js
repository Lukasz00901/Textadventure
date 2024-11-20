const express = require('express');
const router = express.Router();

// Importiere das Inventar-Array aus der Datei
let { inventoryItems } = require('./Inventar_Inhalt');

// Hilfsfunktion, um ein Item im Inventar zu finden
const findItemIndex = (name) => {
  return inventoryItems.findIndex((item) => item.name === name);
};

// Route für das Sammeln von Holz und Rinde
router.post('/gather', (req, res) => {
  const items = [
    { name: "Fichtenholz", type: "Material", category: "misc" },
    { name: "Rinde", type: "Material", category: "misc" },
  ];

  // Generiere 1–5 Fichtenholz
  const woodCount = Math.floor(Math.random() * 5) + 1; // 1 bis 5
  const barkCount = Math.floor(Math.random() * 3) + 1; // 1 bis 3

  // Fichtenholz hinzufügen oder Menge erhöhen
  const woodIndex = findItemIndex("Fichtenholz");
  if (woodIndex !== -1) {
    inventoryItems[woodIndex].quantity += woodCount; // Erhöhe die Menge
  } else {
    inventoryItems.push({ ...items[0], quantity: woodCount }); // Neues Item hinzufügen
  }

  // Rinde hinzufügen oder Menge erhöhen
  const barkIndex = findItemIndex("Rinde");
  if (barkIndex !== -1) {
    inventoryItems[barkIndex].quantity += barkCount; // Erhöhe die Menge
  } else {
    inventoryItems.push({ ...items[1], quantity: barkCount }); // Neues Item hinzufügen
  }

  res.status(201).json({
    message: 'Ressourcen erfolgreich gesammelt!',
    addedItems: [
      { name: "Fichtenholz", quantity: woodCount },
      { name: "Rinde", quantity: barkCount },
    ],
    currentInventory: inventoryItems,
  });
});

// Route, um das aktuelle Inventar abzurufen
router.get('/inventory', (req, res) => {
  res.status(200).json({
    message: 'Aktuelles Inventar abgerufen.',
    inventory: inventoryItems,
  });
});

// Route, um das Inventar zu löschen (z. B. zum Zurücksetzen)
router.delete('/inventory', (req, res) => {
  inventoryItems.length = 0; // Löscht alle Items aus dem Array
  res.status(200).json({
    message: 'Inventar geleert.',
  });
});

module.exports = router;
