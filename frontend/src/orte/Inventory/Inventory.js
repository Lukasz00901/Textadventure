// frontend/Inventory.js
import React, { useState, useEffect } from 'react';
import './Inventory.css'; // Import der CSS-Datei

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // State für das Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteQuantity, setDeleteQuantity] = useState(1);
  
  // State für Benachrichtigungen
  const [notification, setNotification] = useState({ message: '', type: '' }); // type: 'success' oder 'error'

  // Liste von zufälligen Erfolgsmeldungen
  const successMessages = [
"Weg damit! Dieser Gegenstand wollte sowieso nicht bleiben.", "Tschüssi, Item! Möge es in den virtuellen Himmel fliegen.", "Das Item wurde in die ewigen Datenjagdgründe geschickt.", "Und zack, weg ist es! Du wirst es wahrscheinlich eh nicht vermissen.", "Auf Wiedersehen, alter Freund! Oder eher... nie wiedersehen.", "Ein Klick für dich, ein Neuanfang für das Item im Daten-Nirwana.", "Wo das Item hingeht? Auf einen unendlichen Urlaub in die binäre Karibik.", "Das Item hat gerade gekündigt. Es will seine Träume verfolgen.", "Bye-bye! Das Item ist jetzt frei, um auf Weltreise zu gehen.", "Item gelöscht! Jetzt hat dein Inventar etwas mehr Luft zum Atmen.", "Und weg damit! Wer braucht schon ein [Item-Name]?!", "Löschtaste gedrückt, Problem gelöst. Tschüss, Item.", "Das Item wollte eh schon immer ein NFT werden. Lass es frei.", "Ups, Item gelöscht! Möge es in Frieden ruhen... oder einfach verschwinden.", "Bye-bye, Gegenstand! Genieße deinen Aufenthalt im virtuellen Nirvana.", "Du hast das Item gelöscht... aber das Item löscht auch dich! (Nur Spaß.)", "Dieses Item ist jetzt digitaler Fischfutter. Blub, blub.", "Weg damit! Wer braucht schon ein Inventar voller unnötiger Sachen.", "Item weggezaubert! Abrakadabra, hokus pokus, nicht mehr da.", "Das Item hat die Entscheidung getroffen, ein besseres Leben zu führen... als Nichts.", "Das Item wurde gerade in die digitale Müllhalde geworfen. Es ist jetzt glücklich dort.", "Zack, weg damit! Dieses Item wollte eh Karriere als Datenmüll machen.", "Du hast gerade ein Item gelöscht. Es weint jetzt in der Ecke... irgendwo im Speicher.", "Achtung, Achtung! Das Item ist jetzt offiziell arbeitslos. Herzlichen Glückwunsch.", "Item entfernt! Es lebt jetzt als Geist im Internet weiter.", "Tschüss, Item! Es hat gesagt, es geht einkaufen und kommt nie wieder zurück.", "Das Item hat sich freiwillig gemeldet, um gelöscht zu werden. Es war bereit.", "Du hast das Item gelöscht. Es schließt sich jetzt den anderen verlorenen Daten an.", "Item entfernt! Es ist jetzt ein Mitglied im Club der verlorenen Dateien."
  ];

  // Funktion zum Abrufen von Items
  const fetchItems = async (endpoint) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:3000/inventory/${endpoint}`);
      if (!response.ok) {
        throw new Error('Netzwerkantwort war nicht ok');
      }
      const data = await response.json();
      setItems(translateItemKeys(data.items));
    } catch (err) {
      console.error('Fehler beim Abrufen der Daten:', err);
      setError('Fehler beim Abrufen der Daten.');
    } finally {
      setLoading(false);
    }
  };

  // Funktion zum Öffnen des Modals
  const openDeleteModal = (item) => {
    setItemToDelete(item);
    setDeleteQuantity(1); // Standardmäßig 1
    setIsModalOpen(true);
    setNotification({ message: '', type: '' }); // Reset der Benachrichtigung
  };

  // Funktion zum Schließen des Modals
  const closeDeleteModal = () => {
    setIsModalOpen(false);
    setItemToDelete(null);
    setDeleteQuantity(1);
  };

  // Funktion zum Löschen eines Items
  const deleteItem = async () => {
    if (!itemToDelete) return;

    try {
      const response = await fetch(`http://localhost:3000/inventory/item/${encodeURIComponent(itemToDelete.name)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity: deleteQuantity }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.remainingQuantity === 0) {
          // Entferne das gesamte Item aus dem State
          setItems(items.filter(item => item.name !== itemToDelete.name));
        } else {
          // Aktualisiere die Menge des Items im State
          setItems(items.map(item => 
            item.name === itemToDelete.name 
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
    } finally {
      closeDeleteModal();
    }
  };

  

  // Automatisches Ausblenden der Benachrichtigung nach 4 Sekunden
  useEffect(() => {
    if (notification.message) {
      const timer = setTimeout(() => {
        setNotification({ message: '', type: '' });
      }, 4000); // 4 Sekunden

      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Initialer Abruf aller Items
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
              <th className="table-header">Name</th>
              <th className="table-header">Typ</th>
              <th className="table-header">Stärke</th>
              <th className="table-header">Kategorie</th>
              <th className="table-header">Wert</th>
              <th className="table-header">Menge</th>
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
                  <button onClick={() => openDeleteModal(item)} className="delete-button">Löschen</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        !loading && <p>Keine Items gefunden.</p>
      )}

      {/* Benutzerdefiniertes Modal */}
      {isModalOpen && itemToDelete && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Item löschen</h2>
            <p>Wie viele von "{itemToDelete.name}" möchtest du löschen?</p>
            <input 
              type="number" 
              min="1" 
              max={itemToDelete.quantity} 
              value={deleteQuantity} 
              onChange={(e) => {
                const value = parseInt(e.target.value, 10);
                if (value >= 1 && value <= itemToDelete.quantity) {
                  setDeleteQuantity(value);
                } else if (value < 1) {
                  setDeleteQuantity(1);
                } else {
                  setDeleteQuantity(itemToDelete.quantity);
                }
              }} 
              className="quantity-input"
            />
            <div className="modal-buttons">
              <button onClick={deleteItem} className="confirm-button">Bestätigen</button>
              <button onClick={closeDeleteModal} className="cancel-button">Abbrechen</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
