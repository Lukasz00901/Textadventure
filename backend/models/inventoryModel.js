// backend/models/inventoryModel.js
const pool = require('../db');

const getInventoryByPlayerId = async (playerId) => {
  const [rows] = await pool.query(
    `
    SELECT items.id, items.name, items.type, items.strength, items.worth, items.category, inventory.quantity
    FROM inventory
    JOIN items ON inventory.item_id = items.id
    WHERE inventory.player_id = ?;
    `,
    [playerId]
  );
  return rows;
};

const addItemToInventory = async (playerId, itemId, quantity = 1) => {
  const [rows] = await pool.query(
    'SELECT * FROM inventory WHERE player_id = ? AND item_id = ?',
    [playerId, itemId]
  );

  if (rows.length > 0) {
    // Aktualisiere die Menge
    await pool.query(
      'UPDATE inventory SET quantity = quantity + ? WHERE player_id = ? AND item_id = ?',
      [quantity, playerId, itemId]
    );
  } else {
    // Füge einen neuen Eintrag hinzu
    await pool.query(
      'INSERT INTO inventory (player_id, item_id, quantity) VALUES (?, ?, ?)',
      [playerId, itemId, quantity]
    );
  }
};

const removeItemFromInventory = async (playerId, itemId, quantity = 1) => {
  const [rows] = await pool.query(
    'SELECT quantity FROM inventory WHERE player_id = ? AND item_id = ?',
    [playerId, itemId]
  );

  if (rows.length > 0) {
    if (rows[0].quantity > quantity) {
      await pool.query(
        'UPDATE inventory SET quantity = quantity - ? WHERE player_id = ? AND item_id = ?',
        [quantity, playerId, itemId]
      );
    } else {
      // Entferne den Eintrag komplett
      await pool.query(
        'DELETE FROM inventory WHERE player_id = ? AND item_id = ?',
        [playerId, itemId]
      );
    }
  }
};

module.exports = {
  getInventoryByPlayerId,
  addItemToInventory,
  removeItemFromInventory
};
