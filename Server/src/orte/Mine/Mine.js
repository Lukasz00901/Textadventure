//Frontend Mine.js
import React, { useState, useEffect, useRef } from 'react';
import './Mine.css'; // Stelle sicher, dass die CSS-Datei importiert wird

const Mine = () => {
  const [hasPickaxe, setHasPickaxe] = useState(false);
  const [gatheredResources, setGatheredResources] = useState([]);
  const [isCooldown, setIsCooldown] = useState(false); // *** Hinzugefügt ***
  const [remainingCooldown, setRemainingCooldown] = useState(0); // *** Hinzugefügt ***
  const resourcesEndRef = useRef(null);

  const mineOre = async () => {
    try {
      const response = await fetch('http://87.106.217.227:3000/mine/mine', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      console.log(data);

      if (response.status === 201) {
        // *** Erfolgreiches Schürfen ***
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
      console.error('Fehler beim Schürfen:', error);
      setGatheredResources((prevResources) => [
        ...prevResources,
        { name: 'Fehler beim Schürfen der Erze!', quantity: 0 },
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
    <div className="mine-container">
      <h1>Schürferspaß-Deluxe ⛏️</h1>
      {!hasPickaxe ? (
        <>
          <p>Ich brauche eine Hacke, um Erz zu schürfen. Hey, da liegt ja eine Hacke!</p>
          <button className="button" onClick={() => setHasPickaxe(true)}>
            Hacke nehmen
          </button>
        </>
      ) : (
        <>
          <p>Jetzt kann ich Erze schürfen.</p>
          <button className="button" onClick={mineOre} disabled={isCooldown}>
            Erz Schürfen
          </button>
        </>
      )}

      {/* *** Anzeige des Cooldowns *** */}
      {isCooldown && (
        <div className="cooldown-message">
          <p>Warten bis zum nächsten sammeln: {formatTime(remainingCooldown)}</p>
        </div>
      )}

      <div className="resource-box-mine">
        <h2>Gesammelte Erze:</h2>
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
          <p>Es wurden noch keine Erze geschürft.</p>
        )}
      </div>
    </div>
  );
};

export default Mine;
