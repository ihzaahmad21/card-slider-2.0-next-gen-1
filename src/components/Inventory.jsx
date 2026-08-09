import React, { useState, useMemo } from 'react';
import CardContainer from './CardContainer.jsx';
import { getCardKey } from '../utils/cards.js';

const SORT_OPTIONS = [
  { value: 'plusLevel', label: 'Level' },
  { value: 'ovr', label: 'OVR' },
  { value: 'name', label: 'Name' }
];

export default function Inventory({ inventory, totalMasterCount, onSelectCard }) {
  const [sortBy, setSortBy] = useState('plusLevel'); // 'plusLevel', 'ovr', 'name'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc', 'desc'

  const ownedCount = inventory ? inventory.length : 0;

  // Sorting logic
  const sortedInventory = useMemo(() => {
    if (!inventory) return [];
    return [...inventory].sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      // Handle undefined/null cases
      if (sortBy === 'plusLevel') {
        valA = a.plusLevel || 0;
        valB = b.plusLevel || 0;
      }

      if (sortBy === 'name') {
        return sortOrder === 'asc' 
          ? valA.localeCompare(valB) 
          : valB.localeCompare(valA);
      } else {
        return sortOrder === 'asc' 
          ? valA - valB 
          : valB - valA;
      }
    });
  }, [inventory, sortBy, sortOrder]);

  const toggleSort = (criteria) => {
    if (sortBy === criteria) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(criteria);
      setSortOrder('desc'); // Default to desc for numeric, asc for name? Usually desc for OVR/Level is better
      if (criteria === 'name') setSortOrder('asc');
    }
  };

  return (
    <section className="section-padding inventory-section" id="inventory">
      <div className="container">
        <div className="section-header">
          <span className="section-subtitle">Collection Vault</span>
          <h2 className="section-title">Your Shinobi Inventory</h2>
          <div className="inventory-stats-bar">
            <span>
              Collection: {ownedCount} / {totalMasterCount} Shinobi Unlocked
            </span>
          </div>

          {/* Sorting Controls */}
          <div className="inventory-controls">
            <span className="controls-label">Sort by:</span>
            <div className="sort-buttons">
              {SORT_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  className={`sort-btn ${sortBy === value ? 'active' : ''}`}
                  onClick={() => toggleSort(value)}
                >
                  {label} {sortBy === value && (sortOrder === 'asc' ? '↑' : '↓')}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="inventory-grid">
          {ownedCount === 0 ? (
            <div className="inventory-empty-state">
              Your inventory is empty! Roll some Gacha Packs in the shop to collect Shinobi cards.
            </div>
          ) : (
            sortedInventory.map(item => (
              <div
                className="inventory-card-wrapper"
                key={getCardKey(item)}
                onClick={() => onSelectCard(item)}
              >
                <CardContainer card={item} className="inventory-card" />
                <div className="inventory-card-meta">
                  <div className="meta-name-row">
                    <h4>{item.name}</h4>
                    {item.plusLevel > 0 && <span className="meta-plus">+{item.plusLevel}</span>}
                  </div>
                  <p>{item.ovr} OVR · {item.stars}-Star {item.rarity}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
