// backend/initMarketItems.js
const pool = require('./db');

const marketItems = [
  { name: 'Kleiner Heiltrank', type: 'Trank', price: 15, worth: 7, strength: 15, category: 'consumable', quantity: 10 },
  { name: 'Mittlerer Heiltrank', type: 'Trank', price: 25, worth: 14, strength: 40, category: 'consumable', quantity: 10 },
  { name: 'Großer Heiltrank', type: 'Trank', price: 40, worth: 20, strength: 80, category: 'consumable', quantity: 10 },
  { name: 'Mega Heiltrank', type: 'Trank', price: 60, worth: 30, strength: 150, category: 'consumable', quantity: 10 },
  { name: 'Mana-Trank', type: 'Trank', price: 75, worth: 37, strength: 190, category: 'consumable', quantity: 10 },
  { name: 'Brot', type: 'Lebensmittel', price: 4, worth: 2, strength: 5, category: 'consumable', quantity: 10 },
  { name: 'Apfel', type: 'Trank', price: 2, worth: 1, strength: 3, category: 'consumable', quantity: 10 },
  { name: 'Ei', type: 'Trank', price: 4, worth: 2, strength: 3, category: 'consumable', quantity: 10 },
  { name: 'Ziegenkäserad', type: 'Trank', price: 10, worth: 5, strength: 15, category: 'consumable', quantity: 10 },
  { name: 'Harzer Roller', type: 'Trank', price: 4, worth: 2, strength: 3, category: 'consumable', quantity: 10 },
  { name: 'Kürbiskuchen', type: 'Trank', price: 6, worth: 3, strength: 6, category: 'consumable', quantity: 10 },
  { name: 'Nüsse', type: 'Trank', price: 4, worth: 6, strength: 3, category: 'consumable', quantity: 10 },
];

const initMarketItems = async () => {
  try {
    for (const item of marketItems) {
      await pool.query(
        'INSERT INTO market_items (name, type, price, worth, strength, category, quantity) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [item.name, item.type, item.price, item.worth, item.strength, item.category, item.quantity]
      );
    }
    console.log('Markt-Items wurden erfolgreich in die Datenbank eingefügt.');
    process.exit(0);
  } catch (error) {
    console.error('Fehler beim Einfügen der Markt-Items:', error);
    process.exit(1);
  }
};

initMarketItems();
