import React, { useState, useEffect } from 'react';
import './Inventory.css'; // Import der CSS-Datei

// Übersetzungsobjekt
const translations = {
  name: 'Name',
  type: 'Typ',
  strength: 'Stärke',
  category: 'Kategorie',
  worth: 'Wert',
  quantity: 'Menge',
  weapon: 'Waffe',
  equipment: 'Ausrüstung',
  consumable: 'Heilung',
  misc: 'Gegenstände',
  gold: 'Gold',
  buy: 'Kaufen',
  sell: 'Verkaufen',
};

// Funktion, um Backend-Daten vor der Anzeige zu übersetzen (falls nötig)
const translateItemKeys = (items) => {
  return items.map((item) => ({
    ...item,
    type: translations[item.type] || item.type,
    category: translations[item.category] || item.category,
  }));
};

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // State für Benachrichtigungen
  const [notification, setNotification] = useState({ message: '', type: '' }); // type: 'success' oder 'error'

  // Funktion zum Abrufen von Items
  const fetchItems = async (endpoint) => {
    console.log(`Abrufe Items von: ${endpoint}`);
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:3000/inventory/${endpoint}`);
      console.log('Antwort Status:', response.status);
      if (!response.ok) {
        throw new Error('Netzwerkantwort war nicht ok');
      }
      const data = await response.json();
      console.log('Abruf-Daten:', data);

      // Übersetzte Items setzen
      setItems(translateItemKeys(data.items));
    } catch (err) {
      console.error('Fehler beim Abrufen der Daten:', err);
      setError('Fehler beim Abrufen der Daten.');
    } finally {
      setLoading(false);
    }
  };

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
        <button onClick={() => fetchItems('equipment/items')} className="button">Ausrüstung</button>
        <button onClick={() => fetchItems('consumable/items')} className="button">Heilungen</button>
        <button onClick={() => fetchItems('misc/items')} className="button">Gegenstände</button>
      </div>
      <div className="button-group">
        <button onClick={() => fetchItems('items/sort/strength')} className="button">Nach Stärke sortieren</button>
        <button onClick={() => fetchItems('items/sort/worth')} className="button">Nach Wert sortieren</button>
        <button onClick={() => fetchItems('items/sort/name')} className="button">Alphabetisch sortieren</button>
        <button onClick={() => fetchItems('items/sort/quantity')} className="button">Nach Menge sortieren</button>
      </div>
      {loading && <p>Lädt...</p>}
      {error && <p className="error">{error}</p>}
      {items.length > 0 ? (
        <table className="inventory-table">
          <thead>
            <tr>
              <th>{translations.name}</th>
              <th>{translations.type}</th>
              <th>{translations.strength}</th>
              <th>{translations.category}</th>
              <th>{translations.worth}</th>
              <th>{translations.quantity}</th>
              <th>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.name}>
                <td className="table-cell">{item.name}</td>
                <td className="table-cell">{item.type}</td>
                <td className="table-cell">{item.strength}</td>
                <td className="table-cell">{item.category}</td>
                <td className="table-cell">{item.worth}</td>
                <td className="table-cell">{item.quantity}</td>
                <td className="table-cell">
                  {/* Löschen-Formular */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        !loading && <p>Keine Items gefunden.</p>
      )}
    </div>
  );
};

export default Inventory;
