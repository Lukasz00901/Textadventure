// backend/models/tavernModel.js

const pool = require('../db');

const getTavernItems = async (connection = pool) => {
  const [rows] = await connection.query('SELECT * FROM items WHERE category IN ("drink", "food")');
  return rows;
};

const getTavernItemByName = async (name, connection = pool) => {
  const [rows] = await connection.query('SELECT * FROM items WHERE name = ? AND category IN ("drink", "food")', [name]);
  return rows[0];
};

const decreaseTavernItemQuantity = async (itemId, quantity, connection = pool) => {
  await connection.query(
    'UPDATE items SET quantity = quantity - ? WHERE id = ? AND quantity >= ?',
    [quantity, itemId, quantity]
  );
};

module.exports = {
  getTavernItems,
  getTavernItemByName,
  decreaseTavernItemQuantity
};
