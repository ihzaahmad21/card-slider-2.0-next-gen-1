import React, { useState } from 'react';
import FlipCard from './FlipCard.jsx';

export default function CardPreviewPlayground({ isOpen, onClose, cards, inventory = [] }) {
  const [selectedCardId, setSelectedCardId] = useState(
    cards && cards.length > 0 ? cards[0].id : ''
  );

  if (!isOpen) return null;

  const currentCard = cards
    ? cards.find(c => c.id === Number(selectedCardId))
    : null;

  const handleCardChange = (e) => {
    setSelectedCardId(e.target.value);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const isUnlocked = currentCard && inventory
    ? inventory.some(item => item.id === currentCard.id)
    : false;

  return (
    <div className="playground-overlay" onClick={handleBackdropClick}>
      <div className="playground-container">

        {/* Header */}
        <div className="playground-header">
          <h3 className="playground-title">⚡ 3D CARD PLAYGROUND</h3>
          <button className="playground-close" onClick={onClose} title="Close Playground">
            ✕
          </button>
        </div>

        {/* Controls */}
        <div className="playground-controls-panel">
          <label htmlFor="card-select" className="controls-label">
            Select Shinobi to Preview:
          </label>
          <select
            id="card-select"
            className="playground-select"
            value={selectedCardId}
            onChange={handleCardChange}
          >
            {cards &&
              cards.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.rarity} - {c.ovr} OVR)
                </option>
              ))}
          </select>
        </div>

        {/* 3D Card Display Area */}
        {currentCard ? (
          <FlipCard
            card={currentCard}
            isUnlocked={isUnlocked}
          />
        ) : (
          <div className="inventory-empty-state">No card selected</div>
        )}

        <div className="playground-hint">
          💡 Click the card to flip it and view Stats!
        </div>
      </div>
    </div>
  );
}
