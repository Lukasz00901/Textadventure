// backend/initItems.js
const pool = require('./db');

const items = [
  // Getränke und Speisen
  { name: 'Bierkrug', type: 'Trank', strength: 0, worth: 3, category: 'drink', quantity: 20 },
  { name: 'Weinflasche', type: 'Trank', strength: 0, worth: 7, category: 'drink', quantity: 10 },
  { name: 'Braten', type: 'Speise', strength: 0, worth: 15, category: 'food', quantity: 8 },
  { name: 'Eintopf', type: 'Speise', strength: 0, worth: 6, category: 'food', quantity: 15 },
  { name: 'Honigwein', type: 'Trank', strength: 0, worth: 12, category: 'drink', quantity: 12 },
  { name: 'Käseplatte', type: 'Speise', strength: 0, worth: 18, category: 'food', quantity: 5 },

  // Rüstungen
  { name: 'Lederharnisch', type: 'amor', strength: 5, worth: 30, category: 'equipment', quantity: 10 },
  { name: 'Kettenhemd', type: 'amor', strength: 10, worth: 60, category: 'equipment', quantity: 8 },
  { name: 'Plattenrüstung', type: 'amor', strength: 15, worth: 120, category: 'equipment', quantity: 5 },
  // ... Füge weitere Rüstungen und Waffen entsprechend hinzu
];

const initItems = async () => {
  try {
    for (const item of items) {
      await pool.query(
        'INSERT INTO items (name, type, strength, worth, category, quantity) VALUES (?, ?, ?, ?, ?, ?)',
        [item.name, item.type, item.strength, item.worth, item.category, item.quantity]
      );
    }
    console.log('Items wurden erfolgreich in die Datenbank eingefügt.');
    process.exit(0);
  } catch (error) {
    console.error('Fehler beim Einfügen der Items:', error);
    process.exit(1);
  }
};

initItems();
