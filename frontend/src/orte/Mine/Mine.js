import React, { useState, useEffect, useRef } from 'react';
import './Mine.css'; // Stelle sicher, dass die CSS-Datei importiert wird

const Mine = () => {
  const [hasPickaxe, setHasPickaxe] = useState(false);
  const [gatheredResources, setGatheredResources] = useState([]);
  const resourcesEndRef = useRef(null);

  const mineOre = async () => {
    try {
      const response = await fetch('http://localhost:3000/mine/mine', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      setGatheredResources((prevResources) => [
        ...prevResources,
        ...data.addedItems,
        { separator: true },
      ]);
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
          <button className="button" onClick={mineOre}>
            Erz Schürfen
          </button>
        </>
      )}

      <div className="resource-box">
        <h2>Gesammelte Erze:</h2>
        {gatheredResources.length > 0 ? (
          <ul>
            {gatheredResources.map((resource, index) =>
              resource.separator ? (
                <hr key={`separator-${index}`} className="resource-separator" />
              ) : (
                <li key={index}>
                  {resource.quantity}x {resource.name}
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
