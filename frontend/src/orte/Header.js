// src/orte/Header/Header.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const location = useLocation(); // Zum Überprüfen des aktiven Links

  return (
    <nav className="Header">
      <ul>
        <li>
          <Link to="/inventar" className={location.pathname === '/inventar' ? 'active' : ''}>
            Inventar
          </Link>
        </li>
        <li>
          <Link to="/dungeon" className={location.pathname === '/dungeon' ? 'active' : ''}>
            Dungeon
          </Link>
        </li>
        <li>
          <Link to="/markt" className={location.pathname === '/markt' ? 'active' : ''}>
            Markt
          </Link>
        </li>
        <li>
          <Link to="/schmiede" className={location.pathname === '/schmiede' ? 'active' : ''}>
            Schmiede
          </Link>
        </li>
        <li>
          <Link to="/wald" className={location.pathname === '/wald' ? 'active' : ''}>
            Wald
          </Link>
        </li>
        <li>
          <Link to="/mine" className={location.pathname === '/mine' ? 'active' : ''}>
            Mine
          </Link>
        </li>
        <li>
          <Link to="/taverne" className={location.pathname === '/taverne' ? 'active' : ''}>
            Taverne
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Header;
