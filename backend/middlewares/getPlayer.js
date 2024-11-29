// backend/middlewares/getPlayer.js
const { getPlayerById } = require('../models/playerModel');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const getPlayer = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Kein Token, Zugriff verweigert.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const player = await getPlayerById(decoded.playerId);

    if (!player) {
      return res.status(404).json({ message: 'Spieler nicht gefunden.' });
    }

    req.player = player; // Spieler-Informationen zur Anfrage hinzufügen
    next();
  } catch (error) {
    console.error('Fehler beim Verifizieren des Tokens:', error);
    res.status(401).json({ message: 'Token ungültig oder abgelaufen.' });
  }
};

module.exports = {
  getPlayer
};
