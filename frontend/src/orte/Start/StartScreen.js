// src/StartScreen.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './StartScreen.css';

const StartScreen = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/inventar'); // Leitet zur Haupt-App weiter
  };

  return (
    <div className="StartScreen">
      <h1>Willkommen zum Spiel</h1>
      <button onClick={handleStart}>Starten</button>
    </div>
  );
};

export default StartScreen;
