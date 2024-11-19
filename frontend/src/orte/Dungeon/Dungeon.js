import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dungeon.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3000';

function Dungeon() {
  const [player, setPlayer] = useState({
    hp: 0,
    maxHp: 0,
    gold: 0,
    roomCounter: 0,
  });
  const [equipment, setEquipment] = useState({ weapon: null, armor: null });
  const [inventory, setInventory] = useState([]);
  const [selectedWeapon, setSelectedWeapon] = useState(null);
  const [eventResponse, setEventResponse] = useState('');
  const [message, setMessage] = useState('');
  const [log, setLog] = useState([]);
  const [difficulty, setDifficulty] = useState('');
  const [isEventActive, setIsEventActive] = useState(false);

  const addToLog = (entry) => {
    setLog((prevLog) => [...prevLog, entry]);
  };

  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/dungeon/player`);
        setPlayer(response.data.player || {
          hp: 0,
          maxHp: 0,
          gold: 0,
          roomCounter: 0,
        });
        setEquipment(response.data.equipment || { weapon: null, armor: null });
        setInventory(response.data.inventoryItems || []);
        setSelectedWeapon(response.data.equipment?.weapon?.id || null);
      } catch (error) {
        console.error('Fehler beim Laden des Spielerstatus:', error);
      }
    };

    fetchPlayer();
    const interval = setInterval(fetchPlayer, 5000);

    return () => clearInterval(interval);
  }, []);

  const changeDifficulty = async () => {
    const level = parseInt(difficulty, 10);
    if (isNaN(level) || level < 1) {
      setMessage('Bitte gib einen gültigen Schwierigkeitsgrad ein (Zahl >= 1).');
      return;
    }
    try {
      const response = await axios.post(`${BACKEND_URL}/dungeon/difficulty`, { level });
      setPlayer(response.data.player || player);
      setMessage(response.data.message);
      addToLog(`Schwierigkeit geändert: ${response.data.message}`);
    } catch (error) {
      console.error('Fehler beim Ändern der Schwierigkeit:', error);
      addToLog('Fehler beim Ändern der Schwierigkeit.');
    }
  };

  const triggerEvent = async () => {
    try {
      const response = await axios.post(`${BACKEND_URL}/dungeon/event`);
      setPlayer(response.data.player || player);
      setEventResponse(response.data.event);
      setMessage(response.data.message || '');
      setIsEventActive(true);

      if (response.data.event.includes('Mimic')) {
        addToLog('Es war eine Mimic! Kämpfe, um zu überleben!');
      } else if (response.data.event.includes('leerer Raum') || response.data.event.includes('The room is empty')) {
        addToLog('Der Raum ist leer. Es passiert nichts.');
      } else if (response.data.event.includes('Falle') || 
                 response.data.event.includes('A poison dart hits you') || 
                 response.data.event.includes('The ceiling collapses partially!') || 
                 response.data.event.includes('You fell into a spike pit!') || 
                 response.data.event.includes('An arrow trap shoots you') ||
                 response.data.event.includes('You triggered a flame trap!')) {
        addToLog(`Eine Falle wurde ausgelöst: ${response.data.event}`);
      } else if (response.data.event.includes('You found a chest!')) {
        addToLog('Du hast eine Truhe gefunden!');
      } else {
        addToLog(`Ereignis: ${response.data.event}`);
      }
    } catch (error) {
      console.error('Fehler beim Auslösen des Dungeon-Events:', error.response?.data || error.message);
      addToLog(`Fehler: ${error.response?.data?.error || 'Unbekannter Fehler'}`);
      setMessage(error.response?.data?.error || 'Fehler beim Auslösen des Dungeon-Events.');
    }
  };

  const resolveEvent = () => {
    setIsEventActive(false);
    setEventResponse('');
    setMessage('');
  };

  const equipItem = async () => {
    if (!selectedWeapon) {
      addToLog('Keine Waffe ausgewählt.');
      setMessage('Bitte wähle eine Waffe aus.');
      return;
    }

    try {
      const response = await axios.post(`${BACKEND_URL}/dungeon/equip`, { itemId: selectedWeapon });
      setEquipment(response.data.equipment || { weapon: null, armor: null });
      setMessage(response.data.message);
      addToLog(`Ausrüstung geändert: ${response.data.message}`);
    } catch (error) {
      console.error('Fehler beim Ausrüsten:', error.response?.data || error.message);
      setMessage('Fehler beim Ausrüsten.');
      addToLog('Fehler beim Ausrüsten.');
    }
  };

  const fightMonster = async () => {
    try {
      const response = await axios.post(`${BACKEND_URL}/dungeon/fight`);
      setPlayer(response.data.player || player);

      if (response.data.player.hp <= 0) {
        addToLog('Du hast verloren! Das Monster war zu stark.');
        setMessage('Du wurdest besiegt. Das Abenteuer endet hier.');
        resolveEvent();
        return;
      }

      if (response.data.loot) {
        setInventory((prev) => [...prev, response.data.loot]);
        const loot = response.data.loot;
        addToLog(
          `Kampf gewonnen! Erhalten: ${loot.name} (Kategorie: ${loot.category}, Stärke: ${loot.strength || 'N/A'}, Verteidigung: ${loot.defense || 'N/A'}, Wert: ${loot.worth})`
        );
      } else {
        addToLog('Kampf gewonnen, aber kein Loot erhalten.');
      }

      setMessage(response.data.event);
      resolveEvent();
    } catch (error) {
      console.error('Fehler beim Kämpfen:', error.response?.data || error.message);
      addToLog(`Fehler beim Kämpfen: ${error.response?.data?.error || 'Unbekannter Fehler'}`);
    }
  };

  const restartGame = () => {
    setPlayer({ hp: 50, maxHp: 50, gold: 0, roomCounter: 0 });
    setEquipment({ weapon: null, armor: null });
    setEventResponse('');
    setIsEventActive(false);
    addToLog('Das Spiel wurde neu gestartet.');
  };

  const openChest = async (choice) => {
    try {
      const response = await axios.post(`${BACKEND_URL}/dungeon/chest`, { choice });
      setPlayer(response.data.player || player);

      if (response.data.player.hp <= 0) {
        addToLog('Du hast die Truhe geöffnet... aber es war eine Mimic! Du wurdest besiegt.');
        setMessage('Die Mimic hat dich besiegt. Das Abenteuer endet hier.');
        resolveEvent();
        return;
      }

      if (response.data.loot) {
        setInventory((prev) => [...prev, response.data.loot]);
        const loot = response.data.loot;
        addToLog(
          `Truhe geöffnet! Erhalten: ${loot.name} (Kategorie: ${loot.category}, Stärke: ${loot.strength || 'N/A'}, Verteidigung: ${loot.defense || 'N/A'}, Wert: ${loot.worth})`
        );
      } else if (choice === 'yes') {
        addToLog('Truhe geöffnet, aber kein Loot enthalten.');
      } else {
        addToLog('Truhe ignoriert.');
      }

      setMessage(response.data.event);
      resolveEvent();
    } catch (error) {
      console.error('Fehler beim Interagieren mit der Truhe:', error);
      addToLog('Fehler beim Interagieren mit der Truhe.');
    }
  };

  return (
    <div className="dungeon-container">
      <header className="dungeon-header">
        <h1>Dungeon-Abenteuer</h1>
      </header>

      <div className="dungeon-content">
        <div className="player-status">
          <h2>Spielerstatus</h2>
          <div>
            <p>HP: {player.hp}/{player.maxHp}</p>
            <p>Gold: {player.gold}</p>
            <p>Erkundete Räume: {player.roomCounter}</p>
          </div>
        </div>

        <div className="event-section">
          <h2>Ereignisse</h2>
          <p>{eventResponse || 'Kein Ereignis aktiv.'}</p>
          {!isEventActive && <button onClick={triggerEvent}>Ereignis auslösen</button>}

          {isEventActive && eventResponse.includes('Monster') && (
            <button onClick={fightMonster} className="action-button">Kämpfen</button>
          )}
          {isEventActive && eventResponse.includes('You found a chest!') && (
            <>
              <button onClick={() => openChest('yes')} className="action-button">Ja</button>
              <button onClick={() => openChest('no')} className="action-button">Nein</button>
            </>
          )}
          {isEventActive && eventResponse.includes('You lost the fight and died!') && (
            <>
              <p>Du hast den Kampf verloren und bist gestorben! Deine Reise beginnt von vorne.</p>
              <button onClick={restartGame} className="action-button">Neustart</button>
            </>
          )}
          {isEventActive &&
            (eventResponse.includes('leerer Raum') ||
              eventResponse.includes('The room is empty') ||
              eventResponse.includes('Falle') ||
              eventResponse.includes('A poison dart hits you') ||
              eventResponse.includes('The ceiling collapses partially!') ||
              eventResponse.includes('You fell into a spike pit!') ||
              eventResponse.includes('An arrow trap shoots you') ||
              eventResponse.includes('Duy')) && (
              <button onClick={resolveEvent} className="action-button">Weiter</button>
          )}
        </div>

        <div className="difficulty-section">
          <h2>Schwierigkeitsgrad</h2>
          <input
            type="number"
            placeholder="Schwierigkeit eingeben"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
          />
          <button onClick={changeDifficulty}>Ändern</button>
        </div>

        <div className="inventory">
          <h2>Inventar</h2>
          <select
            value={selectedWeapon || ''}
            onChange={(e) => setSelectedWeapon(Number(e.target.value))}
          >
            <option value="">-- Waffe auswählen --</option>
            {inventory
              .filter((item) => item.type === 'weapon')
              .map((weapon) => (
                <option key={weapon.id} value={weapon.id}>
                  {weapon.name} (Stärke: {weapon.strength}, Wert: {weapon.worth})
                </option>
              ))}
          </select>
          <button onClick={equipItem}>Ausrüsten</button>
        </div>
      </div>

      <div className="log-section">
        <h2>Protokoll</h2>
        <ul>
          {log.map((entry, index) => (
            <li key={index}>{entry}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Dungeon;
