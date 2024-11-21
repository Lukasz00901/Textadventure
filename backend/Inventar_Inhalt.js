// Inventar_Inhalt.js
let inventoryItems = [
    { name: 'minigun', type: 'weapon', price: 15, strength: 150, category: 'equipment', quantity: 1 },
    { id: 1, name: 'Kleiner Heiltrank', type: 'Trank', price: 15, strength: 15, category: 'consumable', quantity: 1 },
    { id: 2, name: 'Mittlerer Heiltrank', type: 'Trank', price: 25, strength: 40, category: 'consumable', quantity: 1 },
    { id: 3, name: 'Großer Heiltrank', type: 'Trank', price: 40, strength: 80, category: 'consumable', quantity: 1 },
    { id: 4, name: 'Mega Heiltrank', type: 'Trank', price: 60, strength: 150, category: 'consumable', quantity: 1 },
    { id: 5, name: 'Mana-Trank', type: 'Trank', price: 75, strength: 190, category: 'consumable', quantity: 1 }
  ];
  
  let PlayerHP = [30];
  let PlayerMaxHP = [50];
  let playerMoney = [125];
  
  module.exports = {
    inventoryItems,
    PlayerHP,
    PlayerMaxHP,
    playerMoney
  };