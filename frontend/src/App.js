import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
  const [raumZaehler, setRaumZaehler] = useState(0);
  const [log, setLog] = useState([]);
  const [spielerGesundheit, setSpielerGesundheit] = useState(50);
  const [ereignis, setEreignis] = useState(null);

  const handleEreignis = async () => {
    try {
      const schwierigkeit = 1; // Hier kann der Spieler eine Schwierigkeitsstufe einstellen
      const response = await axios.get(`http://localhost:3000/ereignis?schwierigkeit=${schwierigkeit}`);
      const ereignis = response.data;
      setEreignis(ereignis);
      setRaumZaehler(ereignis.raumZaehler);
      setSpielerGesundheit(ereignis.spielerGesundheit);
      setLog((prevLog) => [...prevLog, ...ereignis.kampfLog || [ereignis.beschreibung]]);
    } catch (error) {
      console.error('Fehler beim Abrufen des Ereignisses:', error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Text Adventure</h1>
        <p>Spieler Gesundheit: {spielerGesundheit}</p>
        <p>Raum Zähler: {raumZaehler}</p>
        {spielerGesundheit === 0 && <p>Du wurdest besiegt! Deine Gesundheit wurde zurückgesetzt.</p>}
        <button onClick={handleEreignis}>Nächstes Ereignis</button>
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

export default App;