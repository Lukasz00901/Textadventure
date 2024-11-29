// backend/models/marketModel.js

const pool = require('../db');

const getAllMarketItems = async () => {
  const [rows] = await pool.query('SELECT * FROM market_items');
  return rows;
};

const getMarketItemByName = async (name) => {
  const [rows] = await pool.query('SELECT * FROM market_items WHERE name = ?', [name]);
  return rows[0];
};

const decreaseMarketItemQuantity = async (itemId, quantity) => {
  await pool.query(
    'UPDATE market_items SET quantity = quantity - ? WHERE id = ?',
    [quantity, itemId]
  );
};

module.exports = {
  getAllMarketItems,
  getMarketItemByName,
  decreaseMarketItemQuantity
};
