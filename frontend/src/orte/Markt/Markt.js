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
  const buyItem = async (itemName) => {
    try {
      const response = await axios.post('http://localhost:3000/market/buy', { itemName });
      const updatedItems = marketItems.map((item) =>
        item.name === itemName ? { ...item, quantity: item.quantity - 1 } : item
      );
      setMarketItems(updatedItems);
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
      await axios.post('http://localhost:3000/market/sell', { itemName });
      setInventoryItems((prevInventory) =>
        prevInventory.filter((item) => item.name !== itemName)
      );
      setErrorMessage('');
    } catch (error) {
      console.error('Error selling item:', error);
      setErrorMessage('Fehler beim Verkauf des Items.');
    }
  };

  return (
    <div className="Markt">
      <h1>Marktplatz 💰</h1>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      <div className="market">
        <ul>
          {marketItems.map((item) => (
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
      
    </div>
  );
}

export default Markt;
