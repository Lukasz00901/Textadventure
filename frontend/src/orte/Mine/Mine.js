import React, { useState } from 'react';

const Mine = () => {
  const [hasPickaxe, setHasPickaxe] = useState(false);

  const mineOre = async () => {
    try {
      const response = await fetch('http://localhost:3000/mine/mine', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.addedItems.length > 0) {
        // Zeige nur die tatsächlich gesammelten Items an
        alert(
          `Erz erfolgreich geschürft: ${data.addedItems
            .map((item) => `${item.quantity}x ${item.name}`)
            .join(', ')}`
        );
      } else {
        alert('Keine Erze geschürft!');
      }
    } catch (error) {
      console.error('Fehler beim Schürfen:', error);
      alert('Fehler beim Schürfen!');
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Schürferspaß-Deluxe</h1> {/* Name der Mine eingefügt */}
      {!hasPickaxe ? (
        <>
          <p>Ich brauche eine Hacke, um Erz zu schürfen. Hey, da liegt ja eine Hacke!</p>
          <button
            onClick={() => setHasPickaxe(true)}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              cursor: 'pointer',
            }}
          >
            Hacke nehmen
          </button>
        </>
      ) : (
        <>
          <p>Jetzt kann ich Erze schürfen.</p>
          <button
            onClick={mineOre}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              cursor: 'pointer',
            }}
          >
            Erz Schürfen
          </button>
        </>
      )}
    </div>
  );
}
  
  export default Mine;
  
