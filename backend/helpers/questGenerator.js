// backend/helpers/questGenerator.js

const { mineItems, forestItems } = require('../models/itemModel'); // Stelle sicher, dass diese Items korrekt importiert werden

let questIdCounter = 1;

// Funktion: Zufällige Quest generieren
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

module.exports = {
  generateRandomQuest
};
