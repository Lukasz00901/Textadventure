import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Taverne.css';

function Taverne() {
  const [tavernItems, setTavernItems] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch tavern items on component mount
  useEffect(() => {
    const fetchTavernItems = async () => {
      try {
        const response = await axios.get('http://localhost:3000/tavern/items');
        setTavernItems(response.data);
      } catch (error) {
        console.error('Error fetching tavern items:', error);
        setErrorMessage('Fehler beim Laden der Taverne-Items.');
      }
    };
    fetchTavernItems();
  }, []);

  // Buy item from the tavern
  const buyItem = async (itemId) => {
    try {
      const response = await axios.post('http://localhost:3000/tavern/buy', { itemId });
      const updatedItems = tavernItems.map((item) =>
        item.id === itemId ? { ...item, quantity: item.quantity - 1 } : item
      );
      setTavernItems(updatedItems);
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
      await axios.post('http://localhost:3000/tavern/sell', { itemId });
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
    <div className="Taverne">
      <h1>Taverne zum Singenden Säufer</h1>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      <div className="tavern">
        
        <ul>
          {tavernItems.map((item) => (
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
      
    </div>
  );
}

export default Taverne;
