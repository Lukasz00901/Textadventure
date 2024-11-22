import React, { useState, useEffect, useRef } from 'react';
import './Wald.css'; // Stelle sicher, dass die CSS-Datei importiert wird

const Wald = () => {
  const [hasAxe, setHasAxe] = useState(false);
  const [gatheredResources, setGatheredResources] = useState([]);
  const resourcesEndRef = useRef(null);

  const gatherWood = async () => {
    try {
      const response = await fetch('http://localhost:3000/wald/gather', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      console.log(data);
      setGatheredResources((prevResources) => [
        ...prevResources,
        ...data.addedItems,
        { separator: true },
      ]);
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
          <button className="button" onClick={gatherWood}>
            Materialien Sammeln
          </button>
        </>
      )}

      <div className="resource-box">
        <h2>Gesammelte Materialien:</h2>
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
          <p>Es wurden noch keine Materialien gesammelt.</p>
        )}
      </div>
    </div>
  );
};

export default Wald;
