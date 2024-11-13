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

  const sortItems = () => {
    const sortedItems = getFilteredItems().sort((a, b) => a.name.localeCompare(b.name));
    setItems([...items.filter(item => !getFilteredItems().includes(item)), ...sortedItems]);
  };

  const sortItemsByStrength = () => {
    const sortedItems = getFilteredItems().sort((a, b) => b.strength - a.strength);
    setItems([...items.filter(item => !getFilteredItems().includes(item)), ...sortedItems]);
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

  const cancelDelete = () => {
    setShowConfirmDialog(false);
  };

  return (
    <div className="Inventory">
      <h1>Inventarverwaltung</h1>
      <div className="tab-buttons">
        <button onClick={() => setActiveTab('equipment')} className={activeTab === 'equipment' ? 'active' : ''}>Ausrüstung & Waffen</button>
        <button onClick={() => setActiveTab('consumables')} className={activeTab === 'consumables' ? 'active' : ''}>Heilung</button>
        <button onClick={() => setActiveTab('misc')} className={activeTab === 'misc' ? 'active' : ''}>Items</button>
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
        <button onClick={sortItems}>Items sortieren (A-Z)</button>
        <button onClick={sortItemsByStrength}>Items nach Stärke sortieren</button>
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
    </div>
  );
};

export default Inventory;
