// frontend/Schmiede.js

import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import './Schmiede.css';

function Schmiede() {
  const [smithyItems, setSmithyItems] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [activeQuests, setActiveQuests] = useState([]);
  const [lastCompletedQuest, setLastCompletedQuest] = useState(null);
  const [playerStatus, setPlayerStatus] = useState({ money: 0, hp: 0, maxHp: 0 });
  const [errorMessage, setErrorMessage] = useState('');
  const [questErrorMessage, setQuestErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [talkingToKeeper, setTalkingToKeeper] = useState(false);
  const [questLog, setQuestLog] = useState([]);
  const logEndRef = useRef(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        await fetchPlayerStatus();
        await fetchSmithyItems();
        await fetchQuests();
        await fetchQuestLog();
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setErrorMessage('Fehler beim Laden der Schmiede-Daten.');
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchQuestLog();
      fetchQuests();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

 

  const fetchPlayerStatus = async () => {
    try {
      const response = await axios.get('http://localhost:3000/smithy/player-status');
      setPlayerStatus(response.data);
    } catch (error) {
      console.error('Error fetching player status:', error);
      setErrorMessage('Fehler beim Laden des Spielerstatus.');
    }
  };

  const fetchSmithyItems = async () => {
    try {
      const response = await axios.get('http://localhost:3000/smithy/items');
      setSmithyItems(response.data);
    } catch (error) {
      console.error('Error fetching smithy items:', error);
      setErrorMessage('Fehler beim Laden der Schmiede-Items.');
    }
  };

  const fetchQuests = async () => {
    try {
      const response = await axios.get('http://localhost:3000/smithy/quests');
      setActiveQuests(response.data);
    } catch (error) {
      console.error('Error fetching quests:', error);
      setErrorMessage('Fehler beim Laden der Quests.');
    }
  };

  const fetchQuestLog = async () => {
    try {
      const response = await axios.get('http://localhost:3000/smithy/quest-log');
      setQuestLog(response.data);
    } catch (error) {
      console.error('Error fetching quest log:', error);
      setErrorMessage('Fehler beim Laden des Quest-Logs.');
    }
  };

  const buyItem = async (itemName) => {
    try {
      const response = await axios.post('http://localhost:3000/smithy/buy', { itemName });
      setSmithyItems(response.data.smithyItems);
      setPlayerStatus(response.data.playerStatus);
      setInventoryItems(response.data.inventoryItems);
      setInfoMessage(response.data.message);
      setErrorMessage('');
    } catch (error) {
      console.error('Error buying item:', error);
      setErrorMessage(error.response?.data?.message || 'Fehler beim Kauf des Items.');
    }
  };

  const sellItem = async (itemName) => {
    try {
      const response = await axios.post('http://localhost:3000/smithy/sell', { itemName });
      setInventoryItems(response.data.inventoryItems);
      setInfoMessage(response.data.message);
      setErrorMessage('');
    } catch (error) {
      console.error('Error selling item:', error);
      setErrorMessage(error.response?.data?.message || 'Fehler beim Verkauf des Items.');
    }
  };

  const completeQuest = async (questId) => {
    try {
      const response = await axios.post('http://localhost:3000/smithy/complete-quest', { questId });
      setInventoryItems(response.data.inventoryItems);
      setActiveQuests(response.data.activeQuests);
      setQuestLog(response.data.questLog);
      setPlayerStatus(response.data.playerStatus);
      setErrorMessage('');
      setLastCompletedQuest(null);
    } catch (error) {
      console.error('Error completing quest:', error);
      if (error.response && error.response.data) {
        setQuestErrorMessage(error.response.data.message);
      } else {
        setQuestErrorMessage('Fehler beim Abschließen der Quest.');
      }
    }
  };

  const acceptQuest = async () => {
    try {
      const response = await axios.post('http://localhost:3000/smithy/accept-quest');
      setActiveQuests(response.data.activeQuests);
      setQuestLog(response.data.questLog);
      setErrorMessage('');
      setTalkingToKeeper(false);
      setLastCompletedQuest(null);
    } catch (error) {
      console.error('Error accepting quest:', error);
      setQuestErrorMessage(error.response?.data?.message || 'Fehler beim Annehmen der Quest.');
    }
  };

  const handleSleep = async () => {
    try {
      const response = await axios.post('http://localhost:3000/smithy/sleep');
      setPlayerStatus(response.data.playerStatus);
      setInfoMessage(response.data.message);
      setErrorMessage('');
      setQuestLog(response.data.questLog);
    } catch (error) {
      console.error('Error sleeping:', error);
      setErrorMessage(error.response?.data?.message || 'Fehler beim Schlafen.');
    }
  };

  const handleTalkToKeeper = () => {
    setTalkingToKeeper(!talkingToKeeper);
  };

  const renderQuestLogEntry = (entry, index) => {
    if (typeof entry === 'string') {
      return <p key={index}>{entry}</p>;
    } else if (entry.type === 'Cooldown') {
      return (
        <p key={index} className="cooldown-entry">
          {entry.message}
        </p>
      );
    } else {
      return null;
    }
  };

  const isCooldownActive = questLog.some(entry => entry.type === 'Cooldown');

  return (
    <div className="Schmiede">
      <h1>Zisch & Klatsch Metallwerke GmbH ⚒️</h1>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      
      {questErrorMessage && <p className="error-message">{questErrorMessage}</p>}

      <button className="talk-button" onClick={handleTalkToKeeper}>
        Mit Schmied sprechen
      </button>

      {talkingToKeeper && (
        <div className="keeper-buttons">
          
          <button
            className="accept-quest-button"
            onClick={acceptQuest}
            disabled={isCooldownActive || activeQuests.length >= 3}
          >
            Quest annehmen
          </button>
        </div>
      )}

      <div className="player-status">
        <h3>Spielerstatus</h3>
        <p>Gold: {playerStatus.money} 💰</p>
        <p>HP: {playerStatus.hp}/{playerStatus.maxHp} ❤️</p>
      </div>

      <div className="content">
        <div className="smithy">
          <h2>Items</h2>
          <ul>
            {smithyItems.map((item, index) => (
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

        <div className="quest-section">
          <h2 className="quest-log-title">Schmiede-Log</h2>
          <div className="quest-log">
            <div className="log-content">
              {questLog.map((entry, index) => renderQuestLogEntry(entry, index))}
              <div ref={logEndRef} />
            </div>
          </div>
        </div>

        <div className="quest">
          <h2>Quests</h2>
          {isCooldownActive ? (
            <>
              {lastCompletedQuest ? (
                <>
                  <p><strong>Letzte abgeschlossene Quest:</strong> {lastCompletedQuest}</p>
                  <p>Du kannst neue Quests erst annehmen, wenn der Schmied neue Aufgaben hat.</p>
                </>
              ) : (
                <p>Neue Aufgaben werden erstellt...</p>
              )}
            </>
          ) : activeQuests.length > 0 ? (
            <>
              {activeQuests.map((quest) => (
                <div key={quest.id} className="active-quest">
                  <p><strong>Quest:</strong> {quest.name}</p>
                  <p><strong>Ort:</strong> {quest.location}</p>
                  <ul>
                    {quest.requirements.map((req, reqIndex) => (
                      <li key={reqIndex}>
                        {req.name}: {req.quantity}
                      </li>
                    ))}
                  </ul>
                  <p>
                    Status: <span className="in-progress">Noch offen</span>
                  </p>
                  <button onClick={() => completeQuest(quest.id)}>Quest abschließen</button>
                </div>
              ))}
            </>
          ) : (
            <p>Keine aktiven Quests. Du kannst eine neue Quest annehmen.</p>
          )}
          {questErrorMessage && <p className="error-message">{questErrorMessage}</p>}
        </div>
      </div>
    </div>
  );
}

export default Schmiede;
