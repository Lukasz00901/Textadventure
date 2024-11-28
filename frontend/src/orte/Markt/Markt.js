// frontend/Markt.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Markt.css';

function Markt() {
  const [marketItems, setMarketItems] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [playerStatus, setPlayerStatus] = useState({ money: 0, hp: 0, maxHp: 0 });
  const [questLog, setQuestLog] = useState([]); // Zustand für den Questlog
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [questErrorMessage, setQuestErrorMessage] = useState('');

  // Neue State-Variablen für den Marktinteraktion
  const [talkingToTrader, setTalkingToTrader] = useState(false);
  const [showSellSection, setShowSellSection] = useState(false);
  const [selectedSellItem, setSelectedSellItem] = useState('');

  // Funktion zum Abrufen der Markt-Items
  const fetchMarketItems = async () => {
    try {
      const response = await axios.get('http://localhost:3000/market/items');
      setMarketItems(response.data);
    } catch (error) {
      console.error('Error fetching market items:', error);
      setErrorMessage('Fehler beim Laden der Markt-Items.');
    }
  };

  // Funktion zum Abrufen des Spielerstatus
  const fetchPlayerStatus = async () => {
    try {
      const response = await axios.get('http://localhost:3000/market/player-status');
      setPlayerStatus(response.data);
    } catch (error) {
      console.error('Error fetching player status:', error);
      setErrorMessage('Fehler beim Laden des Spielerstatus.');
    }
  };

  // Funktion zum Abrufen des Quest-Logs
  const fetchQuestLog = async () => {
    try {
      const response = await axios.get('http://localhost:3000/market/quest-log');
      setQuestLog(response.data);
    } catch (error) {
      console.error('Error fetching quest log:', error);
      setErrorMessage('Fehler beim Laden des Quest-Logs.');
    }
  };

  // Fetch market items, Spielerstatus und Quest-Log beim Mounten des Components
  useEffect(() => {
    const fetchData = async () => {
      await fetchMarketItems();
      await fetchPlayerStatus();
      await fetchQuestLog();
      await fetchInventoryItems(); // Inventar beim Laden abrufen
    };
    fetchData();
  }, []);

  // Timer zum regelmäßigen Aktualisieren des Quest-Logs
  useEffect(() => {
    const interval = setInterval(() => {
      fetchQuestLog();
      fetchMarketItems(); // Markt-Items regelmäßig aktualisieren
      fetchPlayerStatus(); // Spielerstatus regelmäßig aktualisieren
    }, 5000); // Aktualisiere alle 5 Sekunden

    return () => clearInterval(interval); // Aufräumen beim Unmounten
  }, []);

  // Funktion zum Abrufen des Inventars
  const fetchInventoryItems = async () => {
    try {
      const response = await axios.get('http://localhost:3000/market/inventory');
      setInventoryItems(response.data);
    } catch (error) {
      console.error('Error fetching inventory items:', error);
      setErrorMessage('Fehler beim Laden des Inventars.');
    }
  };

  // Kauf eines Items vom Markt
  const buyItem = async (itemName) => {
    try {
      const response = await axios.post('http://localhost:3000/market/buy', { itemName });

      // Aktualisiere die Markt-Items
      const updatedItems = marketItems.map((item) =>
        item.name === itemName ? { ...item, quantity: item.quantity - 1 } : item
      );
      setMarketItems(updatedItems);

      // Aktualisiere das Inventar
      setInventoryItems((prevInventory) => {
        const existingItem = prevInventory.find((item) => item.name === itemName);
        if (existingItem) {
          return prevInventory.map((item) =>
            item.name === itemName ? { ...item, quantity: item.quantity + 1 } : item
          );
        } else {
          return [...prevInventory, { name: itemName, quantity: 1 }];
        }
      });

      // Aktualisiere den Spielerstatus
      if (response.data.playerStatus) {
        setPlayerStatus(response.data.playerStatus);
      }

      // Aktualisiere den Quest-Log
      if (response.data.questLog) {
        setQuestLog(response.data.questLog);
      }

      setInfoMessage(response.data.message || 'Item gekauft.');
      setErrorMessage('');
    } catch (error) {
      console.error('Error buying item:', error);
      setErrorMessage(error.response?.data?.message || 'Fehler beim Kauf des Items.');
    }
  };

  // Verkauf eines Items aus dem Inventar
  const sellItem = async (itemName) => {
    try {
      const response = await axios.post('http://localhost:3000/market/sell', { itemName });

      // Aktualisiere das Inventar
      setInventoryItems((prevInventory) =>
        prevInventory
          .map((item) =>
            item.name === itemName ? { ...item, quantity: item.quantity - 1 } : item
          )
          .filter((item) => item.quantity > 0)
      );

      // Aktualisiere den Spielerstatus
      if (response.data.playerStatus) {
        setPlayerStatus(response.data.playerStatus);
      }

      // Aktualisiere den Quest-Log
      if (response.data.questLog) {
        setQuestLog(response.data.questLog);
      }

      setInfoMessage(response.data.message || 'Item verkauft.');
      setErrorMessage('');
    } catch (error) {
      console.error('Error selling item:', error);
      setErrorMessage(error.response?.data?.message || 'Fehler beim Verkauf des Items.');
    }
  };

  // Funktion zum Umschalten des Gesprächs mit dem Markthändler
  const handleTalkToTrader = () => {
    setTalkingToTrader(!talkingToTrader);
    setShowSellSection(false); // Verkaufsbereich beim Umschalten schließen
  };

  // Funktion zum Umschalten des Verkaufsbereichs
  const toggleSellSection = () => {
    setShowSellSection(!showSellSection);
    setSelectedSellItem(''); // Ausgewähltes Item zurücksetzen
  };

  // Funktion zum Handhaben der Auswahl eines Items zum Verkauf
  const handleSellSelection = (e) => {
    setSelectedSellItem(e.target.value);
  };

  // Funktion zur Bestätigung des Verkaufs
  const confirmSell = async () => {
    if (selectedSellItem) {
      await sellItem(selectedSellItem);
      setSelectedSellItem('');
      setShowSellSection(false);
    }
  };

  return (
    <div className="Markt">
      <h1>Marktplatz 💰</h1>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      {questErrorMessage && <p className="error-message">{questErrorMessage}</p>}
      {infoMessage && <p className="info-message">{infoMessage}</p>}

      {/* Button: Mit Markthändler sprechen */}
      <button className="talk-button" onClick={handleTalkToTrader}>
        Mit Markthändler sprechen
      </button>

      {/* Bedingte Anzeige der Buttons */}
      {talkingToTrader && (
        <div className="trader-buttons">
          <button className="sell-button" onClick={toggleSellSection}>
            Verkaufen
          </button>

          {/* Verkaufsbereich */}
          {showSellSection && (
            <div className="sell-section">
              {inventoryItems.length > 0 ? (
                <>
                  <select value={selectedSellItem} onChange={handleSellSelection}>
                    <option value="">-- Wähle ein Item zum Verkaufen --</option>
                    {inventoryItems.map((item) => (
                      <option key={item.name} value={item.name}>
                        {item.name} (Anzahl: {item.quantity}, Wert: {item.price} Gold)
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
                <p>Keine Items zum Verkaufen vorhanden.</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Spielerstatus anzeigen */}
      <div className="player-status">
        <h3>Spielerstatus</h3>
        <p>Gold: {playerStatus.money} 💰</p>
        <p>HP: {playerStatus.hp}/{playerStatus.maxHp} ❤️</p>
      </div>

      {/* Inhalt mit flexbox */}
      <div className="content">
        {/* Item-Liste */}
        <div className="market">
          <h2>Items</h2>
          <ul>
            {marketItems.map((item) => (
              <li key={item.name}>
                <div className="item-text">
                  <span className="item-name">{item.name}</span>
                  <span className="item-description">{item.type}</span>
                  <span className="item-price">{item.price} Gold</span>
                  <span className="item-quantity">Verfügbar: {item.quantity}</span>
                </div>
                <button
                  className="item-button"
                  onClick={() => buyItem(item.name)}
                  disabled={item.quantity <= 0 || playerStatus.money < item.price}
                >
                  {item.quantity > 0 ? 'Kaufen' : 'Ausverkauft'}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Quest Log neben der Item-Liste */}
        <div className="quest-section">
          <h2 className="quest-log-title">Markt Log</h2>
          <div className="quest-log">
            <div className="log-content">
              {questLog.map((entry, index) => {
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
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Markt;
