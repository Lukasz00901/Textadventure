// src/PlayerContext.js
import React, { createContext, useState, useEffect } from 'react';

// Erstelle den Kontext
export const PlayerContext = createContext();

// Erstelle den Provider
export const PlayerProvider = ({ children }) => {
  const [playerName, setPlayerName] = useState('');

  // Funktion zum Abrufen des Spielernamens vom Backend
  const fetchPlayerName = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/player');
      const data = await response.json();
      if (data.name) {
        setPlayerName(data.name);
      }
    } catch (error) {
      console.error('Fehler beim Abrufen des Spielernamens:', error);
    }
  };

  // Beim Mounten des Providers den Spielernamen abrufen
  useEffect(() => {
    fetchPlayerName();
  }, []);

  return (
    <PlayerContext.Provider value={{ playerName, setPlayerName }}>
      {children}
    </PlayerContext.Provider>
  );
};
