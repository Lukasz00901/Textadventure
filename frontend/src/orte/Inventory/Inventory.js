import React, { useState, useEffect } from 'react';
import './Inventory.css'; // Import der CSS-Datei

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  // Funktion zum Abrufen von Items
  const fetchItems = async (endpoint) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:3000/inventory/${endpoint}`);
      const data = await response.json();
      setItems(translateItemKeys(data.items));
    } catch (err) {
      console.error('Fehler beim Abrufen der Daten:', err);
      setError('Fehler beim Abrufen der Daten.');
    } finally {
      setLoading(false);
    }
  };

  // Initialer Abruf aller Items
  useEffect(() => {
    fetchItems('all/items');
  }, []);

  return (
    <div className="inventory-container">
      <h1>Inventar 📜</h1>
      <div className="button-group">
        <button onClick={() => fetchItems('all/items')} className="button">Alle Items</button>
        <button onClick={() => fetchItems('equipment/items')} className="button">Ausrüstungen</button>
        <button onClick={() => fetchItems('consumable/items')} className="button">Tränke & Lebensmittel</button>
        <button onClick={() => fetchItems('misc/items')} className="button">Materialien</button>
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
              {['name', 'type', 'strength', 'category', 'worth', 'quantity'].map((key) => (
                <th key={key} className="table-header">{translations[key]}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index}>
                <td className="table-cell">{item.name}</td>
                <td className="table-cell">{item.type}</td>
                <td className="table-cell">{item.strength}</td>
                <td className="table-cell">{item.category}</td>
                <td className="table-cell">{item.worth}</td>
                <td className="table-cell">{item.quantity}</td>
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
