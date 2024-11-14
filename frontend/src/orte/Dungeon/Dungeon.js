import React, { useState } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3000';

function Dungeon() {
  const [player, setPlayer] = useState(null);
  const [message, setMessage] = useState('');
  const [eventResponse, setEventResponse] = useState('');
  const [log, setLog] = useState([]);

  const addToLog = (entry) => {
    setLog((prevLog) => [...prevLog, entry]);
  };

  const handleGetEvent = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/event`);
      setPlayer(response.data.player);
      setEventResponse(response.data.event);
      setMessage(response.data.message || '');
      addToLog(`Event triggered: ${response.data.event}`);
      if (response.data.message) {
        addToLog(response.data.message);
      }
    } catch (error) {
      console.error('Error fetching event:', error);
      addToLog('Error fetching event. Please make sure the backend server is running and accessible.');
    }
  };

  const handleOpenChest = async (decision) => {
    try {
      const response = await axios.post(`${BACKEND_URL}/open-chest`, { decision });
      setPlayer(response.data.player);
      setMessage(response.data.message);
      addToLog(`Chest decision: ${decision}`);
      addToLog(response.data.message);
    } catch (error) {
      console.error('Error opening chest:', error);
      addToLog('Error opening chest. Please make sure the backend server is running and accessible.');
    }
  };

  const handleSetDifficulty = async (level) => {
    try {
      const response = await axios.post(`${BACKEND_URL}/difficulty`, { level });
      setMessage(response.data.message);
      addToLog(`Difficulty level set to: ${level}`);
      addToLog(response.data.message);
    } catch (error) {
      console.error('Error setting difficulty:', error);
      addToLog('Error setting difficulty. Please make sure the backend server is running and accessible.');
    }
  };

  return (
    <div>
      <h1>Dungeon Adventure</h1>
      {player && (
        <div>
          <p>HP: {player.hp}</p>
          <p>Room Counter: {player.roomCounter}</p>
          <p>Gold: {player.gold}</p>
          <p>Inventory: {player.inventory.map(item => (
            <span key={item.id}>{item.name} (Worth: {item.worth}), </span>
          ))}</p>
        </div>
      )}
      <p>{eventResponse}</p>
      <p>{message}</p>
      <button onClick={handleGetEvent}>Get Event</button>
      {eventResponse && eventResponse.includes('chest') && (
        <div>
          <button onClick={() => handleOpenChest('yes')}>Open Chest</button>
          <button onClick={() => handleOpenChest('no')}>Leave Chest</button>
        </div>
      )}
      <div>
        <input
          type="number"
          placeholder="Set Difficulty Level"
          onChange={(e) => handleSetDifficulty(e.target.value)}
        />
      </div>
      <div>
        <h2>Log</h2>
        <ul>
          {log.map((entry, index) => (
            <li key={index}>{entry}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Dungeon;
