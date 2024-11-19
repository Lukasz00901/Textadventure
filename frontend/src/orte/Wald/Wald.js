import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Wald.css';

function Wald() {
  const [forestItems, setForestItems] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch wald items on component mount
  useEffect(() => {
    const fetchForestItems = async () => {
      try {
        const response = await axios.get('http://localhost:3000/wald/items');
        setForestItems(response.data);
      } catch (error) {
        console.error('Error fetching forest items:', error);
        setErrorMessage('Fehler beim Laden der Wald-Items.');
      }
    };
    fetchForestItems();
  }, []);

  // Collect item from the wald
  const collectItem = async (itemId) => {
    try {
      const response = await axios.post('http://localhost:3000/wald/collect', { itemId });
      setInventoryItems((prevInventory) => [
        ...prevInventory,
        response.data.inventoryItems.find((item) => item.id === itemId),
      ]);
      setErrorMessage('');
    } catch (error) {
      console.error('Error collecting item:', error);
      setErrorMessage('Fehler beim Sammeln des Items.');
    }
  };

  // Drop item from inventory
  const dropItem = async (itemId) => {
    try {
      const response = await axios.post('http://localhost:3000/wald/drop', { itemId });
      setInventoryItems((prevInventory) =>
        prevInventory.filter((item) => item.id !== itemId)
      );
      setErrorMessage('');
    } catch (error) {
      console.error('Error dropping item:', error);
      setErrorMessage('Fehler beim Ablegen des Items.');
    }
  };

  return (
    <div className="App">
      <h1>Wald der Flüsternden Bäume</h1>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      <div className="wald">
        <h2>Verfügbare Items</h2>
        <ul>
          {forestItems.map((item) => (
            <li key={item.id}>
              <div>{item.name}</div>
              <div>{item.type}</div>
              <div>{item.value} Gold</div>
              <button onClick={() => collectItem(item.id)}>Sammeln</button>
            </li>
          ))}
        </ul>
      </div>
      
    </div>
  );
}

export default Wald;
