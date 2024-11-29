// frontend/Markt.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Markt.css';

function Markt() {
  const [marketItems, setMarketItems] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [playerStatus, setPlayerStatus] = useState({ money: 0, hp: 0, maxHp: 0 });
  const [questLog, setQuestLog] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [questErrorMessage, setQuestErrorMessage] = useState('');

  const [talkingToTrader, setTalkingToTrader] = useState(false);
  const [showSellSection, setShowSellSection] = useState(false);
  const [selectedSellItem, setSelectedSellItem] = useState('');

  const fetchMarketItems = async () => {
    try {
      const response = await axios.get('http://localhost:3000/market/items');
      setMarketItems(response.data);
    } catch (error) {
      console.error('Error fetching market items:', error);
      setErrorMessage('Fehler beim Laden der Markt-Items.');
    }
  };

  const fetchPlayerStatus = async () => {
    try {
      const response = await axios.get('http://localhost:3000/market/player-status');
      setPlayerStatus(response.data);
    } catch (error) {
      console.error('Error fetching player status:', error);
      setErrorMessage('Fehler beim Laden des Spielerstatus.');
    }
  };

  const fetchQuestLog = async () => {
    try {
      const response = await axios.get('http://localhost:3000/market/quest-log');
      setQuestLog(response.data);
    } catch (error) {
      console.error('Error fetching quest log:', error);
      setErrorMessage('Fehler beim Laden des Quest-Logs.');
    }
  };

  const fetchInventoryItems = async () => {
    try {
      const response = await axios.get('http://localhost:3000/market/inventory');
      setInventoryItems(response.data);
    } catch (error) {
      console.error('Error fetching inventory items:', error);
      setErrorMessage('Fehler beim Laden des Inventars.');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchMarketItems();
      await fetchPlayerStatus();
      await fetchQuestLog();
      await fetchInventoryItems();
    };
    fetchData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchQuestLog();
      fetchMarketItems();
      fetchPlayerStatus();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const buyItem = async (itemName) => {
    try {
      const response = await axios.post('http://localhost:3000/market/buy', { itemName });

      const updatedItems = marketItems.map((item) =>
        item.name === itemName ? { ...item, quantity: item.quantity - 1 } : item
      );
      setMarketItems(updatedItems);

      setInventoryItems((prevInventory) => {
        const existingItem = prevInventory.find((item) => item.name === itemName);
        if (existingItem) {
          return prevInventory.map((item) =>
            item.name === itemName ? { ...item, quantity: item.quantity + 1 } : item
          );
        } else {
          return [...prevInventory, { name: itemName, quantity: 1, type: '', category: '', strength: 0, worth: 0 }];
        }
      });

      if (response.data.playerStatus) {
        setPlayerStatus(response.data.playerStatus);
      }

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

  const sellItem = async (itemName, strength, worth) => {
    try {
      const response = await axios.post('http://localhost:3000/market/sell', { itemName, strength, worth });

      setInventoryItems((prevInventory) =>
        prevInventory
          .map((item) =>
            item.name === itemName ? { ...item, quantity: item.quantity - 1 } : item
          )
          .filter((item) => item.quantity > 0)
      );

      if (response.data.playerStatus) {
        setPlayerStatus(response.data.playerStatus);
      }

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

  const handleTalkToTrader = () => {
    setTalkingToTrader(!talkingToTrader);
    setShowSellSection(false);
  };

  const toggleSellSection = () => {
    setShowSellSection(!showSellSection);
    setSelectedSellItem('');
  };

  const handleSellSelection = (e) => {
    setSelectedSellItem(e.target.value);
  };

  const confirmSell = async () => {
    if (selectedSellItem) {
      try {
        const itemData = JSON.parse(selectedSellItem);
        await sellItem(itemData.name, itemData.strength, itemData.worth);
        setSelectedSellItem('');
        setShowSellSection(false);
      } catch (error) {
        console.error('Error parsing selectedSellItem:', error);
        setErrorMessage('Fehler beim Parsen des ausgewählten Items.');
      }
    }
  };

  return (
    <div className="Markt">
      <h1>Marktplatz 💰</h1>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      {questErrorMessage && <p className="error-message">{questErrorMessage}</p>}
      {infoMessage && <p className="info-message">{infoMessage}</p>}

      <button className="talk-button" onClick={handleTalkToTrader}>
        Mit Markthändler sprechen
      </button>

      {talkingToTrader && (
        <div className="trader-buttons">
          <button className="sell-button" onClick={toggleSellSection}>
            Verkaufen
          </button>

          {showSellSection && (
            <div className="sell-section">
              {inventoryItems.filter(item => item.category === 'consumable').length > 0 ? (
                <>
                  <select value={selectedSellItem} onChange={handleSellSelection}>
                    <option value="">-- Wähle ein Item zum Verkaufen --</option>
                    {inventoryItems
                      .filter(item => item.category === 'consumable')
                      .map((item, index) => (
                        <option
                          key={`${item.name}-${item.strength}-${item.worth}-${index}`}
                          value={JSON.stringify({ name: item.name, strength: item.strength, worth: item.worth })}
                        >
                          {item.name} (Stärke: {item.strength}, Wert: {item.worth} Münzen) (Anzahl: {item.quantity})
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
                <p>Keine Consumables zum Verkaufen vorhanden.</p>
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
        <div className="market">
          <h2>Items</h2>
          <ul>
            {marketItems.map((item) => (
              <li key={item.name}>
                <div className="item-text">
                  <span className="item-name">{item.name}</span>
                  <span className="item-description">{item.type}</span>
                  <span className="item-price">{item.price} Münzen</span>
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

        <div className="quest-section">
          <h2 className="quest-log-title">Markt Log</h2>
          <div className="quest-log">
            <div className="log-content">
              {questLog.map((entry, index) => {
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
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Markt;
