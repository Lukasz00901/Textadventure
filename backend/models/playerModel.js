// backend/models/playerModel.js
const pool = require('../db');

const updatePlayer = async (player) => {
  const { id, money, hp, max_hp, ep, max_difficulty } = player;
  await pool.query(
    'UPDATE players SET money = ?, hp = ?, max_hp = ?, ep = ?, max_difficulty = ? WHERE id = ?',
    [money, hp, max_hp, ep, max_difficulty, id]
  );
};

const createPlayer = async (name) => {
  const [result] = await pool.query(
    'INSERT INTO players (name) VALUES (?)',
    [name]
  );
  return result.insertId;
};

const getPlayerById = async (playerId) => {
    const [rows] = await pool.query('SELECT * FROM players WHERE id = ?', [playerId]);
    return rows[0];
  };
  
  const updatePlayerMining = async (playerId, mineCount, cooldownEndTime) => {
    await pool.query(
      'UPDATE players SET mine_count = ?, cooldown_end_time = ? WHERE id = ?',
      [mineCount, cooldownEndTime, playerId]
    );
  };


  
  const updatePlayerGathering = async (playerId, gatherCount, cooldownEndTime) => {
    await pool.query(
      'UPDATE players SET gather_count = ?, gather_cooldown_end_time = ? WHERE id = ?',
      [gatherCount, cooldownEndTime, playerId]
    );
  };
  
  
  const updatePlayerStatus = async (playerId, updates) => {
    const fields = [];
    const values = [];
    
    for (const key in updates) {
      fields.push(`${key} = ?`);
      values.push(updates[key]);
    }
    
    values.push(playerId);
    
    const sql = `UPDATE players SET ${fields.join(', ')} WHERE id = ?`;
    await pool.query(sql, values);
  };
  
  
  module.exports = {
    getPlayerById,
    updatePlayer,
    createPlayer,
    updatePlayerMining, // Von vorherigen Antworten
    updatePlayerGathering, // Von vorherigen Antworten
    updatePlayerStatus // Neue Funktion
  };