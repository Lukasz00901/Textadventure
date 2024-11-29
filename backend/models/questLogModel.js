// backend/models/questLogModel.js

const pool = require('../db');

const addQuestLog = async (playerId, log, connection = pool) => {
  await connection.query(
    `INSERT INTO quest_logs (player_id, log) VALUES (?, ?)`,
    [playerId, log]
  );
};

const getQuestLogByPlayerId = async (playerId, connection = pool) => {
  const [rows] = await connection.query(
    'SELECT * FROM quest_logs WHERE player_id = ? ORDER BY created_at DESC',
    [playerId]
  );
  return rows;
};

module.exports = {
  addQuestLog,
  getQuestLogByPlayerId
};
