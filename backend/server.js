// Import necessary modules
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Inventory array to store user's items
let inventoryItems = [];

// Function to generate random quantity for items
const generateRandomQuantity = () => Math.floor(Math.random() * 10) + 1;

// Sample market items
const marketItems = [
  { id: 1, name: 'Heiltrank', type: 'Trank', price: 15, strength: 15, quantity: generateRandomQuantity() },
  { id: 2, name: 'Großer Heiltrank', type: 'Trank', price: 25, strength: 30, quantity: generateRandomQuantity() },
  { id: 3, name: 'Mega Heiltrank', type: 'Trank', price: 40, strength: 50, quantity: generateRandomQuantity() },
  { id: 4, name: 'Brot', type: 'Lebensmittel', price: 5, strength: 3, quantity: generateRandomQuantity() },
  { id: 5, name: 'Apfel', type: 'Trank', price: 2, strength: 3, quantity: generateRandomQuantity() },
  { id: 6, name: 'Ei', type: 'Trank', price: 5, strength: 3, quantity: generateRandomQuantity() },
  { id: 7, name: 'Käserad', type: 'Trank', price: 30, strength: 3, quantity: generateRandomQuantity() },
  { id: 8, name: 'Harzer Roller', type: 'Trank', price: 5, strength: 3, quantity: generateRandomQuantity() },
  { id: 9, name: 'Kürbiskuchen', type: 'Trank', price: 8, strength: 3, quantity: generateRandomQuantity() },
  { id: 10, name: 'Nüsse', type: 'Trank', price: 3, strength: 3, quantity: generateRandomQuantity() }
];

// Route to get all market items
app.get('/market/items', (req, res) => {
  res.json(marketItems);
});

// Route to buy an item from the market
app.post('/market/buy', (req, res) => {
  const itemId = req.body.itemId;
  const item = marketItems.find((i) => i.id === itemId);

  if (item && item.quantity > 0) {
    const newItem = { ...item };
    if (newItem.type === 'Trank') {
      newItem.category = 'consumable';
    } else if (newItem.type === 'Waffe' || newItem.type === 'Rüstung') {
      newItem.category = 'equipment';
    } else {
      newItem.category = 'misc';
    }
    inventoryItems.push(newItem);
    item.quantity -= 1;
    res.json({ message: 'Item gekauft!', inventoryItems });
  } else {
    res.status(404).json({ message: 'Item nicht gefunden oder nicht mehr verfügbar!' });
  }
});

// Route to sell a random potion from the inventory
app.post('/market/sell-random-potion', (req, res) => {
  const potions = inventoryItems.filter((i) => i.type === 'Trank');
  if (potions.length > 0) {
    const randomIndex = Math.floor(Math.random() * potions.length);
    const potionId = potions[randomIndex].id;
    inventoryItems = inventoryItems.filter((i) => i.id !== potionId);
    res.json({ message: 'Zufälliger Trank verkauft!', inventoryItems });
  } else {
    res.status(404).json({ message: 'Keine Tränke im Inventar zum Verkaufen!' });
  }
});

// Route to sell an item from the inventoryItems
app.post('/market/sell', (req, res) => {
  const itemId = req.body.itemId;
  const itemIndex = inventoryItems.findIndex((i) => i.id === itemId);

  if (itemIndex !== -1) {
    inventoryItems.splice(itemIndex, 1);
    res.json({ message: 'Item verkauft!', inventoryItems });
  } else {
    res.status(404).json({ message: 'Item nicht im Inventar gefunden!' });
  }
});

// Route to delete selected items
app.post('/items/delete', (req, res) => {
  const itemsToDelete = req.body.items;
  if (itemsToDelete) {
    inventoryItems = inventoryItems.filter((item) => !itemsToDelete.includes(item.id));
  }
  res.json({ items: inventoryItems });
});

// Route to get all inventory items
app.get('/items', (req, res) => {
  res.json({ items: inventoryItems });
});

// Route to sort items by name
app.post('/items/sort', (req, res) => {
  inventoryItems.sort((a, b) => a.name.localeCompare(b.name));
  res.json({ items: inventoryItems });
});

// Route to sort items by strength (if applicable)
app.post('/items/sort-by-strength', (req, res) => {
  inventoryItems.sort((a, b) => (b.strength || 0) - (a.strength || 0));
  res.json({ items: inventoryItems });
});

// Route to handle event where items are randomly sold from the market
app.get('/event', (req, res) => {
  const randomItemsSold = marketItems.map(item => {
    const quantitySold = Math.floor(Math.random() * (item.quantity + 1));
    item.quantity -= quantitySold;
    return { ...item, quantitySold };
  });
  res.json({ message: 'Zufällige Items verkauft!', randomItemsSold });
});

// Route, um alle Items abzurufen
app.get('/items', (req, res) => {
  res.json({ items: inventoryItems });
});

// Route, um Items nach Namen zu sortieren
app.post('/items/sort', (req, res) => {
  inventoryItems.sort((a, b) => a.name.localeCompare(b.name));
  res.json({ items: inventoryItems });
});

// Route, um Items nach Stärke zu sortieren
app.post('/items/sort-by-strength', (req, res) => {
  inventoryItems.sort((a, b) => b.strength - a.strength);
  res.json({ items: inventoryItems });
});

// Route, um ausgewählte Items zu löschen
app.post('/items/delete', (req, res) => {
  const itemsToDelete = req.body.items;
  if (itemsToDelete) {
    inventoryItems = inventoryItems.filter(
      (item) => !itemsToDelete.includes(item.id)
    );
  }
  res.json({ items: inventoryItems });
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
