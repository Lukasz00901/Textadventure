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
  const [roomsCompleted, setRoomsCompleted] = useState(0); // Raumzähler hinzugefügt
  const [event, setEvent] = useState(null);
  const [roomName, setRoomName] = useState('');
  const [log, setLog] = useState([]);
  const [selectedWeapon, setSelectedWeapon] = useState('');
  const [selectedPotion, setSelectedPotion] = useState('');

  const logEndRef = useRef(null);

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
    } catch (error) {
      console.error(error);
    }
  };

  const fetchWeapon = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/dungeon/weapon');
      setCurrentWeapon(res.data.currentWeapon);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchInventory = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/dungeon/inventory');
      setInventory(res.data.inventoryItems);
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
      setRoomsCompleted(res.data.roomsCompleted); // Raumzähler aktualisieren
    } catch (error) {
      console.error(error);
    }
  };

  const handleSetDifficulty = async () => {
    try {
      const newDifficulty = parseInt(difficulty);
      const res = await axios.post('http://localhost:3000/api/dungeon/difficulty', { difficulty: newDifficulty });
      setLog(prevLog => [...prevLog, res.data.message]);
      fetchDifficulty();
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        setLog(prevLog => [...prevLog, error.response.data.message]);
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
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        setLog(prevLog => [...prevLog, error.response.data.message]);
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
      fetchPlayerStats();
      fetchInventory();
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        setLog(prevLog => [...prevLog, error.response.data.message]);
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

      // Trigger Post Event basierend auf dem Event
      const eventResponse = await axios.post('http://localhost:3000/api/dungeon/event', { event: res.data.event, roomName: res.data.roomName });
      setLog(prevLog => [...prevLog, eventResponse.data.message]);

      // Aktualisiere Spielerstatus nach Event
      fetchPlayerStats();
      fetchInventory();
      fetchWeapon();
      fetchDifficulty();
    } catch (error) {
      console.error(error);
    }
  };

  // Filtere Tränke aus dem Inventar
  const potions = inventory.filter(item => item.type === 'Trank' && item.quantity > 0);

  return (
    <div className="dungeon-container">
      <h1>Dungeon Spiel</h1>
      <div className="player-stats">
        <p>HP: {playerHP} / {playerMaxHP}</p>
        <p>Geld: {playerMoney}</p>
        <p>Schaden: {currentWeapon ? currentWeapon.strength : 'Keine Waffe'}</p>
        <p>Waffe: {currentWeapon ? currentWeapon.name : 'Keine ausgerüstet'}</p>
        <p>Räume abgeschlossen: {roomsCompleted}</p> {/* Raumzähler angezeigt */}
      </div>

      <div className="controls">
        <div className="difficulty-setter">
          <input
            type="number"
            value={difficulty}
            onChange={(e) => setDifficulty(Number(e.target.value))}
            min="1"
          />
          <button onClick={handleSetDifficulty}>Schwierigkeit festlegen</button>
        </div>

        <div className="weapon-selector">
          <select value={selectedWeapon} onChange={(e) => setSelectedWeapon(e.target.value)}>
            <option value="">Waffe auswählen</option>
            {inventory.filter(w => w.type === 'weapon').map((w, index) => (
              <option key={index} value={w.name}>
                {w.name} (Stärke: {w.strength})
              </option>
            ))}
          </select>
          <button onClick={handleEquipWeapon}>Waffe ausrüsten</button>
        </div>

        <div className="potion-selector">
          <select value={selectedPotion} onChange={(e) => setSelectedPotion(e.target.value)}>
            <option value="">Trank auswählen</option>
            {potions.map((potion, index) => (
              <option key={index} value={potion.name}>
                {potion.name} (Heilwert: {potion.strength}) - {potion.quantity} verfügbar
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
