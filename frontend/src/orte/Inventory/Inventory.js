import React, { useState, useEffect } from 'react';
import './Inventory.css'; // Import der CSS-Datei

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Funktion zum Abrufen von Items
  const fetchItems = async (endpoint) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:3000/inventory/${endpoint}`);
      const data = await response.json();
      setItems(data.items);
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
      <h1>Inventar</h1>
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
