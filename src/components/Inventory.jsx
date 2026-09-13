import React, { useState, useMemo } from 'react';
import CardContainer from './CardContainer.jsx';
import TagFilterBar from './TagFilterBar.jsx';
import { getCardKey, getAttributeColorClass, RARITY_CLASSES } from '../utils/cards.js';
import { createDefaultCardFilterState, filterCards } from '../utils/cardFilters.js';

const SORT_OPTIONS = [
  { value: 'plusLevel', label: 'Level' },
  { value: 'ovr', label: 'OVR' },
  { value: 'rarity', label: 'Rarity' },
  { value: 'name', label: 'Name' }
];

export default function Inventory({ inventory = [], totalMasterCount = 190, onSelectCard }) {
  const [filterState, setFilterState] = useState(createDefaultCardFilterState());
  const [sortBy, setSortBy] = useState('ovr');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showDuplicates, setShowDuplicates] = useState(false);

  const ownedCount = inventory ? inventory.length : 0;

  // Search & Sorting Logic
  const filteredAndSortedInventory = useMemo(() => {
    if (!inventory) return [];

    let filtered = inventory;

    if (showDuplicates) {
      const idCounts = {};
      inventory.forEach(card => {
        idCounts[card.id] = (idCounts[card.id] || 0) + 1;
      });
      filtered = inventory.filter(card => idCounts[card.id] > 1);
    }

    filtered = filterCards(filtered, { ...filterState, rarity: filterState.rarity });
    // rarity di filterState pakai rarityClass ('gold'/'silver'/'bronze') — cocok dengan field di inventory item

    return filtered.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (sortBy === 'plusLevel') {
        valA = a.plusLevel || 0;
        valB = b.plusLevel || 0;
      }

       if (sortBy === 'name') {
         return sortOrder === 'asc'
           ? (valA || '').localeCompare(valB || '')
           : (valB || '').localeCompare(valA || '');
       } else if (sortBy === 'rarity') {
         const ra = RARITY_CLASSES.indexOf(a.rarityClass || 'bronze');
         const rb = RARITY_CLASSES.indexOf(b.rarityClass || 'bronze');
         return sortOrder === 'asc'
           ? ra - rb
           : rb - ra;
       } else {
         return sortOrder === 'asc'
           ? (valA || 0) - (valB || 0)
           : (valB || 0) - (valA || 0);
       }
    });
  }, [inventory, filterState, sortBy, sortOrder, showDuplicates]);

  const toggleSort = (criteria) => {
    if (sortBy === criteria) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(criteria);
      setSortOrder(criteria === 'name' ? 'asc' : 'desc');
    }
  };

  return (
    <section className="section-padding inventory-section" id="inventory" style={{ padding: '20px' }}>
      <div className="container" style={{ maxWidth: '1000px', margin: '0 auto' }}>

        {/* Header */}
        <div className="section-header" style={{ textAlign: 'center', marginBottom: '20px' }}>
          <span className="section-subtitle" style={{ color: '#d4af37', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '12px' }}>
            Collection Vault
          </span>
          <h2 className="section-title" style={{ color: '#fff', fontFamily: 'serif', fontSize: '2rem', margin: '10px 0' }}>
            Your Shinobi Inventory
          </h2>
          <div className="inventory-stats-bar" style={{ color: '#00ffff', fontWeight: 'bold', fontSize: '14px' }}>
            <span>
              Collection: {ownedCount} / {totalMasterCount} Shinobi Unlocked
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ margin: '0 0 15px', display: 'flex', justifyContent: 'center' }}>
          <input
            type="text"
            placeholder="🔍 Search Shinobi by name..."
            value={filterState.searchTerm}
            onChange={(e) => setFilterState(prev => ({ ...prev, searchTerm: e.target.value }))}
            style={{
              width: '100%',
              maxWidth: '400px',
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(212, 175, 55, 0.4)',
              borderRadius: '8px',
              padding: '10px 14px',
              color: '#fff',
              fontSize: '14px',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Advanced Filter Bar (rarity + category + team + village + clan) */}
        <TagFilterBar
          cards={inventory}
          filterState={filterState}
          onChange={setFilterState}
        />

        {/* Duplicate toggle + Sort controls */}
        <div
          className="inventory-controls-container"
          style={{
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            borderRadius: '12px',
            padding: '16px',
            margin: '16px 0 25px',
            display: 'flex',
            gap: '15px',
            flexWrap: 'wrap',
            alignItems: 'center'
          }}
        >
          <button
            onClick={() => setShowDuplicates(!showDuplicates)}
            style={{
              background: showDuplicates ? 'linear-gradient(45deg, #10b981, #059669)' : 'rgba(255, 255, 255, 0.05)',
              color: showDuplicates ? '#fff' : '#aaa',
              border: showDuplicates ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
              padding: '8px 14px',
              borderRadius: '6px',
              fontWeight: 'bold',
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginRight: '10px'
            }}
            title="Show only cards you have more than one of"
          >
            {showDuplicates ? '✓ Duplicates' : 'Show Duplicates'}
          </button>
          <span style={{ color: '#aaa', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>
            Sort by:
          </span>
          <div style={{ display: 'flex', gap: '6px' }}>
            {SORT_OPTIONS.map(({ value, label }) => {
              const isActive = sortBy === value;
              return (
                <button
                  key={value}
                  onClick={() => toggleSort(value)}
                  style={{
                    background: isActive ? 'linear-gradient(45deg, #f39c12, #d4af37)' : 'rgba(255, 255, 255, 0.05)',
                    color: isActive ? '#000' : '#fff',
                    border: isActive ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                    padding: '8px 14px',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    fontSize: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {label} {isActive && (sortOrder === 'asc' ? '↑' : '↓')}
                </button>
              );
            })}
          </div>
        </div>

        {/* Inventory Grid / Cards */}
        <div className="inventory-grid">
          {ownedCount === 0 ? (
            <div className="inventory-empty-state" style={{ textAlign: 'center', color: '#aaa', padding: '40px' }}>
              Your inventory is empty! Roll some Gacha Packs in the shop to collect Shinobi cards.
            </div>
          ) : filteredAndSortedInventory.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#aaa', padding: '40px' }}>
              No Shinobi found matching your filters.
            </div>
          ) : (
            filteredAndSortedInventory.map(item => (
              <div
                className={[
                  'inventory-card-wrapper',
                  Array.isArray(item.tags) && item.tags.includes('awakening') ? 'awakening-inventory-card' : ''
                ].filter(Boolean).join(' ')}
                key={getCardKey(item)}
                onClick={() => onSelectCard && onSelectCard(item)}
              >
                {Array.isArray(item.tags) && item.tags.includes('awakening') && (
                  <div className="awakening-badge-inv" title="Awakening Card" aria-label="Awakening">
                    ⚡
                  </div>
                )}
                <CardContainer card={item} className="inventory-card" isThumbnail={true} />
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
