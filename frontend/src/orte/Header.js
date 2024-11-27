// src/orte/Header.js
import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Header.css';
import { PlayerContext } from '../PlayerContext'; // Korrigierter Pfad

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { playerName, setPlayerName } = useContext(PlayerContext);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setIsDropdownOpen(prev => !prev);
  };

  const handleNavigateStart = () => {
    navigate('/');
    setIsDropdownOpen(false);
  };

  const handleLogout = () => {
    setPlayerName('');
    setIsDropdownOpen(false);
    navigate('/');
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <nav className="Header">
      {/* Titel mit Spielernamen */}
      <div className="header-title">
        Schwarzbach{' '}
        {playerName && (
          <span className="player-name" onClick={toggleDropdown}>
            - {playerName}
          </span>
        )}
        {isDropdownOpen && (
          <div className="dropdown" ref={dropdownRef}>
            
            <button onClick={handleLogout} className="dropdown-item">
              Abmelden
            </button>
          </div>
        )}
      </div>
      {/* Navigation */}
      <ul className="header-nav">
        <li>
          <Link to="/mine" className={location.pathname === '/mine' ? 'active' : ''}>
            Mine
          </Link>
        </li>
        <li>
          <Link to="/dungeon" className={location.pathname === '/dungeon' ? 'active' : ''}>
            Dungeon
          </Link>
        </li>
        <li>
          <Link to="/schmiede" className={location.pathname === '/schmiede' ? 'active' : ''}>
            Schmiede
          </Link>
        </li>
        <li>
          <Link to="/inventar" className={location.pathname === '/inventar' ? 'active' : ''}>
            Inventar
          </Link>
        </li>
        <li>
          <Link to="/taverne" className={location.pathname === '/taverne' ? 'active' : ''}>
            Taverne
          </Link>
        </li>
        <li>
          <Link to="/markt" className={location.pathname === '/markt' ? 'active' : ''}>
            Markt
          </Link>
        </li>
        <li>
          <Link to="/wald" className={location.pathname === '/wald' ? 'active' : ''}>
            Wald
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Header;
