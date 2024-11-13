
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [allSelected, setAllSelected] = useState(false);
  const [activeTab, setActiveTab] = useState('equipment');
  const [apiResponse, setApiResponse] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Inventar-Items vom Backend abrufen
  const fetchItems = useCallback(() => {
    axios.get('http://localhost:5000/items')
      .then(response => {
        setItems(response.data.items);
      })
      .catch(error => {
        console.error('Fehler beim Abrufen der Items:', error);
      });
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Items sortieren A-Z
  const sortItems = () => {
    const sortedItems = getFilteredItems().sort((a, b) => a.name.localeCompare(b.name));
    setItems([...items.filter(item => !getFilteredItems().includes(item)), ...sortedItems]);
  };

  // Items nach Stärke sortieren
  const sortItemsByStrength = () => {
    const sortedItems = getFilteredItems().sort((a, b) => b.strength - a.strength);
    setItems([...items.filter(item => !getFilteredItems().includes(item)), ...sortedItems]);
  };

  // Alle Items auswählen oder abwählen
  const selectAllItems = () => {
    if (allSelected) {
      setSelectedItems([]);
      setAllSelected(false);
    } else {
      const filteredItems = getFilteredItems();
      const filteredItemIds = filteredItems.map(item => item.id);
      setSelectedItems(filteredItemIds);
      setAllSelected(true);
    }
  };

  // Item-Auswahl verwalten
  const handleSelectItem = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter((itemId) => itemId !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  // Benutzerdefinierter Bestätigungsdialog anzeigen
  const deleteSelectedItems = () => {
    setShowConfirmDialog(true);
  };

  // Items nach Kategorien filtern
  const getFilteredItems = () => {
    switch (activeTab) {
      case 'equipment':
        return items.filter(item => item.category === 'equipment');
      case 'consumables':
        return items.filter(item => item.category === 'consumable');
      case 'misc':
        return items.filter(item => item.category === 'misc');
      default:
        return items;
    }
  };

  // Löschvorgang bestätigen
  const confirmDelete = () => {
    axios.post('http://localhost:5000/items/delete', { items: selectedItems })
      .then(response => {
        setItems(response.data.items);
        setSelectedItems([]);
        setAllSelected(false);
        setApiResponse('Ausgewählte Items wurden erfolgreich gelöscht.');
      })
      .catch(error => {
        setApiResponse('Fehler beim Löschen der Items: ' + error.message);
        console.error('Fehler beim Löschen der Items:', error);
      })
      .finally(() => {
        setShowConfirmDialog(false);
      });
  };

  // Löschvorgang abbrechen
  const cancelDelete = () => {
    setShowConfirmDialog(false);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Inventarverwaltung</h1>
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => setActiveTab('equipment')} style={{ marginRight: '10px', padding: '10px', backgroundColor: activeTab === 'equipment' ? '#007bff' : '#ccc', color: 'white', border: 'none', cursor: 'pointer' }}>Ausrüstung & Waffen</button>
        <button onClick={() => setActiveTab('consumables')} style={{ marginRight: '10px', padding: '10px', backgroundColor: activeTab === 'consumables' ? '#007bff' : '#ccc', color: 'white', border: 'none', cursor: 'pointer' }}>Heilung</button>
        <button onClick={() => setActiveTab('misc')} style={{ padding: '10px', backgroundColor: activeTab === 'misc' ? '#007bff' : '#ccc', color: 'white', border: 'none', cursor: 'pointer' }}>Items</button>
      </div>
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {getFilteredItems().map((item) => (
          <li key={item.id} style={{ marginBottom: '10px', padding: '10px', backgroundColor: '#fff', border: '1px solid #ddd' }}>
            <input
              type="checkbox"
              checked={selectedItems.includes(item.id)}
              onChange={() => handleSelectItem(item.id)}
            />{' '}
            {item.name} {item.category === 'equipment' && `(Stärke: ${item.strength})`}
            {item.category === 'consumable' && `(Heilung: ${item.strength})`}
          </li>
        ))}
      </ul>
      <button onClick={deleteSelectedItems} style={{ marginRight: '10px', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}>
        Ausgewählte löschen
      </button>
      <button onClick={sortItems} style={{ marginRight: '10px', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}>
        Items sortieren (A-Z)
      </button>
      <button onClick={sortItemsByStrength} style={{ marginRight: '10px', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}>
        Items nach Stärke sortieren
      </button>
      <button onClick={selectAllItems} style={{ padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}>
        {allSelected ? 'Alle Items abwählen' : 'Alle Items auswählen'}
      </button>
      <div style={{ marginTop: '20px', color: 'red' }}>
        <h3>API-Antwort:</h3>
        <p>{apiResponse}</p>
      </div>

      {/* Benutzerdefinierter Bestätigungsdialog */}
      {showConfirmDialog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '5px',
            textAlign: 'center',
            boxShadow: '0px 0px 10px rgba(0,0,0,0.3)'
          }}>
            <h3>Möchten Sie die ausgewählten Items wirklich löschen?</h3>
            <button onClick={confirmDelete} style={{ marginRight: '10px', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}>Ja</button>
            <button onClick={cancelDelete} style={{ padding: '10px', backgroundColor: '#ccc', color: 'black', border: 'none', cursor: 'pointer' }}>Nein</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
