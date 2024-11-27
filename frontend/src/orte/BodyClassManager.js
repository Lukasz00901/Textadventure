// src/orte/BodyClassManager.js
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const BodyClassManager = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    // Entferne alle vorhandenen Klassen vom Body
    document.body.className = '';

    // Füge eine Klasse basierend auf dem aktuellen Pfad hinzu
    switch (location.pathname) {
      case '/':
        document.body.classList.add('start-page');
        break;
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

export default BodyClassManager;
