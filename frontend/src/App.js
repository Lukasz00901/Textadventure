// src/App.js
// src/App.js
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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

const App = () => {
  return (
    <Router>
      <BodyClassManager>
        <div className="App">
          <Header />
          <div className="Content">
            <Routes>
              <Route path="/" element={<Start />} />
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
  );
};

// Component to dynamically set the body class based on the current route
const BodyClassManager = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    // Remove any existing body classes
    document.body.className = '';

    // Add a class based on the current route
    switch (location.pathname) {
      case '/inventar':
        document.body.classList.add('inventory-page');
        break;
      case '/dungeon':
        document.body.classList.add('dungeon-page');
        break;
      case '/markt':
        document.body.classList.add('market-page');
        break;
      case '/schmiede':
        document.body.classList.add('schmiede-page');
        break;
      case '/wald':
        document.body.classList.add('wald-page');
        break;
      case '/mine':
        document.body.classList.add('mine-page');
        break;
      case '/taverne':
        document.body.classList.add('taverne-page');
        break;
      default:
        break;
    }
  }, [location]);

  return <>{children}</>;
};

export default App;
