//Backend Mine.js
const express = require('express');
const router = express.Router();
let { inventoryItems } = require('./Inventar_Inhalt');

// *** Hinzugefügte Variablen für Cooldown-Mechanismus ***
let mineCount = 0;
let cooldown = false;
let cooldownEndTime = null;

// Route für das Mining von Erzen
router.post('/mine', (req, res) => {
  const now = Date.now();

  // *** Überprüfen, ob Cooldown aktiv ist ***
  if (cooldown) {
    if (now >= cooldownEndTime) {
      // Cooldown ist abgelaufen
      cooldown = false;
      mineCount = 0;
    } else {
      // Cooldown noch aktiv
      const remainingTime = cooldownEndTime - now;
      const remainingMinutes = Math.ceil(remainingTime / 60000);
      return res.status(429).json({
        message: `Cooldown aktiv. Bitte warte ${remainingMinutes} Minuten.`,
        cooldown: true,
        remainingTime: remainingTime,
      });
    }
  }

  // *** Schürfaktionen zählen ***
  mineCount++;

  // *** Nach 3 Schürfaktionen Cooldown aktivieren ***
  if (mineCount >= 3) {
    cooldown = true;
    cooldownEndTime = now + 5 * 60 * 1000; // 5 Minuten in Millisekunden
  }

  const items = [
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

  // *** Antwort mit Cooldown-Status ***
  res.status(201).json({
    message: 'Erze erfolgreich geschürft!',
    addedItems, // Nur die hinzugefügten Items zurückgeben
    currentInventory: inventoryItems,
    cooldown: cooldown,
    cooldownEndTime: cooldownEndTime,
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
