import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Schmiede.css';

function Schmiede() {
  const [smithyItems, setSmithyItems] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch schmiede items on component mount
  useEffect(() => {
    const fetchSmithyItems = async () => {
      try {
        const response = await axios.get('http://localhost:3000/schmiede/items');
        setSmithyItems(response.data);
      } catch (error) {
        console.error('Error fetching schmiede items:', error);
        setErrorMessage('Fehler beim Laden der Schmiede-Items.');
      }
    };
    fetchSmithyItems();
  }, []);

  // Buy item from the schmiede
  const buyItem = async (itemId) => {
    try {
      const response = await axios.post('http://localhost:3000/schmiede/buy', { itemId });
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
      const response = await axios.post('http://localhost:3000/schmiede/sell', { itemId });
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
      <h1>Schmiede</h1>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      <div className="schmiede">
        <h2>Verfügbare Items</h2>
        <ul>
          {smithyItems.map((item) => (
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

export default Schmiede;
