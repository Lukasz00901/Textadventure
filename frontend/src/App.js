// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Header from './orte/Header';
import Inventory from './orte/Inventory/Inventory';
import Dungeon from './orte/Dungeon/Dungeon';
import Markt from './orte/Markt/Markt';
import Schmiede from './orte/Schmiede/Schmiede';
import Wald from './orte/Wald/Wald';
import Mine from './orte/Mine/Mine';
import Taverne from './orte/Taverne/Taverne';

const App = () => {
  return (
    <Router>
      <div className="App">
        <Header />
        <div className="Content">
          <Routes>
            <Route path="/" element={<Navigate to="/inventar" replace />} />
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
    </Router>
  );
};

export default App;
