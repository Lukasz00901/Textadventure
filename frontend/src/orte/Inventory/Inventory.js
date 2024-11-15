// src/Inventory.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './Inventory.css';

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [allSelected, setAllSelected] = useState(false);
  const [activeTab, setActiveTab] = useState('equipment');
  const [apiResponse, setApiResponse] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState({ byName: false, byStrength: false });

  const fetchItems = useCallback(() => {
    setLoading(true);
    axios.get('http://localhost:3000/items')
      .then(response => {
        setItems(response.data.items);
      })
      .catch(error => {
        console.error('Fehler beim Abrufen der Items:', error);
        setApiResponse('Fehler beim Laden der Items.');
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const sortItems = () => {
    axios.post('http://localhost:3000/items/sort')
      .then(response => {
        setItems(response.data.items);
        setSortOrder({ byName: true, byStrength: false });
        setApiResponse('Items wurden alphabetisch sortiert.');
      })
      .catch(error => {
        console.error('Fehler beim Sortieren der Items:', error);
        setApiResponse('Fehler beim Sortieren der Items.');
      });
  };

  const sortItemsByStrength = () => {
    axios.post('http://localhost:3000/items/sort-by-strength')
      .then(response => {
        setItems(response.data.items);
        setSortOrder({ byName: false, byStrength: true });
        setApiResponse('Items wurden nach Stärke sortiert.');
      })
      .catch(error => {
        console.error('Fehler beim Sortieren nach Stärke:', error);
        setApiResponse('Fehler beim Sortieren nach Stärke.');
      });
  };

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

  const handleSelectItem = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(itemId => itemId !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const deleteSelectedItems = () => {
    setShowConfirmDialog(true);
  };

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

  const confirmDelete = () => {
    axios.post('http://localhost:3000/items/delete', { items: selectedItems })
      .then(response => {
        setItems(response.data.items);
        setSelectedItems([]);
        setAllSelected(false);
        setApiResponse('Ausgewählte Items wurden erfolgreich gelöscht.');
      })
      .catch(error => {
        console.error('Fehler beim Löschen der Items:', error);
        setApiResponse('Fehler beim Löschen der Items.');
      })
      .finally(() => {
        setShowConfirmDialog(false);
      });
  };

  const cancelDelete = () => {
    setShowConfirmDialog(false);
  };

  return (
    <div className="Inventory">
      <h1>Inventarverwaltung</h1>
      {loading && <p>Items werden geladen...</p>}
      <div className="tab-buttons">
        <button onClick={() => setActiveTab('equipment')} className={activeTab === 'equipment' ? 'active' : ''}>
          Ausrüstung & Waffen
        </button>
        <button onClick={() => setActiveTab('consumables')} className={activeTab === 'consumables' ? 'active' : ''}>
          Tränke & Nahrung 
        </button>
        <button onClick={() => setActiveTab('misc')} className={activeTab === 'misc' ? 'active' : ''}>
          Items
        </button>
      </div>
      <ul>
        {getFilteredItems().map(item => (
          <li key={item.id}>
            <input type="checkbox" checked={selectedItems.includes(item.id)} onChange={() => handleSelectItem(item.id)} />
            {item.name} {item.category === 'equipment' && `(Stärke: ${item.strength})`}
            {item.category === 'consumable' && `(Heilung: ${item.strength})`}
          </li>
        ))}
      </ul>
      <div className="action-buttons">
        <button onClick={deleteSelectedItems}>Ausgewählte löschen</button>
        <button onClick={sortItems} className={sortOrder.byName ? 'active' : ''}>
          Items sortieren (A-Z)
        </button>
        <button onClick={sortItemsByStrength} className={sortOrder.byStrength ? 'active' : ''}>
          Items nach Stärke sortieren
        </button>
        <button onClick={selectAllItems}>{allSelected ? 'Alle Items abwählen' : 'Alle Items auswählen'}</button>
      </div>
      {showConfirmDialog && (
        <div className="confirm-dialog">
          <div className="confirm-dialog-content">
            <h3>Möchten Sie die ausgewählten Items wirklich löschen?</h3>
            <button onClick={confirmDelete}>Ja</button>
            <button onClick={cancelDelete}>Nein</button>
          </div>
        </div>
      )}
      {apiResponse && <p className="api-response">{apiResponse}</p>}
    </div>
  );
};

export default Inventory;
