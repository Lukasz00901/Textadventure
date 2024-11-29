// backend/models/smithyModel.js

const pool = require('../db');

const getSmithyItems = async () => {
  const [rows] = await pool.query('SELECT * FROM items WHERE category = "equipment"');
  return rows;
};

const getSmithyItemByName = async (name) => {
  const [rows] = await pool.query('SELECT * FROM items WHERE name = ? AND category = "equipment"', [name]);
  return rows[0];
};

const decreaseSmithyItemQuantity = async (itemId, quantity) => {
  await pool.query(
    'UPDATE items SET quantity = quantity - ? WHERE id = ? AND quantity >= ?',
    [quantity, itemId, quantity]
  );
};

module.exports = {
  getSmithyItems,
  getSmithyItemByName,
  decreaseSmithyItemQuantity
};
