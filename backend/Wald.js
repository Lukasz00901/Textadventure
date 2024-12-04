//Backend Wald.js
const express = require('express');
const router = express.Router();

// Importiere das Inventar-Array aus der Datei
let { inventoryItems } = require('./Inventar_Inhalt');

// Hilfsfunktion, um ein Item im Inventar zu finden
const findItemIndex = (name) => {
  return inventoryItems.findIndex((item) => item.name === name);
};

// *** Hinzugefügte Variablen für Cooldown-Mechanismus ***
let gatherCount = 0;
let cooldown = false;
let cooldownEndTime = null;

// Route für das Sammeln von Ressourcen
router.post('/gather', (req, res) => {
  const now = Date.now();

  // *** Überprüfen, ob Cooldown aktiv ist ***
  if (cooldown) {
    if (now >= cooldownEndTime) {
      // Cooldown ist abgelaufen
      cooldown = false;
      gatherCount = 0;
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

  // *** Sammelaktionen zählen ***
  gatherCount++;

  // *** Nach 3 Sammelaktionen Cooldown aktivieren ***
  if (gatherCount >= 3) {
    cooldown = true;
    cooldownEndTime = now + 5 * 60 * 1000; // 5 Minuten in Millisekunden
  }

  const items = [
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

  // Generiere zufällige Mengen für die Ressourcen
  const woodCount = Math.floor(Math.random() * 5) + 1;      // 1 bis 5
  const barkCount = Math.floor(Math.random() * 3) + 1;      // 1 bis 3
  const stickCount = Math.floor(Math.random() * 4) + 1;     // 1 bis 4
  const coneCount = Math.floor(Math.random() * 2) + 1;      // 1 bis 2
  const pfifferlingeCount = Math.floor(Math.random() * 3) + 1; // 1 bis 3
  const steinpilzeCount = Math.floor(Math.random() * 3) + 1;  // 1 bis 3
  const harzCount = Math.floor(Math.random() * 2) + 1;        // 1 bis 2
  const kraeuterCount = Math.floor(Math.random() * 2) + 1;    // 1 bis 2
  const rankenCount = Math.floor(Math.random() * 2) + 1;      // 1 bis 2

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

  // Stöcke hinzufügen oder Menge erhöhen
  const stickIndex = findItemIndex("Stöcke");
  if (stickIndex !== -1) {
    inventoryItems[stickIndex].quantity += stickCount; // Erhöhe die Menge
  } else {
    inventoryItems.push({ ...items[2], quantity: stickCount }); // Neues Item hinzufügen
  }

  // Zapfen hinzufügen oder Menge erhöhen
  const coneIndex = findItemIndex("Zapfen");
  if (coneIndex !== -1) {
    inventoryItems[coneIndex].quantity += coneCount; // Erhöhe die Menge
  } else {
    inventoryItems.push({ ...items[3], quantity: coneCount }); // Neues Item hinzufügen
  }

  // Pfifferlinge hinzufügen oder Menge erhöhen
  const pfifferlingeIndex = findItemIndex("Pfifferlinge");
  if (pfifferlingeIndex !== -1) {
    inventoryItems[pfifferlingeIndex].quantity += pfifferlingeCount;
  } else {
    inventoryItems.push({ ...items[4], quantity: pfifferlingeCount });
  }

  // Steinpilze hinzufügen oder Menge erhöhen
  const steinpilzeIndex = findItemIndex("Steinpilze");
  if (steinpilzeIndex !== -1) {
    inventoryItems[steinpilzeIndex].quantity += steinpilzeCount;
  } else {
    inventoryItems.push({ ...items[5], quantity: steinpilzeCount });
  }

  // Harz hinzufügen oder Menge erhöhen
  const harzIndex = findItemIndex("Harz");
  if (harzIndex !== -1) {
    inventoryItems[harzIndex].quantity += harzCount;
  } else {
    inventoryItems.push({ ...items[6], quantity: harzCount });
  }

  // Kräuter hinzufügen oder Menge erhöhen
  const kraeuterIndex = findItemIndex("Kräuter");
  if (kraeuterIndex !== -1) {
    inventoryItems[kraeuterIndex].quantity += kraeuterCount;
  } else {
    inventoryItems.push({ ...items[7], quantity: kraeuterCount });
  }

  // Ranken hinzufügen oder Menge erhöhen
  const rankenIndex = findItemIndex("Ranken");
  if (rankenIndex !== -1) {
    inventoryItems[rankenIndex].quantity += rankenCount;
  } else {
    inventoryItems.push({ ...items[8], quantity: rankenCount });
  }

  // *** Antwort mit Cooldown-Status ***
  res.status(201).json({
    message: 'Ressourcen erfolgreich gesammelt!',
    addedItems: [
      { name: "Fichtenholz", quantity: woodCount },
      { name: "Rinde", quantity: barkCount },
      { name: "Stöcke", quantity: stickCount },
      { name: "Zapfen", quantity: coneCount },
      { name: "Pfifferlinge", quantity: pfifferlingeCount },
      { name: "Steinpilze", quantity: steinpilzeCount },
      { name: "Harz", quantity: harzCount },
      { name: "Kräuter", quantity: kraeuterCount },
      { name: "Ranken", quantity: rankenCount },
    ],
    currentInventory: inventoryItems,
    cooldown: cooldown,
    cooldownEndTime: cooldownEndTime,
  });
});



module.exports = router;
