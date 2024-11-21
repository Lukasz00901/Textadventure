import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Taverne.css';

function Taverne() {
  const [tavernItems, setTavernItems] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [quest, setQuest] = useState(null);
  const [playerStatus, setPlayerStatus] = useState({ money: 0, hp: 0, maxHp: 0, sleepCost: 0 });
  const [errorMessage, setErrorMessage] = useState('');
  const [questErrorMessage, setQuestErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  // Fetch initial data on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        await fetchPlayerStatus(); // Spielerstatus abrufen
        await fetchTavernItems(); // Items abrufen
        await fetchQuest(); // Aktive Quest abrufen
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setErrorMessage('Fehler beim Laden der Taverne-Daten.');
      }
    };

    fetchInitialData();
  }, []);

  // Spielerstatus abrufen
  const fetchPlayerStatus = async () => {
    try {
      const response = await axios.get('http://localhost:3000/tavern/player-status');
      setPlayerStatus(response.data);
    } catch (error) {
      console.error('Error fetching player status:', error);
      setErrorMessage('Fehler beim Laden des Spielerstatus.');
    }
  };

  // Items abrufen
  const fetchTavernItems = async () => {
    try {
      const response = await axios.get('http://localhost:3000/tavern/items');
      setTavernItems(response.data);
    } catch (error) {
      console.error('Error fetching tavern items:', error);
      setErrorMessage('Fehler beim Laden der Taverne-Items.');
    }
  };

  // Aktive Quest abrufen
  const fetchQuest = async () => {
    try {
      const response = await axios.get('http://localhost:3000/tavern/quest');
      setQuest(response.data);
    } catch (error) {
      console.error('Error fetching quest:', error);
      setQuestErrorMessage('Fehler beim Laden der Quest.');
    }
  };

  // Schlafen
  const sleep = async () => {
    try {
      const response = await axios.post('http://localhost:3000/tavern/sleep');
      setPlayerStatus(response.data.playerStatus);
      setInfoMessage('Du hast geschlafen und bist wieder fit!');
    } catch (error) {
      console.error('Error sleeping:', error);
      setErrorMessage(
        error.response?.data?.message || 'Fehler beim Schlafen.'
      );
    }
  };

  // Item kaufen
  const buyItem = async (itemName) => {
    try {
      const response = await axios.post('http://localhost:3000/tavern/buy', { itemName });
      setTavernItems(response.data.tavernItems);
      setPlayerStatus(response.data.playerStatus);
      setInventoryItems(response.data.inventoryItems);
      setErrorMessage('');
    } catch (error) {
      console.error('Error buying item:', error);
      setErrorMessage('Fehler beim Kauf des Items.');
    }
  };

  return (
    <div className="Taverne">
      <h1>Zum singenden Säufer 🍻</h1>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      {infoMessage && <p className="info-message">{infoMessage}</p>}

      {/* Spielerstatus */}
      <div className="player-status">
        <h3>Spielerstatus</h3>
        <p>Gold: {playerStatus.money} 💰</p>
        <p>HP: {playerStatus.hp}/{playerStatus.maxHp} ❤️</p>
        <button onClick={sleep}>Schlafen ({playerStatus.sleepCost} Gold)</button>
      </div>

      {/* Taverne Items */}
      <div className="tavern">
        <h2>Items</h2>
        <ul>
          {tavernItems.map((item) => (
            <li key={item.name}>
              <div>{item.name}</div>
              <div>{item.type}</div>
              <div>{item.price} Gold</div>
              <div>Verfügbar: {item.quantity}</div>
              <button
                onClick={() => buyItem(item.name)}
                disabled={item.quantity <= 0 || playerStatus.money < item.price}
              >
                {item.quantity > 0 ? 'Kaufen' : 'Ausverkauft'}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Quest Bereich */}
      <div className="quest">
        <h2>Quest</h2>
        {quest ? (
          <>
            <p><strong>Quest:</strong> {quest.name}</p>
            <ul>
              {quest.requirements.map((req) => (
                <li key={req.name}>
                  {req.name}: {req.quantity}
                </li>
              ))}
            </ul>
            <p>
              Status:{' '}
              {quest.completed ? (
                <span className="completed">Abgeschlossen</span>
              ) : (
                <span className="in-progress">Noch offen</span>
              )}
            </p>
          </>
        ) : (
          <p>Keine aktive Quest gefunden.</p>
        )}
      </div>
    </div>
  );
}

export default Taverne;
