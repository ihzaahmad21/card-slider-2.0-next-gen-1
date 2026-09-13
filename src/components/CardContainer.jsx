import React from 'react';
import {
  FALLBACK_CARD_IMAGE,
  createImageFallbackHandler,
  getRarityClass,
  getStarString,
  getCardImageSrc,
  getAttributeColorClass,
} from '../utils/cards.js';

const handleImageError = createImageFallbackHandler(FALLBACK_CARD_IMAGE);

export default function CardContainer({ card, onClick, className = '', isThumbnail = false }) {
  if (!card) return null;

  const starStr = getStarString(card.stars, ' ');
  const plusLevel = Math.max(0, Number(card.plusLevel || 0));
  // Misal setiap +1 level upgrade menambah +2 poin ke semua atribut
  const plusBonus = (card.plusLevel || 0) * 2;

  const currentAtk = (card.atk || 50) + plusBonus;
  const currentDef = (card.def || 50) + plusBonus;
  const currentSpd = (card.spd || 50) + plusBonus;
  const currentChk = (card.chk || 50) + plusBonus;

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
            src={getCardImageSrc(card)}
            alt={card.name}
            loading="lazy"
            onError={handleImageError}
            className={`card-thumb-img ${isThumbnail ? 'is-thumb-mode' : ''}`}
          />
        </div>

        {/* Card Details Panel */}
        <div className="card-details-panel">
          <div className="jutsu-name">{card.jutsu || 'Secret Ninja Art'}</div>
          <div className="summon-type">Summon: {card.summon || 'None'}</div>

          <div className="stat-grid">
            {[
              { label: 'ATK', value: card.atk },
              { label: 'DEF', value: card.def },
              { label: 'SPD', value: card.spd },
              { label: 'CHK', value: card.chk }
            ].map(({ label, value }) => (
              <div className="stat-grid-item" key={label}>
                <span className="stat-label">{label}</span>
                <span className={`stat-value ${getAttributeColorClass(value)}`}>{value || 50}</span>
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
