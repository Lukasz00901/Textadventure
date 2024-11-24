// backend/Inventar_Inhalt.js

let inventoryItems = [
  { 
    name: 'minigun', 
    type: 'weapon', 
    worth: 8, // Ursprünglich price: 15 → worth: 8
    strength: 150, 
    category: 'equipment', 
    quantity: 1 
  },
  { 
    id: 1, 
    name: 'Kleiner Heiltrank', 
    type: 'Trank', 
    worth: 8, // price: 15 → worth: 8
    strength: 15, 
    category: 'consumable', 
    quantity: 1
  },
  { 
    id: 2, 
    name: 'Normaler Heiltrank', 
    type: 'Trank', 
    worth: 13, // price: 25 → worth: 13
    strength: 40, 
    category: 'consumable', 
    quantity: 1
  },
  { 
    id: 3, 
    name: 'Großer Heiltrank', 
    type: 'Trank', 
    worth: 20, // price: 40 → worth: 20
    strength: 80, 
    category: 'consumable', 
    quantity: 1
  },
  { 
    id: 4, 
    name: 'Mega Heiltrank', 
    type: 'Trank', 
    worth: 30, // price: 60 → worth: 30
    strength: 150, 
    category: 'consumable', 
    quantity: 1
  },
  { 
    id: 5, 
    name: 'Mana-Trank', 
    type: 'Trank', 
    worth: 38, // price: 75 → worth: 38
    strength: 190, 
    category: 'consumable', 
    quantity: 1
  },
  // Weitere Gegenstände können hier hinzugefügt werden
];

let PlayerHP = [30];
let PlayerMaxHP = [50];
let playerMoney = [125];
let playerEP = [0]; // Erfahrungspunkte des Spielers
let MaxDifficulty = [7]; // Maximale abgeschlossene Schwierigkeitsstufe, z.B. 7

module.exports = {
  inventoryItems,
  PlayerHP,
  PlayerMaxHP,
  playerMoney,
  playerEP, // EP hinzufügen
  MaxDifficulty
};
