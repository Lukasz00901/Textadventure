// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Header from './orte/Header';
import Inventory from './orte/Inventory/Inventory';
import Dungeon from './orte/Dungeon/Dungeon';
import Markt from './orte/Markt/Markt';
import Schmiede from './orte/Schmiede/Schmiede';
import Wald from './orte/Wald/Wald';
import Mine from './orte/Mine/Mine';
import Taverne from './orte/Taverne/Taverne';
import Start from './orte/Start/StartScreen';
import { PlayerProvider } from './PlayerContext';
import BodyClassManager from './orte/BodyClassManager'; // Korrigierter Pfad

const App = () => {
  return (
    <PlayerProvider>
      <Router>
        <BodyClassManager>
          <div className="App">
            <Header />
            <div className="Content">
              <Routes>
                <Route path="/" element={<Start className="start-wrapper"/>} />
                <Route path="/inventar" element={<Inventory />} />
                <Route path="/dungeon" element={<Dungeon />} />
                <Route path="/markt" element={<Markt />} />
                <Route path="/schmiede" element={<Schmiede />} />
                <Route path="/wald" element={<Wald />} />
                <Route path="/mine" element={<Mine />} />
                <Route path="/taverne" element={<Taverne />} />
                <Route path="*" element={<h2>404 - Seite nicht gefunden</h2>} />
              </Routes>
            </div>
          </div>
        </BodyClassManager>
      </Router>
    </PlayerProvider>
  );
};

export default App;
