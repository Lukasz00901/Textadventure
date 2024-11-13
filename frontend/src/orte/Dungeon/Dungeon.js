// src/Dungeon.js
import React, { useState } from 'react';
import axios from 'axios';
import './Dungeon.css'; // Importiere die spezifischen Stile für Dungeon

const Dungeon = () => {
  const [raumZaehler, setRaumZaehler] = useState(0);
  const [log, setLog] = useState([]);
  const [spielerGesundheit, setSpielerGesundheit] = useState(50);
  const [ereignis, setEreignis] = useState(null);
  const [fehler, setFehler] = useState(null);

  const handleEreignis = async () => {
    try {
      setFehler(null); // Fehler zurücksetzen
      const schwierigkeit = 1; // Hier kann der Spieler eine Schwierigkeitsstufe einstellen
      const response = await axios.get(`http://localhost:3000/ereignis?schwierigkeit=${schwierigkeit}`);
      const ereignis = response.data;
      setEreignis(ereignis);
      setRaumZaehler(ereignis.raumZaehler);
      setSpielerGesundheit(ereignis.spielerGesundheit);
      setLog((prevLog) => [...prevLog, ...(ereignis.kampfLog || [ereignis.beschreibung])]);
    } catch (error) {
      console.error('Fehler beim Abrufen des Ereignisses:', error);
      setFehler('Es gab ein Problem beim Laden des Ereignisses. Bitte versuche es später erneut.');
    }
  };

  return (
    <div className="Dungeon">
      <header className="Dungeon-header">
        <h1>Text Adventure</h1>
        <p>Spieler Gesundheit: {spielerGesundheit}</p>
        <p>Raum Zähler: {raumZaehler}</p>
        {spielerGesundheit === 0 && (
          <p>Du wurdest besiegt! Deine Gesundheit wurde zurückgesetzt.</p>
        )}
        <button onClick={handleEreignis}>Nächstes Ereignis</button>
        {fehler && (
          <div className="fehler">
            <p>{fehler}</p>
          </div>
        )}
        <div className="log-container">
          <h2>Log</h2>
          <div className="log">
            {log.map((eintrag, index) => (
              <p key={index}>{eintrag}</p>
            ))}
          </div>
        </div>
      </header>
    </div>
  );
};

export default Dungeon;
