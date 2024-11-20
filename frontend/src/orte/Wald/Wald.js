import React, { useState } from 'react';

const Wald = () => {
  // State für den Zustand der UI
  const [hasAxe, setHasAxe] = useState(false);

  // Funktion für die POST-Anfrage
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
      alert(`Ressourcen erfolgreich gesammelt: ${data.addedItems
        .map(item => `${item.quantity}x ${item.name}`)
        .join(', ')}`);
    } catch (error) {
      console.error('Fehler beim Sammeln:', error);
      alert('Fehler beim Sammeln der Ressourcen!');
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      {!hasAxe ? (
        <>
          <p>Ich brauche eine Axt, um Holz zu sammeln. Hey, da liegt ja eine Axt!</p>
          <button
            onClick={() => setHasAxe(true)}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              cursor: 'pointer',
            }}
          >
            Axt nehmen
          </button>
        </>
      ) : (
        <>
          <p>Jetzt kann ich Holz und Rinde sammeln.</p>
          <button
            onClick={gatherWood}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              cursor: 'pointer',
            }}
          >
            Ressourcen Sammeln
          </button>
        </>
      )}
    </div>
  );
};

export default Wald;