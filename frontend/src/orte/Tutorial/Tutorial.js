import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Tutorial.css';

const tutorialSteps = [
  "Willkommen beim Tutorial! Hier lernst du die Grundlagen des Spiels.",
  "1. Klicke auf die Orte im Menü, um verschiedene Aktionen durchzuführen.",
  "2. In der Mine kannst du Ressourcen sammeln.",
  "3. Im Markt kannst du Gegenstände kaufen und verkaufen.",
  "4. Die Schmiede erlaubt dir, Ausrüstung herzustellen.",
  "5. Achte auf deinen Inventarplatz! Du kannst nicht mehr tragen, als dein Platz erlaubt.",
  "6. Abenteuer erwarten dich! Der Wald und der Dungeon sind gefährlich, aber voller Belohnungen.",
  "Das Tutorial ist abgeschlossen. Klicke auf 'Weiter', um dein Abenteuer zu beginnen!"
];

const Tutorial = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const tutorialRef = useRef(null);

  const handleNextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      navigate('/inventar'); // Navigiere nach dem Tutorial zur Inventarseite oder einer anderen Hauptseite
    }
  };

  // Effekt: Automatisches Scrollen bei jedem neuen Schritt
  useEffect(() => {
    if (tutorialRef.current) {
      const scrollInterval = setInterval(() => {
        tutorialRef.current.scrollTop += 2; // Langsames Scrollen
        if (tutorialRef.current.scrollTop >= tutorialRef.current.scrollHeight - tutorialRef.current.clientHeight) {
          clearInterval(scrollInterval); // Stoppe das Scrollen, wenn das Ende erreicht ist
        }
      }, 30); // Scrollgeschwindigkeit
      return () => clearInterval(scrollInterval); // Timer bereinigen
    }
  }, [currentStep]);

  return (
    <div className="Tutorial" style={{ color: '#4e342e', fontFamily: 'Georgia, serif' }}>
      <h1 style={{ color: '#8b4513' }}>Spiel-Tutorial</h1>
      <div
        className="tutorial-content"
        ref={tutorialRef}
        style={{
          backgroundColor: '#f4e3c1',
          color: '#3e2723',
          border: '1px solid #a58f2f',
          borderRadius: '8px',
          padding: '10px',
        }}
      >
        {tutorialSteps.slice(0, currentStep + 1).map((step, index) => (
          <p key={index} style={{ marginBottom: '10px', lineHeight: '1.5em' }}>
            {step}
          </p>
        ))}
      </div>
      <button
        onClick={handleNextStep}
        className="tutorial-next-button"
        style={{
          backgroundColor: '#160e0c',
          color: '#f0c040',
          padding: '10px 20px',
          fontSize: '1.2em',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          marginTop: '20px',
          transition: 'background-color 0.3s ease',
        }}
        onMouseOver={(e) => (e.target.style.backgroundColor = '#3e2723')}
        onMouseOut={(e) => (e.target.style.backgroundColor = '#160e0c')}
      >
        {currentStep < tutorialSteps.length - 1 ? 'Weiter' : 'Ab ins Abenteuer!'}
      </button>
    </div>
  );
};

export default Tutorial;
