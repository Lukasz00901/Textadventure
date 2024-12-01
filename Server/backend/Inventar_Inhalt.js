// backend/Inventar_Inhalt.js

let inventoryItems = [
  { 
    name: 'ALter Dolch', 
    type: 'weapon', 
    worth: 1, // Ursprünglich price: 15 → worth: 8
    strength: 1, 
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
    quantity: 5
  },
  
  // Weitere Gegenstände können hier hinzugefügt werden
];

let PlayerHP = [30];
let PlayerMaxHP = [50];
let playerMoney = [125];
let playerEP = [0]; // Erfahrungspunkte des Spielers
let MaxDifficulty = [1]; // Maximale abgeschlossene Schwierigkeitsstufe, z.B. 7

module.exports = {
  inventoryItems,
  PlayerHP,
  PlayerMaxHP,
  playerMoney,
  playerEP, // EP hinzufügen
  MaxDifficulty
};
