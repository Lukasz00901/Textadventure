// backend/Player.js

const express = require('express');
const router = express.Router();
const cors = require('cors'); // Importiere CORS falls benötigt

// Importiere die Datenzugriffsmodelle
const { getPlayerById, updatePlayerStatus, createPlayer } = require('./models/playerModel');
const { addQuestLog, getQuestLogByPlayerId } = require('./models/questLogModel');

// Importiere die Middleware zur Spieleridentifikation
const { getPlayer } = require('./middlewares/getPlayer');

// Middleware zum Parsen von JSON
router.use(express.json());

// CORS-Konfiguration (falls nicht bereits global konfiguriert)
router.use(cors({
  origin: 'http://localhost:3001' // Passe die erlaubten Ursprünge nach Bedarf an
}));

// GET-Endpunkt zum Abrufen des Spielernamens und Status
router.get('/', getPlayer, async (req, res) => {
  const player = req.player;

  res.json({
    name: player.name,
    money: player.money,
    hp: player.hp,
    maxHp: player.max_hp,
    completedQuestsCount: player.completed_quests_count,
    gatherCooldownEndTime: player.gather_cooldown_end_time,
    // Weitere Spielerinformationen hinzufügen, falls benötigt
  });
});

// POST-Endpunkt zum Setzen des Spielernamens (z.B. bei Registrierung)
router.post('/', async (req, res) => {
  const { name } = req.body;

  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'Ein gültiger Name ist erforderlich.' });
  }

  try {
    // Erstelle einen neuen Spieler in der Datenbank
    const newPlayer = await createPlayer(name);
    res.status(201).json({ message: 'Spieler erfolgreich erstellt.', player: newPlayer });
  } catch (error) {
    console.error('Fehler beim Erstellen des Spielers:', error);
    res.status(500).json({ error: 'Datenbankfehler' });
  }
});

// PUT-Endpunkt zum Aktualisieren des Spielernamens (optional)
router.put('/', getPlayer, async (req, res) => {
  const playerId = req.player.id;
  const { name } = req.body;

  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'Ein gültiger Name ist erforderlich.' });
  }

  try {
    await updatePlayerStatus(playerId, { name });
    // Loggen der Namensänderung
    await addQuestLog(playerId, `Spielername geändert zu: ${name}.`);

    res.json({ message: 'Spielername erfolgreich aktualisiert.', name });
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Spielernamens:', error);
    res.status(500).json({ error: 'Datenbankfehler' });
  }
});

module.exports = router;
