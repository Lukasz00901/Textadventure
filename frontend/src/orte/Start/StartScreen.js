// src/StartScreen.js
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './StartScreen.css';

const dialogLines = [
  "Du wandelst über den Marktplatz und füllst gerade deine Vorräte auf, als ein Fremder dich anspricht.",
  "Fremder: „Ah, ein neuer Wanderer, erkenne ich wohl? Ihr habt den festen Schritt und den Blick eines Abenteurers. Sagt, habt Ihr schon von Schwarzbach vernommen?“",
  "(Du schüttelst den Kopf.)",
  "Fremder: „Nicht? Ha, das erstaunt mich. Die meisten Reisenden sprechen kaum von etwas anderem! Es ist ein kleines Dorf tief verborgen in den Wäldern von Valoria. Von außen mag es wie jedes andere erscheinen: schlichte Häuser, gepflasterte Wege, und der Duft von frisch gebackenem Brot liegt in der Luft.“",
  "(Der Fremde beugt sich näher, seine Stimme wird zum Flüstern.)",
  "Fremder: „Doch Schwarzbach... ist anders. Die Leute dort kennen Dinge, die andernorts längst vergessen sind. Alte Sagen, längst verklungene Lieder und Geheimnisse, die im Schatten verborgen liegen. Es heißt, die Quelle im Herzen des Dorfes erfülle Wünsche, wenn man bereit ist, den Preis zu zahlen.“",
  "(Er lehnt sich zurück, nimmt einen tiefen Schluck aus seinem Krug und lächelt verschmitzt.)",
  "Fremder: „Ich selbst habe es einst besucht. Was ich dort erlebte... nun, das ist eine Geschichte für einen anderen Abend. Aber ich sage Euch, wenn Ihr wahrhaftig Abenteuer sucht, dann macht Euch auf den Weg dorthin. Vielleicht findet Ihr dort mehr, als Ihr zu hoffen wagt.“",
  "(Der Fremde nickt dir zu, erhebt sich und verschwindet in der Menge, bevor du mehr fragen kannst.)",
  "(Du blickst dem Fremden nach und vollendest dann wieder deine Einkäufe. In einer Taverne findest du Rast und schläfst bis zum nächsten Morgen, um dich anschließend auf den Pfad deines nächsten Abenteuers zu begeben.)"
];

const StartScreen = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const dialogRef = useRef(null); // Ref für das Dialog-Element

  const handleNext = () => {
    if (currentStep < dialogLines.length) {
      setCurrentStep(prevStep => prevStep + 1);
    }
  };

  const handleStart = () => {
    navigate('/inventar'); // Leitet zur Haupt-App weiter
  };

  // Effekt, um nach jedem Update zu scrollen
  useEffect(() => {
    if (dialogRef.current) {
      dialogRef.current.scrollTop = dialogRef.current.scrollHeight;
    }
  }, [currentStep]);

  return (
    <div className="StartScreen">
      <h1>Willkommen zum Spiel</h1>
      <div className="dialog" ref={dialogRef}>
        {dialogLines.slice(0, currentStep).map((line, index) => (
          <p key={index}>{line}</p>
        ))}
      </div>
      {currentStep < dialogLines.length ? (
        <button onClick={handleNext} className="next-button">
          Weiter
        </button>
      ) : (
        <button onClick={handleStart} className="start-button">
          Ab ins Abenteuer!
        </button>
      )}
    </div>
  );
};

export default StartScreen;
