import React from 'react';
import CardContainer from './CardContainer.jsx';

export default function GachaResultModal({
  results,
  onKeep,
  onQuickSell,
  onClose,
  onSelectCard
}) {
  if (!results || results.length === 0) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const topRarity = results[0]?.rarityClass || 'gold';

  return (
    <div className="modal-overlay active" onClick={handleBackdropClick}>
      <div className="gacha-reveal-stage">
        <div className="gacha-reveal-title">
          <h3>Pack Opened!</h3>
          <span className={`reveal-tier-tag ${topRarity}-tag`}>
            {results.length} Card{results.length > 1 ? 's' : ''} Revealed
          </span>
        </div>

        {/* Revealed Cards Grid */}
        <div className="gacha-results-grid">
          {results.map((card, idx) => (
            <div className="gacha-result-card" key={idx}>
              <CardContainer
                card={card}
                className="modal-card-animate"
                onClick={() => onSelectCard && onSelectCard(card)}
              />
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="gacha-modal-actions">
          <button className="btn-primary" onClick={onKeep}>
            KEEP CARD(S)
          </button>
          <button className="btn-secondary" onClick={onQuickSell}>
            QUICK SELL
          </button>
        </div>
      </div>
    </div>
  );
}
