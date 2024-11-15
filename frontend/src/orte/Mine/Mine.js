import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Mine.css';

function Mine() {
  const [mineItems, setMineItems] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch mine items on component mount
  useEffect(() => {
    const fetchMineItems = async () => {
      try {
        const response = await axios.get('http://localhost:3000/mine/items');
        setMineItems(response.data);
      } catch (error) {
        console.error('Error fetching mine items:', error);
        setErrorMessage('Fehler beim Laden der Mine-Items.');
      }
    };
    fetchMineItems();
  }, []);

  // Collect item from the mine
  const collectItem = async (itemId) => {
    try {
      const response = await axios.post('http://localhost:3000/mine/collect', { itemId });
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
      const response = await axios.post('http://localhost:3000/mine/drop', { itemId });
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
      <h1>Mine der Dunklen Tiefen</h1>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      <div className="mine">
        <h2>Verfügbare Items</h2>
        <ul>
          {mineItems.map((item) => (
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

export default Mine;
