// frontend/Schmiede.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Schmiede.css';

function Schmiede() {
  const [smithyItems, setSmithyItems] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [activeQuests, setActiveQuests] = useState([]);
  const [lastCompletedQuest, setLastCompletedQuest] = useState(null); // Neue State-Variable
  const [playerStatus, setPlayerStatus] = useState({ money: 0, hp: 0, maxHp: 0 });
  const [errorMessage, setErrorMessage] = useState('');
  const [questErrorMessage, setQuestErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [talkingToKeeper, setTalkingToKeeper] = useState(false);
  const [questLog, setQuestLog] = useState([]); // Zustand für den Questlog

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        await fetchPlayerStatus();
        await fetchSmithyItems();
        await fetchQuests();
        await fetchQuestLog(); // Quest-Log beim Laden abrufen
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setErrorMessage('Fehler beim Laden der Schmiede-Daten.');
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    // Starte einen Timer, der das Quest-Log jede Sekunde aktualisiert
    const interval = setInterval(() => {
      fetchQuestLog();
      fetchQuests(); // Aktive Quests regelmäßig aktualisieren
    }, 1000); // 1000 ms = 1 Sekunde

    return () => clearInterval(interval); // Aufräumen beim Unmounten
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
      // Kein zusätzlicher Aufruf von fetchQuestLog notwendig, da der Timer das Quest-Log automatisch aktualisiert
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
      // Kein zusätzlicher Aufruf von fetchQuestLog notwendig, da der Timer das Quest-Log automatisch aktualisiert
    } catch (error) {
      console.error('Error selling item:', error);
      setErrorMessage(error.response?.data?.message || 'Fehler beim Verkauf des Items.');
    }
  };

  // Funktion: Quest abschließen
  const completeQuest = async (questName) => {
    try {
      const response = await axios.post('http://localhost:3000/smithy/complete-quest', { questName });
      setInventoryItems(response.data.inventoryItems);
      setActiveQuests(response.data.activeQuests);
      setQuestLog(response.data.questLog);
      setInfoMessage('Quest abgeschlossen!');
      setErrorMessage('');
      setLastCompletedQuest(questName); // Setze den Namen der letzten abgeschlossenen Quest
      // Kein zusätzlicher Aufruf von fetchQuestLog oder fetchQuests notwendig
    } catch (error) {
      console.error('Error completing quest:', error);
      if (error.response && error.response.data) {
        setQuestErrorMessage(error.response.data.message);
      } else {
        setQuestErrorMessage('Fehler beim Abschließen der Quest.');
      }
    }
  };

  // Funktion: Quest annehmen
  const acceptQuest = async () => {
    try {
      const response = await axios.post('http://localhost:3000/smithy/accept-quest');
      setActiveQuests(response.data.activeQuests);
      setQuestLog(response.data.questLog);
      setInfoMessage('Neue Quest angenommen.');
      setErrorMessage('');
      setTalkingToKeeper(false);
      setLastCompletedQuest(null); // Zurücksetzen der letzten abgeschlossenen Quest
      // Kein zusätzlicher Aufruf von fetchQuestLog oder fetchQuests notwendig
    } catch (error) {
      console.error('Error accepting quest:', error);
      setQuestErrorMessage(error.response?.data?.message || 'Fehler beim Annehmen der Quest.');
    }
  };


  // Funktion: Mit Schmied sprechen
  const handleTalkToKeeper = () => {
    setTalkingToKeeper(!talkingToKeeper);
  };

  // Funktion zum Rendern einzelner Quest-Log-Einträge
  const renderQuestLogEntry = (entry, index) => {
    if (typeof entry === 'string') {
      // Einfacher Text-Eintrag
      return <p key={index}>{entry}</p>;
    } else if (entry.type === 'Cooldown') {
      // Cooldown-Eintrag - nur die Nachricht anzeigen, da sie bereits die verbleibende Zeit enthält
      return (
        <p key={index} className="cooldown-entry">
          {entry.message}
        </p>
      );
    } else {
      // Andere Typen können hier hinzugefügt werden
      return null;
    }
  };

  // Funktion zur Überprüfung, ob ein Cooldown aktiv ist
  const isCooldownActive = questLog.some(entry => entry.type === 'Cooldown');

  return (
    <div className="Schmiede">
      <h1>Zisch & Klatsch Metallwerke GmbH ⚒️</h1>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      

      {/* Button: Mit Schmied sprechen */}
      <button className="talk-button" onClick={handleTalkToKeeper}>
        Mit Schmied sprechen
      </button>

      {/* Bedingte Anzeige der Buttons */}
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

        {/* Quest Log */}
        <div className="quest-section">
          <h2 className="quest-log-title">Schmiede-Log</h2>
          <div className="quest-log">
            <div className="log-content">
              {questLog.map((entry, index) => renderQuestLogEntry(entry, index))}
            </div>
          </div>
        </div>

        {/* Aktive Quests */}
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
              {activeQuests.map((quest, index) => (
                <div key={index} className="active-quest">
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
                  <button onClick={() => completeQuest(quest.name)}>Quest abschließen</button>
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
