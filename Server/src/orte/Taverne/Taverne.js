// frontend/Taverne.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Taverne.css';

function Taverne() {
  const [tavernItems, setTavernItems] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [activeQuests, setActiveQuests] = useState([]);
  const [playerStatus, setPlayerStatus] = useState({ money: 0, hp: 0, maxHp: 0 });
  const [errorMessage, setErrorMessage] = useState('');
  const [questErrorMessage, setQuestErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [talkingToKeeper, setTalkingToKeeper] = useState(false);
  const [questLog, setQuestLog] = useState([]);

  // Neue State-Variablen für den Verkaufsbereich
  const [showSellSection, setShowSellSection] = useState(false);
  const [selectedSellItem, setSelectedSellItem] = useState('');

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        await fetchPlayerStatus();
        await fetchTavernItems();
        await fetchQuests();
        await fetchQuestLog();
        await fetchInventoryItems(); // Inventar beim Laden abrufen
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setErrorMessage('Fehler beim Laden der Taverne-Daten.');
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    // Starte einen Timer, der das Quest-Log jede Sekunde aktualisiert
    const interval = setInterval(() => {
      fetchQuestLog();
      fetchQuests();
    }, 1000); // 1000 ms = 1 Sekunde

    return () => clearInterval(interval); // Aufräumen beim Unmounten
  }, []);

  const fetchPlayerStatus = async () => {
    try {
      const response = await axios.get('http://87.106.217.227:3000/tavern/player-status');
      setPlayerStatus(response.data);
    } catch (error) {
      console.error('Error fetching player status:', error);
      setErrorMessage('Fehler beim Laden des Spielerstatus.');
    }
  };

  const fetchTavernItems = async () => {
    try {
      const response = await axios.get('http://87.106.217.227:3000/tavern/items');
      setTavernItems(response.data);
    } catch (error) {
      console.error('Error fetching tavern items:', error);
      setErrorMessage('Fehler beim Laden der Taverne-Items.');
    }
  };

  const fetchQuests = async () => {
    try {
      const response = await axios.get('http://87.106.217.227:3000/tavern/quests');
      setActiveQuests(response.data);
    } catch (error) {
      console.error('Error fetching quests:', error);
      setErrorMessage('Fehler beim Laden der Quests.');
    }
  };

  const fetchQuestLog = async () => {
    try {
      const response = await axios.get('http://87.106.217.227:3000/tavern/quest-log');
      setQuestLog(response.data);
    } catch (error) {
      console.error('Error fetching quest log:', error);
      setErrorMessage('Fehler beim Laden des Quest-Logs.');
    }
  };

  const fetchInventoryItems = async () => {
    try {
      const response = await axios.get('http://87.106.217.227:3000/tavern/inventory');
      setInventoryItems(response.data);
    } catch (error) {
      console.error('Error fetching inventory items:', error);
      setErrorMessage('Fehler beim Laden des Inventars.');
    }
  };

  const buyItem = async (itemName) => {
    try {
      const response = await axios.post('http://87.106.217.227:3000/tavern/buy', { itemName });
      setTavernItems(response.data.tavernItems);
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
      const response = await axios.post('http://87.106.217.227:3000/tavern/sell', { itemName });
      setPlayerStatus(response.data.playerStatus);
      setInventoryItems(response.data.inventoryItems);
      setInfoMessage(response.data.message);
      setErrorMessage('');
    } catch (error) {
      console.error('Error selling item:', error);
      setErrorMessage(error.response?.data?.message || 'Fehler beim Verkauf des Items.');
    }
  };

  // Funktion: Quest abschließen
  const completeQuest = async (questId) => {
    try {
      const response = await axios.post('http://87.106.217.227:3000/tavern/complete-quest', { questId });
      setInventoryItems(response.data.inventoryItems);
      setActiveQuests(response.data.activeQuests);
      setQuestLog(response.data.questLog);
      setPlayerStatus(response.data.playerStatus);
      setInfoMessage('Quest abgeschlossen! Du hast 10 Münzen erhalten.');
      setErrorMessage('');
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
      const response = await axios.post('http://87.106.217.227:3000/tavern/accept-quest');
      setActiveQuests(response.data.activeQuests);
      setQuestLog(response.data.questLog);
      setInfoMessage('Neue Quest angenommen.');
      setErrorMessage('');
      setTalkingToKeeper(false);
    } catch (error) {
      console.error('Error accepting quest:', error);
      setQuestErrorMessage(error.response?.data?.message || 'Fehler beim Annehmen der Quest.');
    }
  };

  // Funktion: Schlafen
  const handleSleep = async () => {
    try {
      const response = await axios.post('http://87.106.217.227:3000/tavern/sleep');
      setPlayerStatus(response.data.playerStatus);
      setInfoMessage(response.data.message);
      setErrorMessage('');
      setQuestLog(response.data.questLog);
    } catch (error) {
      console.error('Error sleeping:', error);
      setErrorMessage(error.response?.data?.message || 'Fehler beim Schlafen.');
    }
  };

  // Funktion: Mit Tavernenwirt sprechen
  const handleTalkToKeeper = () => {
    setTalkingToKeeper(!talkingToKeeper);
  };

  // Funktionen für den Verkaufsbereich
  const toggleSellSection = () => {
    setShowSellSection(!showSellSection);
    setSelectedSellItem(''); // Reset selected item when toggling
  };

  const handleSellSelection = (e) => {
    setSelectedSellItem(e.target.value);
  };

  const confirmSell = async () => {
    if (selectedSellItem) {
      await sellItem(selectedSellItem);
      setSelectedSellItem('');
      setShowSellSection(false);
    }
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

  // Filtern der "misc"-Items im Inventar
  const miscInventoryItems = inventoryItems.filter(item => item.category === 'misc');

  return (
    <div className="Taverne">
      <h1>Zum singenden Säufer 🍻</h1>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      {questErrorMessage && <p className="error-message">{questErrorMessage}</p>}
      {infoMessage && <p className="info-message">{infoMessage}</p>}

      {/* Button: Mit Tavernenwirt sprechen */}
      <button className="talk-button" onClick={handleTalkToKeeper}>
        Mit Tavernenwirt sprechen
      </button>

      {/* Bedingte Anzeige der Buttons */}
      {talkingToKeeper && (
        <div className="keeper-buttons">
          <button className="sleep-button" onClick={handleSleep}>
            Schlafen
          </button>
          <button
            className="accept-quest-button"
            onClick={acceptQuest}
            disabled={isCooldownActive || activeQuests.length >= 3}
          >
            Quest annehmen
          </button>
          <button
            className="sell-button"
            onClick={toggleSellSection}
          >
            Verkaufen
          </button>

          {/* Verkaufsbereich */}
          {showSellSection && (
            <div className="sell-section">
              {miscInventoryItems.length > 0 ? (
                <>
                  <select value={selectedSellItem} onChange={handleSellSelection}>
                    <option value="">-- Wähle ein Item zum Verkaufen --</option>
                    {miscInventoryItems.map((item) => (
                      <option key={item.name} value={item.name}>
                        {item.name} (Anzahl: {item.quantity}, Wert: {item.worth} Münzen)
                      </option>
                    ))}
                  </select>
                  <div className="sell-buttons">
                    <button onClick={confirmSell} disabled={!selectedSellItem}>
                      Verkaufen
                    </button>
                    <button onClick={toggleSellSection}>
                      Abbrechen
                    </button>
                  </div>
                </>
              ) : (
                <p>Keine "misc"-Items zum Verkaufen vorhanden.</p>
              )}
            </div>
          )}
        </div>
      )}

      <div className="player-status">
        <h3>Spielerstatus</h3>
        <p>Münzen: {playerStatus.money} 💰</p>
        <p>HP: {playerStatus.hp}/{playerStatus.maxHp} ❤️</p>
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
                  <span className="item-price">{item.price} Münzen</span>
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
          <h2 className="quest-log-title">Tavernen Log</h2>
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
            <p>Cooldown aktiv. Bitte warte, bevor du neue Quests annimmst.</p>
          ) : activeQuests.length > 0 ? (
            activeQuests.map((quest) => (
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
            ))
          ) : (
            <p>Keine aktiven Quests. Du kannst eine neue Quest annehmen.</p>
          )}
          {questErrorMessage && <p className="error-message">{questErrorMessage}</p>}
        </div>
      </div>
    </div>
  );
}

export default Taverne;
