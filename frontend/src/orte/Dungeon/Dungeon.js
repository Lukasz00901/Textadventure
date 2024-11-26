// frontend/src/components/Dungeon.js

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './Dungeon.css';

const Dungeon = () => {
  const [difficulty, setDifficulty] = useState(1);
  const [currentWeapon, setCurrentWeapon] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [playerHP, setPlayerHP] = useState(30);
  const [playerMaxHP, setPlayerMaxHP] = useState(50);
  const [playerMoney, setPlayerMoney] = useState(125);
  const [playerEP, setPlayerEP] = useState(0); // EP hinzufügen
  const [roomsCompleted, setRoomsCompleted] = useState(0); // Raumzähler
  const [maxDifficulty, setMaxDifficulty] = useState(7); // MaxDifficulty aktualisiert
  const [event, setEvent] = useState(null);
  const [roomName, setRoomName] = useState('');
  const [log, setLog] = useState([]);
  const [selectedWeapon, setSelectedWeapon] = useState('');
  const [selectedPotion, setSelectedPotion] = useState('');

  const logEndRef = useRef(null);

  // Hilfsfunktion zur Ermittlung der unlockDifficulty basierend auf dem Tranknamen
  const getUnlockDifficulty = (potionName) => {
    const unlocks = {
      'Kleiner Heiltrank': 1,
      'Normaler Heiltrank': 3,
      'Großer Heiltrank': 5,
      'Mega Heiltrank': 7,
      'Mana-Trank': 9
    };
    return unlocks[potionName] || 1;
  };

  useEffect(() => {
    // Initial Daten laden
    fetchDifficulty();
    fetchWeapon();
    fetchInventory();
    fetchPlayerStats();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [log]);

  const scrollToBottom = () => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const fetchDifficulty = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/dungeon/difficulty');
      setDifficulty(res.data.difficulty);
      console.log(`Aktueller Schwierigkeitsgrad: ${res.data.difficulty}`); // Debugging-Log
    } catch (error) {
      console.error(error);
    }
  };

  const fetchWeapon = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/dungeon/weapon');
      setCurrentWeapon(res.data.currentWeapon);
      console.log(`Aktuelle Waffe: ${JSON.stringify(res.data.currentWeapon)}`); // Debugging-Log
    } catch (error) {
      console.error(error);
    }
  };

  const fetchInventory = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/dungeon/inventory');
      setInventory(res.data.inventoryItems);
      console.log(`Inventar geladen: ${JSON.stringify(res.data.inventoryItems)}`); // Debugging-Log
    } catch (error) {
      console.error(error);
    }
  };

  const fetchPlayerStats = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/dungeon/player-stats');
      setPlayerHP(res.data.PlayerHP);
      setPlayerMaxHP(res.data.PlayerMaxHP);
      setPlayerMoney(res.data.playerMoney);
      setPlayerEP(res.data.playerEP); // EP aktualisieren
      setRoomsCompleted(res.data.roomsCompleted); // Raumzähler aktualisieren
      setMaxDifficulty(res.data.MaxDifficulty); // MaxDifficulty aktualisieren
      console.log(`Spielerstatus geladen: HP ${res.data.PlayerHP}/${res.data.PlayerMaxHP}, Woth: ${res.data.playerMoney}, EP: ${res.data.playerEP}, Räume abgeschlossen: ${res.data.roomsCompleted}, MaxDifficulty: ${res.data.MaxDifficulty}`); // Debugging-Log
    } catch (error) {
      console.error(error);
    }
  };

  const handleSetDifficulty = async () => {
    try {
      const newDifficulty = parseInt(difficulty, 10);
      if (isNaN(newDifficulty)) {
        setLog(prevLog => [...prevLog, 'Ungültige Schwierigkeitsstufe.']);
        return;
      }

      const res = await axios.post('http://localhost:3000/api/dungeon/difficulty', { difficulty: newDifficulty });
      setLog(prevLog => [...prevLog, res.data.message]);
      console.log(res.data.message); // Debugging-Log
      fetchDifficulty();
      fetchPlayerStats(); // Aktualisiere auch MaxDifficulty und EP
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        setLog(prevLog => [...prevLog, error.response.data.message]);
        console.log(error.response.data.message); // Debugging-Log
      } else {
        console.error(error);
      }
    }
  };

  const handleEquipWeapon = async () => {
    if (!selectedWeapon) {
      setLog(prevLog => [...prevLog, 'Keine Waffe ausgewählt.']);
      return;
    }

    try {
      const res = await axios.post('http://localhost:3000/api/dungeon/weapon', { weaponName: selectedWeapon });
      setCurrentWeapon(res.data.currentWeapon);
      setLog(prevLog => [...prevLog, res.data.message]);
      console.log(res.data.message); // Debugging-Log
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        setLog(prevLog => [...prevLog, error.response.data.message]);
        console.log(error.response.data.message); // Debugging-Log
      } else {
        console.error(error);
      }
    }
  };

  const handleDrinkPotion = async () => {
    if (!selectedPotion) {
      setLog(prevLog => [...prevLog, 'Kein Trank ausgewählt.']);
      return;
    }

    try {
      const res = await axios.post('http://localhost:3000/api/dungeon/drink-potion', { potionName: selectedPotion });
      setLog(prevLog => [...prevLog, res.data.message]);
      console.log(res.data.message); // Debugging-Log
      fetchPlayerStats();
      fetchInventory();
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        setLog(prevLog => [...prevLog, error.response.data.message]);
        console.log(error.response.data.message); // Debugging-Log
      } else {
        console.error(error);
      }
    }
  };

  const handleNextRoom = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/dungeon/event');
      setEvent(res.data.event);
      setRoomName(res.data.roomName);
      setLog(prevLog => [...prevLog, `Du betrittst die ${res.data.roomName}.`]);
      console.log(`Ereignis ausgewählt: ${res.data.event} in Raum: ${res.data.roomName}`); // Debugging-Log

      // Trigger Post Event basierend auf dem Event
      const eventResponse = await axios.post('http://localhost:3000/api/dungeon/event', { event: res.data.event, roomName: res.data.roomName });
      setLog(prevLog => [...prevLog, eventResponse.data.message]);
      console.log(eventResponse.data.message); // Debugging-Log

      // Aktualisiere Spielerstatus nach Event
      fetchPlayerStats();
      fetchInventory();
      fetchWeapon();
      fetchDifficulty();
    } catch (error) {
      console.error(error);
    }
  };

  // Filtere Tränke aus dem Inventar, die verfügbar sind basierend auf der aktuellen Schwierigkeitsstufe
  const availablePotions = inventory.filter(item => 
    item.type === 'Trank' && 
    item.quantity > 0 && 
    getUnlockDifficulty(item.name) <= difficulty
  );
  console.log(`Verfügbare Tränke für Schwierigkeitsgrad ${difficulty}: ${availablePotions.map(p => p.name).join(', ')}`); // Debugging-Log

  return (
    <div className="dungeon-container">
      <h1>Der Ewige Abgrund ⚔️</h1>
      <div className="player-stats">
        <p>HP: {playerHP} / {playerMaxHP}</p>
        <p>Woth: {playerMoney}</p>
        <p>EP: {playerEP}</p> {/* EP anzeigen */}
        <p>Schaden: {currentWeapon ? currentWeapon.strength : 'Keine Waffe'}</p>
        <p>Waffe: {currentWeapon ? currentWeapon.name : 'Keine ausgerüstet'}</p>
        <p>Räume abgeschlossen: {roomsCompleted}</p> {/* Raumzähler angezeigt */}
        <p>Maximal abgeschlossener Schwierigkeitsgrad: {maxDifficulty}</p> {/* MaxDifficulty angezeigt */}
      </div>

      <div className="controls">
        <div className="difficulty-setter">
          <input
            type="number"
            value={difficulty}
            onChange={(e) => setDifficulty(Number(e.target.value))}
            min="1"
            max={maxDifficulty}
          />
          <button onClick={handleSetDifficulty}>Schwierigkeit festlegen</button>
        </div>

        <div className="weapon-selector">
          <select value={selectedWeapon} onChange={(e) => setSelectedWeapon(e.target.value)}>
            <option value="">Waffe auswählen</option>
            {inventory.filter(w => w.type === 'weapon').map((w, index) => (
              <option key={index} value={w.name}>
                {w.name} (Stärke: {w.strength}) - Woth: {w.worth}
              </option>
            ))}
          </select>
          <button onClick={handleEquipWeapon}>Waffe ausrüsten</button>
        </div>

        <div className="potion-selector">
          <select value={selectedPotion} onChange={(e) => setSelectedPotion(e.target.value)}>
            <option value="">Trank auswählen</option>
            {availablePotions.map((potion, index) => (
              <option key={index} value={potion.name}>
                {potion.name} (Heilwert: {potion.strength}) - {potion.quantity} verfügbar - Woth: {potion.worth}
              </option>
            ))}
          </select>
          <button onClick={handleDrinkPotion}>Trank trinken</button>
        </div>

        <button onClick={handleNextRoom}>Nächster Raum</button>
      </div>

      <div className="log">
        <h2>Dungeon-Log</h2>
        <div className="log-content">
          {log.map((entry, index) => (
            <p key={index}>{entry}</p>
          ))}
          <div ref={logEndRef} /> {/* Referenz für automatisches Scrollen */}
        </div>
      </div>
    </div>
  );
};

export default Dungeon;
