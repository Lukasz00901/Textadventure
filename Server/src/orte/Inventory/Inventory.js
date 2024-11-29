// frontend/src/orte/Inventory/Inventory.js
import React, { useState, useEffect } from 'react';
import './Inventory.css'; // Import der CSS-Datei

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // State für Benachrichtigungen
  const [notification, setNotification] = useState({ message: '', type: '' }); // type: 'success' oder 'error'

  // Liste von zufälligen Erfolgsmeldungen
  const successMessages = [
"Weg damit! Dieser Gegenstand wollte sowieso nicht bleiben.", "Tschüssi, Item! Möge es in den virtuellen Himmel fliegen.", "Auf Nimmerwiedersehen, du digitaler Ballast!", "Mach's gut, Gegenstand! Wir werden dich nicht vermissen.", "Item gelöscht! Zeit für etwas Neues.", "Leb wohl, kleines Datenpaket!", "Ab in den Datenmüll mit dir!", "Und weg bist du! So schnell kann's gehen.", "Bye-bye, unnötiges Item!", "Das war's, Gegenstand. Deine Reise endet hier.", "Ein Klick, und du bist Geschichte.", "Das Inventar sagt: 'Danke für den freien Platz!'", "Item entfernt. Jetzt herrscht wieder Ordnung.", "Tschüss, du Staubfänger!", "Auf Wiedersehen, du Platzverschwender!", "Gelöscht und vergessen!", "Dein Speicherplatz gehört jetzt uns!", "Das Item ist weg. Ruhe in digitalen Frieden.", "Ein letztes Lebewohl, kleines Item.", "Und tschüss! Mach's gut im Daten-Nirwana.", "Item gelöscht. Endlich mehr Platz für Wichtiges.", "Du bist frei, Gegenstand! Frei von meinem Inventar.", "Das war's dann wohl, Item.", "Adieu, du unnötiger Kram!", "Der Papierkorb freut sich auf dich.", "Item gelöscht. Wir sind besser ohne dich dran.", "Mach's gut, Datenmüll!", "Du wurdest entfernt. Kein Grund zur Sorge.", "Bis nie wieder, Gegenstand!", "Zeit für den Abschied. Tschüss!", "Item entfernt. Auf zu neuen Abenteuern!", "Und weg ist es! So einfach geht das.", "Dein Platz wurde neu vergeben.", "Auf Wiedersehen, Datenklumpen!", "Das Inventar sagt: 'Leb wohl!'", "Du bist gelöscht. Kein Zurück mehr.", "Mach's gut, digitale Last.", "Dein Speicherplatz wird neu genutzt.", "Item entfernt. Jetzt herrscht wieder Ordnung.", "Das war der letzte Klick für dich.", "Tschüss, Gegenstand! Vielleicht sieht man sich nie wieder.", "Du bist weg. Fühlt sich gut an.", "Item gelöscht. Ein weiterer Schritt zur Ordnung.", "Leb wohl, du unnützes Etwas!", "Deine Zeit ist abgelaufen. Tschüss!", "Ab in den digitalen Ruhestand mit dir.", "Gelöscht und vergessen. So soll's sein.", "Das Item ist weg. Endlich!", "Auf Nimmerwiedersehen, kleines Item.", "Ein Klick, und du bist Geschichte.", "Item entfernt. Das fühlt sich richtig an.", "Tschau, Gegenstand! War nett mit dir.", "Du bist gelöscht. Mach's gut!", "Zeit für Neues. Tschüss, altes Item!", "Der Platz ist frei. Danke fürs Gehen.", "Mach's gut, du digitales Relikt.", "Item gelöscht. Keine Tränen nötig.", "Auf Wiedersehen, du unnötige Datei!", "Dein Speicherplatz wird besser genutzt.", "Du bist weg. Das ist okay so.", "Gelöscht! Und keiner wird dich vermissen.", "Tschüss, Gegenstand! Auf ins Daten-Nichts.", "Ein letztes Adieu, kleines Item.", "Dein Abenteuer endet hier.", "Item entfernt. Weiter geht's!", "Du bist frei. Und wir auch.", "Leb wohl, digitale Bürde!", "Das war's, Gegenstand. Lebe wohl.", "Mach's gut, du Platzverschwender!", "Item gelöscht. Weiter zum nächsten.", "Du bist weg. Das Inventar freut sich.", "Auf Wiedersehen, du alte Datei.", "Gelöscht und vergessen. So läuft das.", "Tschüssi, Item! Wir sehen uns nicht mehr.", "Dein Platz wird neu vergeben.", "Item entfernt. Ein guter Tag!", "Du bist gelöscht. Und das ist gut so.", "Mach's gut, digitaler Ballast.", "Leb wohl, unnötiges Item!", "Das war der letzte Akt für dich.", "Item gelöscht. Zeit für Veränderung.", "Auf Nimmerwiedersehen, Datenklumpen!", "Du bist weg. Das fühlt sich gut an.", "Gelöscht! Danke für nichts.", "Tschau, Gegenstand! Es war nett.", "Ein Klick, und du bist fort.", "Item entfernt. Platz für Neues.", "Du bist gelöscht. Keine Sorge.", "Mach's gut, du virtuelle Last.", "Leb wohl, altes Item!", "Das Inventar sagt: 'Danke und tschüss!'", "Item gelöscht. Wir machen Platz.", "Auf Wiedersehen, du alte Datei.", "Du bist weg. Endlich Ordnung!", "Gelöscht und vorbei.", "Tschüss, Gegenstand! Bis nie wieder.", "Dein Platz wird neu vergeben.", "Item entfernt. Weiter so!", "Du bist gelöscht. Fühlt sich gut an.", "Mach's gut, du digitale Altlast.", "Leb wohl, unnötiges Ding!", "Das war's, Item. Danke für nichts.", "Item gelöscht. Weiter geht's.", "Auf Nimmerwiedersehen, du Datenhaufen.", "Du bist weg. Das Inventar jubelt.",
  ];

  // Funktion zum Abrufen von Items
  const fetchItems = async (endpoint) => {
    console.log(`Abrufe Items von: ${endpoint}`);
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://87.106.217.227:3000/inventory/${endpoint}`);
      console.log('Antwort Status:', response.status);
      if (!response.ok) {
        throw new Error('Netzwerkantwort war nicht ok');
      }
      const data = await response.json();
      console.log('Abruf-Daten:', data);
      setItems(data.items);
    } catch (err) {
      console.error('Fehler beim Abrufen der Daten:', err);
      setError('Fehler beim Abrufen der Daten.');
    } finally {
      setLoading(false);
    }
  };

  // Funktion zum Löschen eines Items
  const deleteItem = async (itemName, quantity) => {
    console.log(`Lösche ${quantity} von Item:`, itemName);

    try {
      const response = await fetch(`http://87.106.217.227:3000/inventory/item/${encodeURIComponent(itemName)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity }),
      });

      console.log('Antwort vom Server:', response);

      const data = await response.json();
      console.log('Daten vom Server:', data);

      if (response.ok) {
        if (data.remainingQuantity === 0) {
          // Entferne das gesamte Item aus dem State
          setItems(items.filter(item => item.name !== itemName));
        } else {
          // Aktualisiere die Menge des Items im State
          setItems(items.map(item => 
            item.name === itemName 
              ? { ...item, quantity: data.remainingQuantity } 
              : item
          ));
        }
        // Wähle eine zufällige Erfolgsmeldung aus der Liste
        const randomMessage = successMessages[Math.floor(Math.random() * successMessages.length)];
        setNotification({ message: randomMessage, type: 'success' }); // Erfolgsnachricht
      } else {
        setNotification({ message: data.message, type: 'error' }); // Fehlermeldung
      }
    } catch (err) {
      console.error('Fehler beim Löschen des Items:', err);
      setNotification({ message: 'Fehler beim Löschen des Items.', type: 'error' });
    }
  };

  // Automatisches Ausblenden der Benachrichtigung nach 4 Sekunden
  useEffect(() => {
    if (notification.message) {
      const timer = setTimeout(() => {
        setNotification({ message: '', type: '' });
      }, 10000); // 4 Sekunden

      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Initiale Abrufung aller Items
  useEffect(() => {
    fetchItems('all/items');
  }, []);

  return (
    <div className="inventory-container">
      <h1>Inventar 📜</h1>
      
      {/* Benachrichtigungsbereich */}
      {notification.message && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
      
      <div className="button-group">
        <button onClick={() => fetchItems('all/items')} className="button">Alle Items</button>
        <button onClick={() => fetchItems('equipment/items')} className="button">Equipment</button>
        <button onClick={() => fetchItems('consumable/items')} className="button">Consumables</button>
        <button onClick={() => fetchItems('misc/items')} className="button">Misc</button>
      </div>
      <div className="button-group">
        <button onClick={() => fetchItems('items/sort/strength')} className="button">Nach Stärke sortieren</button>
        <button onClick={() => fetchItems('items/sort/worth')} className="button">Nach Wert sortieren</button>
        <button onClick={() => fetchItems('items/sort/name')} className="button">Alphabetisch sortieren</button>
        <button onClick={() => fetchItems('items/sort/quantity')} className="button">Nach Menge sortieren</button>
      </div>
      {loading && <p>Lädt...</p>}
      {error && <p className="error">{error}</p>}
      
      {/* Scrollbarer Tabellenbereich */}
      <div className="table-container">
        {items.length > 0 ? (
          <table className="inventory-table">
            <thead>
              <tr>
                <th className="table-header">Name</th>
                <th className="table-header">Typ</th>
                <th className="table-header">Stärke</th>
                <th className="table-header">Kategorie</th>
                <th className="table-header">Wert</th>
                <th className="table-header">Menge</th>
                <th className="table-header" onClick={() => {window.open('/game/index.html', '_blank');}}>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.name}> {/* Verwende den Namen als Schlüssel */}
                  <td className="table-cell">{item.name}</td>
                  <td className="table-cell">{item.type}</td>
                  <td className="table-cell">{item.strength}</td>
                  <td className="table-cell">{item.category}</td>
                  <td className="table-cell">{item.worth}</td>
                  <td className="table-cell">{item.quantity}</td>
                  <td className="table-cell">
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        const quantity = parseInt(e.target.elements.quantity.value, 10);
                        if (isNaN(quantity) || quantity < 1) {
                          setNotification({ message: 'Bitte gib eine gültige Menge ein.', type: 'error' });
                          return;
                        }
                        deleteItem(item.name, quantity);
                        e.target.reset();
                      }}
                      className="delete-form"
                    >
                      <input 
                        type="number" 
                        name="quantity"
                        min="1" 
                        max={item.quantity} 
                        placeholder="Menge" 
                        required
                        className="quantity-input-inline"
                      />
                      <button type="submit" className="delete-button-inline">Löschen</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          !loading && <p>Keine Items gefunden.</p>
        )}
      </div>
    </div>
  );
};

export default Inventory;
