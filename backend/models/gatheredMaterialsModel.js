// backend/models/gatheredMaterialsModel.js

const pool = require('../db');

const addGatheredMaterial = async (playerId, material, connection = pool) => {
  const { name, type, category, worth, strength, quantity } = material;
  await connection.query(
    `INSERT INTO gathered_materials (player_id, name, type, category, worth, strength, quantity) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [playerId, name, type, category, worth, strength, quantity]
  );
};

const getGatheredMaterialsByPlayerId = async (playerId, connection = pool) => {
  const [rows] = await connection.query(
    'SELECT * FROM gathered_materials WHERE player_id = ? ORDER BY gathered_at DESC',
    [playerId]
  );
  return rows;
};

module.exports = {
  addGatheredMaterial,
  getGatheredMaterialsByPlayerId
};
