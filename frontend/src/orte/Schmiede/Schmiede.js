import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Schmiede.css';

function Schmiede() {
  const [smithyItems, setSmithyItems] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch smithy items on component mount
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
    fetchSmithyItems();
  }, []);

  // Buy item from the smithy
  const buyItem = async (itemId) => {
    try {
      const response = await axios.post('http://localhost:3000/smithy/buy', { itemId });
      const updatedItems = smithyItems.map((item) =>
        item.id === itemId ? { ...item, quantity: item.quantity - 1 } : item
      );
      setSmithyItems(updatedItems);
      setInventoryItems((prevInventory) => [
        ...prevInventory,
        response.data.inventoryItems.find((item) => item.id === itemId),
      ]);
      setErrorMessage('');
    } catch (error) {
      console.error('Error buying item:', error);
      setErrorMessage('Fehler beim Kauf des Items.');
    }
  };

  // Sell item from inventory
  const sellItem = async (itemId) => {
    try {
      await axios.post('http://localhost:3000/smithy/sell', { itemId });
      setInventoryItems((prevInventory) =>
        prevInventory.filter((item) => item.id !== itemId)
      );
      setErrorMessage('');
    } catch (error) {
      console.error('Error selling item:', error);
      setErrorMessage('Fehler beim Verkauf des Items.');
    }
  };

  return (
    <div className="Schmiede">
      <h1>Schmiede</h1>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      <div className="smithy">
        <ul>
          {smithyItems.map((item) => (
            <li key={item.id}>
              <div>{item.name}</div>
              <div>{item.type}</div>
              <div>{item.price} Gold</div>
              <div>Verfügbar: {item.quantity}</div>
              <button
                onClick={() => buyItem(item.id)}
                disabled={item.quantity <= 0}
              >
                {item.quantity > 0 ? 'Kaufen' : 'Ausverkauft'}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="inventory">
        <h2>Inventar</h2>
        <ul>
          {inventoryItems.map((item) => (
            <li key={item.id}>
              <div>{item.name}</div>
              <div>{item.type}</div>
              <button onClick={() => sellItem(item.id)}>Verkaufen</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Schmiede;
