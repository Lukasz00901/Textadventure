// backend/models/activeQuestsModel.js

const pool = require('../db');
const { generateRandomQuest } = require('../helpers/questGenerator'); // Stelle sicher, dass du die Funktion korrekt importierst

const addActiveQuest = async (playerId, quest, connection = pool) => {
  const { id, name, requirements, location, completed } = quest;
  await connection.query(
    `INSERT INTO active_quests (player_id, quest_id, name, requirements, location, completed) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [playerId, id, name, JSON.stringify(requirements), location, completed]
  );
};

const getActiveQuestsByPlayerId = async (playerId, connection = pool) => {
  const [rows] = await connection.query(
    'SELECT * FROM active_quests WHERE player_id = ?',
    [playerId]
  );
  return rows.map(q => ({
    id: q.quest_id,
    name: q.name,
    requirements: JSON.parse(q.requirements),
    location: q.location,
    completed: q.completed
  }));
};

const removeActiveQuest = async (playerId, questId, connection = pool) => {
  await connection.query(
    'DELETE FROM active_quests WHERE player_id = ? AND quest_id = ?',
    [playerId, questId]
  );
};

module.exports = {
  addActiveQuest,
  getActiveQuestsByPlayerId,
  removeActiveQuest
};
