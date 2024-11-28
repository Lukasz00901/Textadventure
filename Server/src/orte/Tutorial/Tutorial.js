import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Tutorial.css';

const tutorialSteps = [
  "Willkommen beim Tutorial! Hier lernst du die Grundlagen des Spiels.",
  "1. Klicke auf die Buttons oben in der Leiste, um an verschiedene Orte im Dorf reisen zu können.",
  "2. In der Mine kannst du Materialien sammeln.",
  "3. Im Markt kannst du Gegenstände kaufen.",
  "4. Die Schmiede und Taverne erlauben dir, Quests anzunehmen und abzuschließen.",
  "5. Achte auf deine HP im Dungeon!",
  "6. Abenteuer erwarten dich! Der Dungeon ist gefährlich, aber voller Belohnungen.",
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
    <div className="Tutorial">
      <h1>Tutorial</h1>
      <div className="tutorial-content" ref={tutorialRef}>
        {tutorialSteps.slice(0, currentStep + 1).map((step, index) => (
          <p key={index} className="tutorial-step">
            {step}
          </p>
        ))}
      </div>
      <button
        onClick={handleNextStep}
        className="tutorial-next-button"
      >
        {currentStep < tutorialSteps.length - 1 ? 'Weiter' : 'Ab ins Abenteuer!'}
      </button>
    </div>
  );
};

export default Tutorial;
