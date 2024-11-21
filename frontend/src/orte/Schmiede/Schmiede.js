import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Schmiede.css';

function Schmiede() {
  const [smithyItems, setSmithyItems] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [quest, setQuest] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [questErrorMessage, setQuestErrorMessage] = useState('');

  // Fetch smithy items and active quest on component mount
  useEffect(() => {
    const fetchSmithyItems = async () => {
      try {
        const response = await axios.get('http://localhost:3000/smithy/items');
        setSmithyItems(response.data);
      } catch (error) {
        console.error('Error fetching smithy items:', error);
        setErrorMessage('Fehler beim Laden der Schmiede-Items.');
      }
    };

    const fetchQuest = async () => {
      try {
        const response = await axios.get('http://localhost:3000/smithy/quest');
        setQuest(response.data);
      } catch (error) {
        console.error('Error fetching quest:', error);
        setQuestErrorMessage('Fehler beim Laden der Quest.');
      }
    };

    fetchSmithyItems();
    fetchQuest();
  }, []);

  // Buy item from the smithy
  const buyItem = async (itemName) => {
    try {
      const response = await axios.post('http://localhost:3000/smithy/buy', { itemName });
      const updatedItems = smithyItems.map((item) =>
        item.name === itemName ? { ...item, quantity: item.quantity - 1 } : item
      );
      setSmithyItems(updatedItems);
      setInventoryItems((prevInventory) => [
        ...prevInventory,
        response.data.inventoryItems.find((item) => item.name === itemName),
      ]);
      setErrorMessage('');
    } catch (error) {
      console.error('Error buying item:', error);
      setErrorMessage('Fehler beim Kauf des Items.');
    }
  };

  // Sell item from inventory
  const sellItem = async (itemName) => {
    try {
      await axios.post('http://localhost:3000/smithy/sell', { itemName });
      setInventoryItems((prevInventory) =>
        prevInventory.filter((item) => item.name !== itemName)
      );
      setErrorMessage('');
    } catch (error) {
      console.error('Error selling item:', error);
      setErrorMessage('Fehler beim Verkauf des Items.');
    }
  };

  // Complete the active quest
  const completeQuest = async () => {
    try {
      const response = await axios.post('http://localhost:3000/smithy/complete-quest');
      setQuest({ ...quest, completed: true });
      setInventoryItems(response.data.inventoryItems);
      setQuestErrorMessage('');
      alert('Quest abgeschlossen!');
    } catch (error) {
      console.error('Error completing quest:', error);
      if (error.response && error.response.data) {
        setQuestErrorMessage(error.response.data.message);
      } else {
        setQuestErrorMessage('Fehler beim Abschließen der Quest.');
      }
    }
  };

  // Generate a new random quest
  const generateNewQuest = async () => {
    try {
      const response = await axios.post('http://localhost:3000/smithy/quest/new');
      setQuest(response.data);
      setQuestErrorMessage('');
      alert('Neue Quest generiert!');
    } catch (error) {
      console.error('Error generating new quest:', error);
      setQuestErrorMessage('Fehler beim Generieren einer neuen Quest.');
    }
  };

  return (
    <div className="Schmiede">
      <h1> Zisch & Klatsch Metallwerke GmbH ⚒️</h1>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      <div className="smithy">
        <ul>
          {smithyItems.map((item) => (
            <li key={item.name}>
              <div>{item.name}</div>
              <div>{item.type}</div>
              <div>{item.price} Gold</div>
              <div>Verfügbar: {item.quantity}</div>
              <button
                onClick={() => buyItem(item.name)}
                disabled={item.quantity <= 0}
              >
                {item.quantity > 0 ? 'Kaufen' : 'Ausverkauft'}
              </button>
            </li>
          ))}
        </ul>
      </div>
      
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
            {!quest.completed && (
              <button onClick={completeQuest}>Quest abschließen</button>
            )}
            {questErrorMessage && <p className="error-message">{questErrorMessage}</p>}
          </>
        ) : (
          <p>Keine aktive Quest gefunden.</p>
        )}
        <button onClick={generateNewQuest}>Neue Quest generieren</button>
      </div>
    </div>
  );
}

export default Schmiede;
