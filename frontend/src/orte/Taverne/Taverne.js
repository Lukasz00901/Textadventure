// frontend/Taverne.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Taverne.css';

function Taverne() {
  const [tavernItems, setTavernItems] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [quest, setQuest] = useState(null);
  const [playerStatus, setPlayerStatus] = useState({ money: 0, hp: 0, maxHp: 0 });
  const [errorMessage, setErrorMessage] = useState('');
  const [questErrorMessage, setQuestErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [talkingToKeeper, setTalkingToKeeper] = useState(false);
  const [questLog, setQuestLog] = useState([]); // Neuer Zustand für den Questlog

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        await fetchPlayerStatus();
        await fetchTavernItems();
        await fetchQuest();
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setErrorMessage('Fehler beim Laden der Taverne-Daten.');
      }
    };
    fetchInitialData();
  }, []);

  const fetchPlayerStatus = async () => {
    try {
      const response = await axios.get('http://localhost:3000/tavern/player-status');
      setPlayerStatus(response.data);
    } catch (error) {
      console.error('Error fetching player status:', error);
      setErrorMessage('Fehler beim Laden des Spielerstatus.');
    }
  };

  const fetchTavernItems = async () => {
    try {
      const response = await axios.get('http://localhost:3000/tavern/items');
      setTavernItems(response.data);
    } catch (error) {
      console.error('Error fetching tavern items:', error);
      setErrorMessage('Fehler beim Laden der Taverne-Items.');
    }
  };

  const fetchQuest = async () => {
    try {
      const response = await axios.get('http://localhost:3000/tavern/quest');
      setQuest(response.data);
    } catch (error) {
      console.error('Error fetching quest:', error);
      setQuestErrorMessage('Fehler beim Laden der Quest.');
    }
  };

  const buyItem = async (itemName) => {
    try {
      const response = await axios.post('http://localhost:3000/tavern/buy', { itemName });
      setTavernItems(response.data.tavernItems);
      setPlayerStatus(response.data.playerStatus);
      setInventoryItems(response.data.inventoryItems);
      setErrorMessage('');
      setInfoMessage(response.data.message);
      setQuestLog(prevLog => [...prevLog, response.data.message]); // Logeintrag hinzufügen
    } catch (error) {
      console.error('Error buying item:', error);
      setErrorMessage(error.response?.data?.message || 'Fehler beim Kauf des Items.');
      setQuestLog(prevLog => [...prevLog, `Fehler beim Kauf des Items: ${error.response?.data?.message}`]); // Fehlermeldung im Log
    }
  };

  const acceptQuest = async () => {
    try {
      const response = await axios.post('http://localhost:3000/tavern/accept-quest');
      setQuest(response.data.quest);
      setInfoMessage(`Neue Quest angenommen: ${response.data.quest.name}`);
      setErrorMessage('');
      setTalkingToKeeper(false);
      setQuestLog(prevLog => [...prevLog, `Neue Quest angenommen: ${response.data.quest.name}`]);
    } catch (error) {
      console.error('Error accepting quest:', error);
      setQuestErrorMessage(error.response?.data?.message || 'Fehler beim Annehmen der Quest.');
      setQuestLog(prevLog => [...prevLog, `Fehler beim Annehmen der Quest: ${error.response?.data?.message}`]);
    }
  };

  // Neue Funktion: Schlafen
  const handleSleep = async () => {
    try {
      const response = await axios.post('http://localhost:3000/tavern/sleep');
      setPlayerStatus(response.data.playerStatus);
      setInfoMessage(response.data.message);
      setErrorMessage('');
      setQuestLog(prevLog => [...prevLog, response.data.message]);
    } catch (error) {
      console.error('Error sleeping:', error);
      setErrorMessage(error.response?.data?.message || 'Fehler beim Schlafen.');
      setQuestLog(prevLog => [...prevLog, `Fehler beim Schlafen: ${error.response?.data?.message}`]);
    }
  };

  // Neue Funktion: Mit Tavernenwirt sprechen
  const handleTalkToKeeper = () => {
    setTalkingToKeeper(!talkingToKeeper);
  };

  return (
    <div className="Taverne">
      <h1>Zum singenden Säufer 🍻</h1>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      {infoMessage && <p className="info-message">{infoMessage}</p>}

      {/* Neuer Button: Mit Tavernenwirt sprechen */}
      <button className="talk-button" onClick={handleTalkToKeeper}>
        Mit Tavernenwirt sprechen
      </button>

      {/* Bedingte Anzeige der neuen Buttons */}
      {talkingToKeeper && (
        <div className="keeper-buttons">
          <button className="sleep-button" onClick={handleSleep}>
            Schlafen
          </button>
          <button className="accept-quest-button" onClick={acceptQuest}>
            Quest annehmen
          </button>
        </div>
      )}

      <div className="player-status">
        <h3>Spielerstatus</h3>
        <p>Gold: {playerStatus.money} 💰</p>
        <p>HP: {playerStatus.hp}/{playerStatus.maxHp} ❤️</p>
        {/* Der Schlafen-Button wurde entfernt */}
      </div>

      <div className="content">
        <div className="tavern">
          <h2>Items</h2>
          <ul>
            {tavernItems.map((item, index) => (
              <li key={item.name}>
                <div className="item-text">
                  <span className="item-name">{item.name}</span>
                  <span className="item-description">{item.type}</span>
                  <span className="item-price">{item.price} Gold</span>
                  <span className="item-quantity">Verfügbar: {item.quantity}</span>
                </div>
                <button
                  className={`item-button item-button-${index}`}
                  onClick={() => buyItem(item.name)}
                  disabled={item.quantity <= 0 || playerStatus.money < item.price}
                >
                  {item.quantity > 0 ? 'Kaufen' : 'Ausverkauft'}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Neuer Bereich: Questlog */}
        <div className="quest-section">
          <h2 className="quest-log-title">Quest Log</h2>
          <div className="quest-log">
            <div className="log-content">
              {questLog.map((entry, index) => (
                <p key={index}>{entry}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Taverne;
