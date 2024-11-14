import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Markt.css';

function Markt() {
  const [marketItems, setMarketItems] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch market items on component mount
  useEffect(() => {
    const fetchMarketItems = async () => {
      try {
        const response = await axios.get('http://localhost:3000/market/items');
        setMarketItems(response.data);
      } catch (error) {
        console.error('Error fetching market items:', error);
        setErrorMessage('Fehler beim Laden der Markt-Items.');
      }
    };
    fetchMarketItems();
  }, []);

  // Buy item from the market
  const buyItem = async (itemId) => {
    try {
      const response = await axios.post('http://localhost:3000/market/buy', { itemId });
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
      const response = await axios.post('http://localhost:3000/market/sell', { itemId });
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
      <h1>Markt</h1>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      <div className="market">
        <h2>Verfügbare Items</h2>
        <ul>
          {marketItems.map((item) => (
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

export default Markt;
