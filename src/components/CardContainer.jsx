import React from 'react';
import {
  FALLBACK_CARD_IMAGE,
  createImageFallbackHandler,
  getRarityClass,
  getStarString
} from '../utils/cards.js';

const handleImageError = createImageFallbackHandler(FALLBACK_CARD_IMAGE);

export default function CardContainer({ card, onClick, className = '' }) {
  if (!card) return null;

  const starStr = getStarString(card.stars, ' ');
  const plusLevel = Math.max(0, Number(card.plusLevel || 0));

  return (
    <div
      className={`card-container ${getRarityClass(card)}-tier ${className}`}
      onClick={onClick}
    >
      <div className="card-inner">
        {/* Card Header */}
        <div className="card-header">
          <span className="card-title">{card.name}</span>
          <div className="card-header-actions">
            {plusLevel > 0 && <span className={`plus-badge ${plusLevel >= 10 ? 'plus-badge-max' : ''}`}>+{plusLevel}</span>}
            <div className="ovr-badge">{card.ovr} OVR</div>
          </div>
        </div>

        {/* Card Image Window */}
        <div className="card-image-window">
          <img
            src={card.img || FALLBACK_CARD_IMAGE}
            alt={card.name}
            loading="lazy"
            onError={handleImageError}
          />
        </div>

        {/* Card Details Panel */}
        <div className="card-details-panel">
          <div className="jutsu-name">{card.jutsu || 'Secret Ninja Art'}</div>
          <div className="summon-type">Summon: {card.summon || 'None'}</div>

          <div className="stat-bars">
            {[
              { label: 'ATK', value: card.atk },
              { label: 'DEF', value: card.def },
              { label: 'CHK', value: card.chk }
            ].map(({ label, value }) => (
              <div className="stat-row" key={label}>
                <span className="stat-label">{label}</span>
                <div className="stat-track">
                  <div className="stat-fill" style={{ width: `${value || 50}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card Footer */}
        <div className="card-footer">
          <div className="stars-rating">{starStr}</div>
          <span className="rarity-tag">{card.rarity}</span>
        </div>
      </div>
    </div>
  );
}
