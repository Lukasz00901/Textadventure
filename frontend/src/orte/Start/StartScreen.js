import React, { useState, useRef, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import './StartScreen.css';
import { PlayerContext } from '../../PlayerContext';

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
  const [isDialogRunning, setIsDialogRunning] = useState(false);
  const [name, setName] = useState('');
  const [isNameSubmitted, setIsNameSubmitted] = useState(false);
  const dialogRef = useRef(null);
  const { setPlayerName } = useContext(PlayerContext); // Verwende den Context

  const handleStartDialog = () => {
    setIsDialogRunning(true);
  };

  const handleSubmitName = async (e) => {
    e.preventDefault();
    if (name.trim() === '') {
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/player', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name })
      });

      const data = await response.json();

      if (response.ok) {
        setIsNameSubmitted(true);
        setPlayerName(data.name); // Setze den Namen im Context
      } else {
        console.error('Fehler beim Speichern des Namens:', data.error);
      }
    } catch (error) {
      console.error('Fehler beim Setzen des Namens:', error);
    }
  };

  // Effekt: Satz für Satz automatisch anzeigen
  useEffect(() => {
    if (isDialogRunning && currentStep < dialogLines.length) {
      const interval = setInterval(() => {
        setCurrentStep((prevStep) => prevStep + 1);
      }, 3000); // Nächster Satz alle 3 Sekunden
      return () => clearInterval(interval); // Bereinigen
    }

    if (currentStep === dialogLines.length) {
      // Navigiere nach der Einleitung zur Tutorial-Seite
      const delayTimer = setTimeout(() => {
        navigate('/tutorial');
      }, 5000); // 5 Sekunden Verzögerung für den letzten Satz
      return () => clearTimeout(delayTimer); // Bereinigen
    }
  }, [isDialogRunning, currentStep, navigate]);

  // Effekt: Automatisches Scrollen
  useEffect(() => {
    if (dialogRef.current) {
      const scrollInterval = setInterval(() => {
        dialogRef.current.scrollTop += 2; // Langsames Scrollen
        if (dialogRef.current.scrollTop >= dialogRef.current.scrollHeight - dialogRef.current.clientHeight) {
          clearInterval(scrollInterval); // Stoppe das Scrollen, wenn das Ende erreicht ist
        }
      }, 30); // Scrollgeschwindigkeit
      return () => clearInterval(scrollInterval); // Bereinigen
    }
  }, [currentStep]);

  return (
    <div className="StartScreen">
      <h1>Willkommen in den Hallen der Finsternis.</h1>
      {!isNameSubmitted && ( // Namenseingabe unter der Überschrift
        <form onSubmit={handleSubmitName} className="name-form">
          <input
            type="text"
            placeholder="Gib deinen Namen ein"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <button type="submit">Name speichern</button>
        </form>
      )}
      {isNameSubmitted && ( // Zeige Dialogfeld erst, wenn der Name gespeichert wurde
        <>
          <div className="dialog" ref={dialogRef}>
            {dialogLines.slice(0, currentStep).map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
          {!isDialogRunning && (
            <button onClick={handleStartDialog} className="start-dialog-button">
              Weiter
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default StartScreen;
