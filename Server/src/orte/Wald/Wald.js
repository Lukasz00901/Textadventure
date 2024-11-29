//Frontend Wald.js
import React, { useState, useEffect, useRef } from 'react';
import './Wald.css'; // Stelle sicher, dass die CSS-Datei importiert wird

const Wald = () => {
  const [hasAxe, setHasAxe] = useState(false);
  const [gatheredResources, setGatheredResources] = useState([]);
  const [isCooldown, setIsCooldown] = useState(false); // *** Hinzugefügt ***
  const [remainingCooldown, setRemainingCooldown] = useState(0); // *** Hinzugefügt ***
  const resourcesEndRef = useRef(null);

  const gatherWood = async () => {
    try {
      const response = await fetch('http://87.106.217.227:3000/wald/gather', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      console.log(data);

      if (response.status === 201) {
        // *** Erfolgreiches Sammeln ***
        setGatheredResources((prevResources) => [
          ...prevResources,
          ...data.addedItems,
          { separator: true },
        ]);

        // *** Überprüfen, ob Cooldown aktiviert wurde ***
        if (data.cooldown) {
          setIsCooldown(true);
          const remaining = data.cooldownEndTime - Date.now();
          setRemainingCooldown(remaining);

          // *** Startet einen Timer für den Cooldown ***
          const timer = setInterval(() => {
            const newRemaining = data.cooldownEndTime - Date.now();
            if (newRemaining <= 0) {
              clearInterval(timer);
              setIsCooldown(false);
              setRemainingCooldown(0);
            } else {
              setRemainingCooldown(newRemaining);
            }
          }, 1000);
        }
      } else if (response.status === 429) {
        // *** Cooldown aktiv ***
        setGatheredResources((prevResources) => [
          ...prevResources,
          { name: data.message, quantity: 0 },
          { separator: true },
        ]);
        setIsCooldown(true);
        setRemainingCooldown(data.remainingTime);

        // *** Startet einen Timer für den Cooldown ***
        const timer = setInterval(() => {
          const newRemaining = data.remainingTime - 1000;
          if (newRemaining <= 0) {
            clearInterval(timer);
            setIsCooldown(false);
            setRemainingCooldown(0);
          } else {
            setRemainingCooldown(newRemaining);
            data.remainingTime = newRemaining; // Aktualisiert die verbleibende Zeit
          }
        }, 1000);
      }
    } catch (error) {
      console.error('Fehler beim Sammeln:', error);
      setGatheredResources((prevResources) => [
        ...prevResources,
        { name: 'Fehler beim Sammeln der Ressourcen!', quantity: 0 },
        { separator: true },
      ]);
    }
  };

  useEffect(() => {
    if (resourcesEndRef.current) {
      resourcesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [gatheredResources]);

  // *** Formatierung der verbleibenden Zeit ***
  const formatTime = (milliseconds) => {
    const totalSeconds = Math.ceil(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}m ${seconds}s`;
  };

  return (
    <div className="wald-container">
      <h1>Tannenspitzental 🌲</h1>
      {!hasAxe ? (
        <>
          <p>Ich brauche eine Axt, um Materialien zu sammeln. Hey, da liegt ja eine Axt!</p>
          <button className="button" onClick={() => setHasAxe(true)}>
            Axt nehmen
          </button>
        </>
      ) : (
        <>
          <p>Jetzt kann ich die benötigten Materialien sammeln.</p>
          <button className="button" onClick={gatherWood} disabled={isCooldown}>
            Materialien Sammeln
          </button>
        </>
      )}

      {/* *** Anzeige des Cooldowns *** */}
      {isCooldown && (
        <div className="cooldown-message">
          <p>Warten bis zum nächsten Sammeln: {formatTime(remainingCooldown)}</p>
        </div>
      )}

      <div className="resource-box-wald">
        <h2>Gesammelte Materialien:</h2>
        {gatheredResources.length > 0 ? (
          <ul>
            {gatheredResources.map((resource, index) =>
              resource.separator ? (
                <hr key={`separator-${index}`} className="resource-separator" />
              ) : (
                <li key={index}>
                  {resource.quantity > 0 ? `${resource.quantity}x ` : ''}
                  {resource.name}
                </li>
              )
            )}
            <div ref={resourcesEndRef}></div>
          </ul>
        ) : (
          <p>Es wurden noch keine Materialien gesammelt.</p>
        )}
      </div>
    </div>
  );
};

export default Wald;
