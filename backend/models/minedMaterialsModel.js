// backend/models/minedMaterialsModel.js

const pool = require('../db');

const addMinedMaterial = async (playerId, material) => {
  const { name, type, category, worth, strength, quantity } = material;
  await pool.query(
    `INSERT INTO mined_materials (player_id, name, type, category, worth, strength, quantity) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [playerId, name, type, category, worth, strength, quantity]
  );
};

const getMinedMaterialsByPlayerId = async (playerId) => {
  const [rows] = await pool.query(
    'SELECT * FROM mined_materials WHERE player_id = ? ORDER BY mined_at DESC',
    [playerId]
  );
  return rows;
};

module.exports = {
  addMinedMaterial,
  getMinedMaterialsByPlayerId
};
