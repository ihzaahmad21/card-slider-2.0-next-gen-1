import React, { useState, useMemo, useEffect } from 'react';
import CardContainer from './CardContainer.jsx';

const BATCH_SIZE = 12;

export default function ShowcaseModal({ isOpen, onClose, cards, onSelectCard }) {
  const [filter, setFilter] = useState('all');
  const [displayLimit, setDisplayLimit] = useState(BATCH_SIZE);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Filtered cards list
  const filteredCards = useMemo(() => {
    if (!cards) return [];
    if (filter === 'all') return cards;
    return cards.filter(c => c.rarityClass === filter);
  }, [cards, filter]);

  // Paginated batch slice
  const visibleCards = useMemo(() => {
    return filteredCards.slice(0, displayLimit);
  }, [filteredCards, displayLimit]);

  if (!isOpen) return null;

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setDisplayLimit(BATCH_SIZE);
  };

  const handleLoadMore = () => {
    setDisplayLimit(prev => prev + BATCH_SIZE);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const remaining = filteredCards.length - visibleCards.length;

  return (
    <div className="showcase-modal-overlay" onClick={handleBackdropClick}>
      <div className="showcase-modal-content">
        <button className="showcase-modal-close" onClick={onClose} title="Close Showcase (ESC)">
          ✕
        </button>

        <div className="section-header">
          <span className="section-subtitle">Shinobi Rarity Showcase</span>
          <h2 className="section-title">Shinobi Rarity Database</h2>

          {/* Filter Pill Buttons */}
          <div className="filter-container">
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              data-filter="all"
              onClick={() => handleFilterChange('all')}
            >
              ALL ({cards.length})
            </button>
            <button
              className={`filter-btn ${filter === 'gold' ? 'active' : ''}`}
              data-filter="gold"
              onClick={() => handleFilterChange('gold')}
            >
              GOLD (4-5★)
            </button>
            <button
              className={`filter-btn ${filter === 'silver' ? 'active' : ''}`}
              data-filter="silver"
              onClick={() => handleFilterChange('silver')}
            >
              SILVER (3-4★)
            </button>
            <button
              className={`filter-btn ${filter === 'bronze' ? 'active' : ''}`}
              data-filter="bronze"
              onClick={() => handleFilterChange('bronze')}
            >
              BRONZE (1-3★)
            </button>
          </div>
        </div>

        {/* Dynamic Showcase Grid */}
        <div className="showcase-grid-container">
          {visibleCards.map(card => (
            <div className="showcase-card-wrapper" key={card.id}>
              <CardContainer
                card={card}
                onClick={() => onSelectCard(card)}
              />
              <div className="card-meta-info">
                <h4>{card.name}</h4>
                <p>{card.ovr} OVR · {card.stars}-Star {card.rarity}</p>
              </div>
            </div>
          ))}
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
    </div>
  );
}
