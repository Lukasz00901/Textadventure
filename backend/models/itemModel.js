// backend/models/itemModel.js
const pool = require('../db');

const getAllItems = async () => {
  const [rows] = await pool.query('SELECT * FROM items');
  return rows;
};

const getItemById = async (itemId, connection = pool) => {
  const [rows] = await connection.query('SELECT * FROM items WHERE id = ?', [itemId]);
  return rows[0];
};

const getItemByNameAndType = async (name, type = null, connection = pool) => {
  if (type) {
    const [rows] = await connection.query('SELECT * FROM items WHERE name = ? AND type = ?', [name, type]);
    return rows[0];
  } else {
    const [rows] = await connection.query('SELECT * FROM items WHERE name = ?', [name]);
    return rows[0];
  }
};

const addItem = async (item, connection = pool) => {
  const { name, type, strength, worth, category, quantity } = item;
  const [result] = await connection.query(
    'INSERT INTO items (name, type, strength, worth, category, quantity) VALUES (?, ?, ?, ?, ?, ?)',
    [name, type, strength, worth, category, quantity]
  );
  return result.insertId;
};

const getItemWorth = async (name, connection = pool) => {
  const item = await getItemByNameAndType(name, null, connection);
  return item ? item.worth : 0; // Annahme: Wert ist der Verkaufswert
};

module.exports = {
  getAllItems,
  getItemById,
  getItemByNameAndType,
  addItem,
  getItemWorth
};
