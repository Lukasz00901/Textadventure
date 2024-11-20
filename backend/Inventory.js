const express = require('express');
const router = express.Router();
let { inventoryItems } = require('./Inventar_Inhalt');

// GET: Alle Items abrufen
router.get('/all/items', (req, res) => {
  res.status(200).json({
    message: 'Alle Items abgerufen.',
    items: inventoryItems,
  });
});

// GET: Items nach Kategorie abrufen
router.get('/equipment/items', (req, res) => {
  const equipmentItems = inventoryItems.filter(item => item.category === 'equipment');
  res.status(200).json({
    message: 'Alle Equipment-Items abgerufen.',
    items: equipmentItems,
  });
});

router.get('/consumable/items', (req, res) => {
  const consumableItems = inventoryItems.filter(item => item.category === 'consumable');
  res.status(200).json({
    message: 'Alle Consumable-Items abgerufen.',
    items: consumableItems,
  });
});

router.get('/misc/items', (req, res) => {
  const miscItems = inventoryItems.filter(item => item.category === 'misc');
  res.status(200).json({
    message: 'Alle Misc-Items abgerufen.',
    items: miscItems,
  });
});

// GET: Items nach Strength sortieren
router.get('/items/sort/strength', (req, res) => {
  const sortedItems = [...inventoryItems].sort((a, b) => b.strength - a.strength);
  res.status(200).json({
    message: 'Items nach Strength sortiert.',
    items: sortedItems,
  });
});

// GET: Items nach Worth sortieren
router.get('/items/sort/worth', (req, res) => {
  const sortedItems = [...inventoryItems].sort((a, b) => b.worth - a.worth);
  res.status(200).json({
    message: 'Items nach Worth sortiert.',
    items: sortedItems,
  });
});

// GET: Items nach Name (A-Z) sortieren
router.get('/items/sort/name', (req, res) => {
  const sortedItems = [...inventoryItems].sort((a, b) => a.name.localeCompare(b.name));
  res.status(200).json({
    message: 'Items nach Name sortiert.',
    items: sortedItems,
  });
});

// GET: Items nach Quantity sortieren
router.get('/items/sort/quantity', (req, res) => {
  const sortedItems = [...inventoryItems].sort((a, b) => b.quantity - a.quantity);
  res.status(200).json({
    message: 'Items nach Quantity sortiert.',
    items: sortedItems,
  });
});

module.exports = router;