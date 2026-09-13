import React, { useState, useMemo } from 'react';
import CardContainer from './CardContainer.jsx';
import TagFilterBar from './TagFilterBar.jsx';
import useEscapeKey from '../hooks/useEscapeKey.js';
import { createBackdropClickHandler } from '../utils/modal.js';
import { createDefaultCardFilterState, filterCards } from '../utils/cardFilters.js';
import { getAttributeColorClass, RARITY_CLASSES } from '../utils/cards.js';

const BATCH_SIZE = 12;

export default function ShowcaseModal({ isOpen = true, onClose, cards, onSelectCard, isInline = false }) {
  const [sortBy, setSortBy] = useState('ovr-desc');
  const [filterState, setFilterState] = useState(createDefaultCardFilterState());
  const [displayLimit, setDisplayLimit] = useState(BATCH_SIZE);

  // Hanya jalankan escape key jika berfungsi sebagai modal pop-up biasa
  useEscapeKey(onClose, isOpen && !isInline);

  // Filtered cards list (Rarity + Category/Team/Village/Clan + Search)
  const filteredCards = useMemo(() => {
    if (!cards) return [];

    const result = filterCards(cards, filterState);

    if (sortBy === 'ovr-desc') {
      result.sort((a, b) => (b.ovr ?? 0) - (a.ovr ?? 0));
    } else if (sortBy === 'ovr-asc') {
      result.sort((a, b) => (a.ovr ?? 0) - (b.ovr ?? 0));
    } else if (sortBy === 'rarity') {
      result.sort((a, b) => {
        const ra = RARITY_CLASSES.indexOf(a.rarityClass || 'bronze');
        const rb = RARITY_CLASSES.indexOf(b.rarityClass || 'bronze');
        return ra - rb;
      });
    }

    return result;
  }, [cards, filterState, sortBy]);

  // Paginated batch slice
  const visibleCards = useMemo(() => {
    return filteredCards.slice(0, displayLimit);
  }, [filteredCards, displayLimit]);

  if (!isOpen && !isInline) return null;

  const handleFilterChange = (nextFilterState) => {
    setFilterState(nextFilterState);
    setDisplayLimit(BATCH_SIZE);
  };

  const handleSearchChange = (e) => {
    setFilterState(prev => ({ ...prev, searchTerm: e.target.value }));
    setDisplayLimit(BATCH_SIZE);
  };

  const handleLoadMore = () => {
    setDisplayLimit(prev => prev + BATCH_SIZE);
  };

  const remaining = filteredCards.length - visibleCards.length;

  const content = (
    <div className={isInline ? "showcase-inline-content" : "showcase-modal-content"}>
      {!isInline && (
        <button className="showcase-modal-close" onClick={onClose} title="Close Showcase (ESC)">
          ✕
        </button>
      )}

      <div className="section-header">
        <span className="section-subtitle">Shinobi Rarity Showcase</span>
        <h2 className="section-title">Shinobi Rarity Database</h2>

        {/* Search Input Bar */}
        <div style={{ margin: '15px 0', display: 'flex', justifyContent: 'center' }}>
          <input
            type="text"
            placeholder="🔍 Search Shinobi by name or Jutsu..."
            value={filterState.searchTerm}
            onChange={handleSearchChange}
            style={{
              width: '100%',
              maxWidth: '400px',
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(212, 175, 55, 0.4)',
              borderRadius: '8px',
              padding: '10px 16px',
              color: '#fff',
              fontSize: '14px',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Advanced Filter Bar (rarity + category + team + village + clan) */}
        <TagFilterBar
          cards={cards}
          filterState={filterState}
          onChange={handleFilterChange}
        />

         {/* Sort Buttons */}
         <div style={{ display: 'flex', justifyContent: 'center', marginTop: '12px', gap: '8px' }}>
           <button
             onClick={() => {
               setSortBy(prev => prev === 'ovr-desc' ? 'ovr-asc' : 'ovr-desc');
               setDisplayLimit(BATCH_SIZE);
             }}
             style={{
               background: 'linear-gradient(45deg, #f39c12, #d4af37)',
               color: '#000',
               border: 'none',
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
             Power {sortBy === 'ovr-desc' ? '↓' : sortBy === 'ovr-asc' ? '↑' : ''}
           </button>
           <button
             onClick={() => {
               setSortBy(prev => prev === 'rarity' ? 'ovr-desc' : 'rarity');
               setDisplayLimit(BATCH_SIZE);
             }}
             style={{
               background: sortBy === 'rarity' ? 'linear-gradient(45deg, #ec4899, #a855f7)' : 'rgba(255,255,255,0.08)',
               color: sortBy === 'rarity' ? '#fff' : '#aaa',
               border: sortBy === 'rarity' ? 'none' : '1px solid rgba(255,255,255,0.15)',
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
             Rarity {sortBy === 'rarity' && '★'}
           </button>
         </div>
      </div>

      {/* Dynamic Showcase Grid */}
      <div className="showcase-grid-container">
        {visibleCards.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#aaa', padding: '40px' }}>
            No Shinobi found matching your filters.
          </div>
        ) : (
          visibleCards.map(card => (
            <div className="showcase-card-wrapper" key={card.id}>
              <CardContainer
                card={card}
                onClick={() => onSelectCard(card)}
                isThumbnail={true}
              />
              <div className="card-meta-info">
                <h4>{card.name}</h4>
                <p>{card.ovr} OVR · {card.stars}-Star {card.rarity}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Load More Button */}
      {remaining > 0 && (
        <div className="load-more-wrapper">
          <button className="btn-load-more" onClick={handleLoadMore}>
            Load More Cards ({remaining} Remaining)
          </button>
        </div>
      )}
    </div>
  );

  if (isInline) {
    return content;
  }

  return (
    <div className="showcase-modal-overlay" onClick={createBackdropClickHandler(onClose)}>
      {content}
    </div>
  );
}
