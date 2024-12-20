// frontend/src/components/Dungeon.js

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './Dungeon.css';

const Dungeon = () => {
  const [difficulty, setDifficulty] = useState(1);
  const [currentWeapon, setCurrentWeapon] = useState(null);
  const [currentarmor, setCurrentarmor] = useState(null); // Aktuelle Rüstung
  const [inventory, setInventory] = useState([]);
  const [playerHP, setPlayerHP] = useState(30);
  const [playerMaxHP, setPlayerMaxHP] = useState(50);
  const [playerMoney, setPlayerMoney] = useState(125);
  const [playerEP, setPlayerEP] = useState(0); // EP hinzufügen
  const [playerLevel, setPlayerLevel] = useState(1); // Spielerlevel hinzufügen
  const [roomsCompleted, setRoomsCompleted] = useState(0); // Raumzähler
  const [maxDifficulty, setMaxDifficulty] = useState(7); // MaxDifficulty aktualisiert
  const [nextEPThreshold, setNextEPThreshold] = useState(100); // Nächste EP-Schwelle
  const [event, setEvent] = useState(null);
  const [roomName, setRoomName] = useState('');
  const [log, setLog] = useState([]);
  const [selectedWeapon, setSelectedWeapon] = useState('');
  const [selectedConsumable, setSelectedConsumable] = useState(''); // Ausgewähltes Consumable
  const [selectedarmor, setSelectedarmor] = useState(''); // Ausgewählte Rüstung

  const logEndRef = useRef(null);

  // Hilfsfunktion zur Ermittlung der unlockDifficulty basierend auf dem Itemnamen
  const getUnlockDifficulty = (itemName) => {
    const unlocks = {
      // Tränke
      'Kleiner Heiltrank': 1,
      'Normaler Heiltrank': 3,
      'Großer Heiltrank': 5,
      'Mega Heiltrank': 7,
      'Mana-Trank': 9,
      // Consumables
      'Energiekristall': 2,
      'Elixier der Stärke': 4,
      'Verjüngungstrank': 6,
      // Weitere Consumables hinzufügen...
    };
    return unlocks[itemName] || 1;
  };

  useEffect(() => {
    // Initial Daten laden
    fetchDifficulty();
    fetchWeapon();
    fetcharmor(); // Rüstung laden
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

  const fetcharmor = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/dungeon/armor');
      setCurrentarmor(res.data.currentarmor);
      console.log(`Aktuelle Rüstung: ${JSON.stringify(res.data.currentarmor)}`); // Debugging-Log
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
      setPlayerLevel(res.data.playerLevel); // Spielerlevel aktualisieren
      setNextEPThreshold(res.data.nextEPThreshold); // Nächste EP-Schwelle aktualisieren
      setCurrentarmor(res.data.currentarmor); // Aktuelle Rüstung aktualisieren
      console.log(`Spielerstatus geladen: HP ${res.data.PlayerHP}/${res.data.PlayerMaxHP}, Münzen: ${res.data.playerMoney}, EP: ${res.data.playerEP}, Level: ${res.data.playerLevel}, Räume abgeschlossen: ${res.data.roomsCompleted}, MaxDifficulty: ${res.data.MaxDifficulty}, Nächste EP-Schwelle: ${res.data.nextEPThreshold}, Aktuelle Rüstung: ${JSON.stringify(res.data.currentarmor)}`); // Debugging-Log
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
      fetchPlayerStats(); // Aktualisiere auch MaxDifficulty, EP und Level
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

  const handleEquiparmor = async () => {
    if (!selectedarmor) {
      setLog(prevLog => [...prevLog, 'Keine Rüstung ausgewählt.']);
      return;
    }

    try {
      const res = await axios.post('http://localhost:3000/api/dungeon/armor', { armorName: selectedarmor });
      setCurrentarmor(res.data.currentarmor);
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

  const handleDrinkConsumable = async () => {
    if (!selectedConsumable) {
      setLog(prevLog => [...prevLog, 'Kein Heilung/Essen ausgewählt.']);
      return;
    }

    try {
      const res = await axios.post('http://localhost:3000/api/dungeon/drink-potion', { potionName: selectedConsumable });
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
      fetcharmor();
      fetchDifficulty();
    } catch (error) {
      console.error(error);
    }
  };

  // Filtere Tränke und Consumables aus dem Inventar, die verfügbar sind basierend auf der aktuellen Schwierigkeitsstufe
  const availableConsumables = inventory.filter(item => 
    (item.type === 'Trank' || item.category === 'consumable') && 
    item.quantity > 0 && 
    getUnlockDifficulty(item.name) <= difficulty
  );
  console.log(`Verfügbare Consumables für Schwierigkeitsgrad ${difficulty}: ${availableConsumables.map(p => p.name).join(', ')}`); // Debugging-Log

  // Filtere Rüstungen aus dem Inventar
  const availablearmors = inventory.filter(item => 
    item.type === 'armor' && 
    item.quantity > 0
  );
  console.log(`Verfügbare Rüstungen: ${availablearmors.map(a => a.name).join(', ')}`); // Debugging-Log

  return (
    <div className="dungeon-container">
      <h1>Der Ewige Abgrund ⚔️</h1>
      
      <div className="player-stats">
        <div className="stat-card">
          <div className="stat-info">
            <h3>HP</h3>
            <div className="progress-bar">
              <div 
                className="progress" 
                style={{ width: `${(playerHP / playerMaxHP) * 100}%` }}
              ></div>
            </div>
            <p>{playerHP} / {playerMaxHP}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h3>Münzen</h3>
            <p>{playerMoney}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h3>EP</h3>
            <div className="progress-bar">
              <div 
                className="progress" 
                style={{ width: `${(playerEP / nextEPThreshold) * 100}%` }}
              ></div>
            </div>
            <p>{playerEP} / {nextEPThreshold}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h3>Rüstung</h3>
            <p>{currentarmor ? `${currentarmor.name} (Abwehr: ${currentarmor.strength})` : 'Keine Rüstung ausgerüstet'}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h3>Waffe</h3>
            <p>{currentWeapon ? `${currentWeapon.name} (Schaden: ${currentWeapon.strength})` : 'Keine Waffe ausgerüstet'}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h3>Räume</h3>
            <p>{roomsCompleted} abgeschlossen</p>
          </div>
        </div>

        <div className="stat-card full-width">
          <h3>Level: {playerLevel}</h3>
          <p>Maximal abgeschlossener Schwierigkeitsgrad: {maxDifficulty}</p>
        </div>
      </div>

      <div className="controls">
        <div className="difficulty-setter">
          <label htmlFor="difficulty-input">Schwierigkeit:</label>
          <input
            id="difficulty-input"
            type="number"
            value={difficulty}
            onChange={(e) => setDifficulty(Number(e.target.value))}
            min="1"
            max={maxDifficulty}
          />
          <button onClick={handleSetDifficulty}>Schwierigkeit festlegen</button>
        </div>

        <div className="weapon-selector">
          <label htmlFor="weapon-select">Waffe auswählen:</label>
          <select 
            id="weapon-select" 
            value={selectedWeapon} 
            onChange={(e) => setSelectedWeapon(e.target.value)}
          >
            <option value="">Waffe auswählen</option>
            {inventory.filter(w => w.type === 'weapon').map((w, index) => (
              <option key={index} value={w.name}>
                {w.name} (Schaden: {w.strength}) - Münzen: {w.worth}
              </option>
            ))}
          </select>
          <button onClick={handleEquipWeapon}>Waffe ausrüsten</button>
        </div>

        <div className="armor-selector">
          <label htmlFor="armor-select">Rüstung auswählen:</label>
          <select 
            id="armor-select" 
            value={selectedarmor} 
            onChange={(e) => setSelectedarmor(e.target.value)}
          >
            <option value="">Rüstung auswählen</option>
            {availablearmors.map((armor, index) => (
              <option key={index} value={armor.name}>
                {armor.name} (Abwehr: {armor.strength}) - Münzen: {armor.worth}
              </option>
            ))}
          </select>
          <button onClick={handleEquiparmor}>Rüstung ausrüsten</button>
        </div>

        <div className="consumable-selector">
          <label htmlFor="consumable-select">Heilung/Essen auswählen:</label>
          <select 
            id="consumable-select" 
            value={selectedConsumable} 
            onChange={(e) => setSelectedConsumable(e.target.value)}
          >
            <option value="">Heilung/Essen auswählen</option>
            {availableConsumables.map((item, index) => (
              <option key={index} value={item.name}>
                {item.name} ({item.type === 'Trank' ? 'Trank' : 'Consumable'}) - {item.type === 'Trank' ? `Heilwert: ${item.strength}` : `Effekt: ${item.strength}`} - {item.quantity} verfügbar - Münzen: {item.worth}
              </option>
            ))}
          </select>
          <button onClick={handleDrinkConsumable}>Consumable nutzen</button>
        </div>

        <button className="next-room-button" onClick={handleNextRoom}>Nächster Raum</button>
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
