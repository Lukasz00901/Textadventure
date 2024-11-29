// frontend/Header.js
import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Header.css';
import { PlayerContext } from '../PlayerContext'; // Korrigierter Pfad

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { playerName, setPlayerName } = useContext(PlayerContext);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNameValid, setIsNameValid] = useState(false); // Lokaler Zustand für die Validierung des Namens
  const dropdownRef = useRef(null);

  // Überprüfung, ob der Spielername gültig ist
  useEffect(() => {
    setIsNameValid(!!playerName); // Spielername als boolesche Bedingung auswerten
  }, [playerName]);

  const toggleDropdown = () => {
    if (isNameValid) {
      setIsDropdownOpen(prev => !prev);
    } else {
      navigate('/');
    }
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
      {/* Titel mit "Schwarzbach" */}
      <div className="header-title">
        <span className="app-name" onClick={toggleDropdown}>
          Schwarzbach
        </span>
        {playerName && (
          <span className="player-name">
            - {playerName}
          </span>
        )}
        {isDropdownOpen && (
          <div className="dropdown" ref={dropdownRef}>
            {isNameValid ? (
              <button onClick={handleLogout} className="dropdown-item">
                Abmelden
              </button>
            ) : (
              <button onClick={() => navigate('/')} className="dropdown-item">
                Anmelden/Registrieren
              </button>
            )}
          </div>
        )}
      </div>
      {/* Navigation */}
      <ul className="header-nav">
        <li>
          <Link
            to="/mine"
            className={location.pathname === '/mine' ? 'active' : ''}
            onClick={(e) => !isNameValid && e.preventDefault()}
            style={{ pointerEvents: isNameValid ? 'auto' : 'none', opacity: isNameValid ? 1 : 0.5 }}
          >
            Mine
          </Link>
        </li>
        <li>
          <Link
            to="/dungeon"
            className={location.pathname === '/dungeon' ? 'active' : ''}
            onClick={(e) => !isNameValid && e.preventDefault()}
            style={{ pointerEvents: isNameValid ? 'auto' : 'none', opacity: isNameValid ? 1 : 0.5 }}
          >
            Dungeon
          </Link>
        </li>
        <li>
          <Link
            to="/schmiede"
            className={location.pathname === '/schmiede' ? 'active' : ''}
            onClick={(e) => !isNameValid && e.preventDefault()}
            style={{ pointerEvents: isNameValid ? 'auto' : 'none', opacity: isNameValid ? 1 : 0.5 }}
          >
            Schmiede
          </Link>
        </li>
        <li>
          <Link
            to="/inventar"
            className={location.pathname === '/inventar' ? 'active' : ''}
            onClick={(e) => !isNameValid && e.preventDefault()}
            style={{ pointerEvents: isNameValid ? 'auto' : 'none', opacity: isNameValid ? 1 : 0.5 }}
          >
            Inventar
          </Link>
        </li>
        <li>
          <Link
            to="/taverne"
            className={location.pathname === '/taverne' ? 'active' : ''}
            onClick={(e) => !isNameValid && e.preventDefault()}
            style={{ pointerEvents: isNameValid ? 'auto' : 'none', opacity: isNameValid ? 1 : 0.5 }}
          >
            Taverne
          </Link>
        </li>
        <li>
          <Link
            to="/markt"
            className={location.pathname === '/markt' ? 'active' : ''}
            onClick={(e) => !isNameValid && e.preventDefault()}
            style={{ pointerEvents: isNameValid ? 'auto' : 'none', opacity: isNameValid ? 1 : 0.5 }}
          >
            Markt
          </Link>
        </li>
        <li>
          <Link
            to="/wald"
            className={location.pathname === '/wald' ? 'active' : ''}
            onClick={(e) => !isNameValid && e.preventDefault()}
            style={{ pointerEvents: isNameValid ? 'auto' : 'none', opacity: isNameValid ? 1 : 0.5 }}
          >
            Wald
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Header;
