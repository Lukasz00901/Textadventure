import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Taverne.css';

function Taverne() {
  const [tavernItems, setTavernItems] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch taverne items on component mount
  useEffect(() => {
    const fetchTavernItems = async () => {
      try {
        const response = await axios.get('http://localhost:3000/taverne/items');
        setTavernItems(response.data);
      } catch (error) {
        console.error('Error fetching tavern items:', error);
        setErrorMessage('Fehler beim Laden der Taverne-Items.');
      }
    };
    fetchTavernItems();
  }, []);

  // Buy item from the taverne
  const buyItem = async (itemId) => {
    try {
      const response = await axios.post('http://localhost:3000/taverne/buy', { itemId });
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
      const response = await axios.post('http://localhost:3000/taverne/sell', { itemId });
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
    <div className="App">
      <h1>Taverne zum Singenden Säufer</h1>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      <div className="taverne">
        <h2>Verfügbare Items</h2>
        <ul>
          {tavernItems.map((item) => (
            <li key={item.id}>
              <div>{item.name}</div>
              <div>{item.type}</div>
              <div>{item.price} Gold</div>
              <button onClick={() => buyItem(item.id)}>Kaufen</button>
            </li>
          ))}
        </ul>
      </div>
    
    </div>
  );
}

export default Taverne;
