import React, { useState } from 'react';
import {
  FALLBACK_CARD_IMAGE,
  createImageFallbackHandler,
  getStarString,
  getCardImageSrc,
  getRarityClass,
  getAttributeColorClass,
  RARITY_LABELS
} from '../utils/cards.js';
import { ELEMENT_META, getCharacterMeta } from '../utils/characterMeta.js';

const handleImageError = createImageFallbackHandler(FALLBACK_CARD_IMAGE);

export default function FlipCard({ card, isUnlocked = false, className = '', onClick, disableClickFlip = false }) {
  const [flipped, setFlipped] = useState(false);

  if (!card) return null;

  const starStr = getStarString(card.stars, ' ');
  const plusLevel = Math.max(0, Number(card.plusLevel || 0));
  const summonName = (Array.isArray(card.summons) && card.summons.length > 0)
    ? card.summons[0]
    : (card.summon || 'None');
  const rarityKey = getRarityClass(card);
  const rarityLabel = RARITY_LABELS[rarityKey] || card.rarity || 'RARE';
  const fullRarityStr = `${card.stars || 1}-STAR ${rarityLabel}`;
  const rawJutsuName = card.jutsu || 'Secret Ninja Art';
  const jutsuName = rawJutsuName.toUpperCase();
  const jutsuDescription = card.jutsuDesc || card.description || `${rawJutsuName} with devastating power`;
  const cardElement = card.element || (card.id ? getCharacterMeta(card.id)?.element : null) || 'neutral';
  const elemMeta = ELEMENT_META[cardElement];

  const handleCardClick = (e) => {
    if (disableClickFlip) return;
    // If clicking a button, don't flip
    if (e.target.closest('.flip-card-action-btn')) {
      return;
    }
    setFlipped(!flipped);
  };

  return (
    <div
      className={`card-3d-perspective ${rarityKey}-tier ${className}`}
      onClick={handleCardClick}
    >
      <div className={`card-3d-inner ${flipped ? 'flipped' : ''}`}>
        
        {/* Front Face: Full-bleed character artwork top (~55-60%), solid dark bottom with name, summon, jutsu box, stars & rarity. ZERO stats */}
        <div className="card-3d-front">
          {/* Badge OVR - Top Right */}
          <div className="card-ovr-badge-3d" title={`${card.ovr} OVR`}>
            <span className="ovr-number">{card.ovr}</span>
            <span className="ovr-text">OVR</span>
          </div>

          {/* Plus Level Badge - Top Left */}
          {plusLevel > 0 && (
            <div className={`card-plus-badge-3d ${plusLevel >= 10 ? 'plus-badge-max' : ''}`}>
              +{plusLevel}
            </div>
          )}

          {/* Character Artwork Area (~55-60% height) - Full Bleed, NO inner box */}
          <div className="card-artwork-wrapper">
            <img
              src={getCardImageSrc(card)}
              alt={card.name}
              className="card-thumb-img"
              onError={handleImageError}
            />
          </div>

          {/* Information Area Below Artwork - Solid Dark Background */}
          <div className="card-info-bottom">
            <div className="card-name-group">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                <h4 className="card-title" title={card.name}>{card.name}</h4>
                {elemMeta && (
                  <span
                    className={`card-element-pill element-pill-${cardElement}`}
                    title={`Chakra Nature: ${elemMeta.label}`}
                  >
                    {elemMeta.symbol}
                  </span>
                )}
              </div>
              <div className="card-summon-subtitle">Summon: {summonName}</div>
            </div>

            {/* JUTSU BOX: Replaces stat grid. Bold gold jutsu name + short description */}
            <div className="card-jutsu-box">
              <div className="card-jutsu-name" title={rawJutsuName}>
                {jutsuName}
              </div>
              <div className="card-jutsu-desc">
                {jutsuDescription}
              </div>
            </div>

            <div className="card-footer-row">
              <span className="stars-rating">{starStr}</span>
              <span className="rarity-tag">{fullRarityStr}</span>
            </div>
          </div>

          {/* Quick detail trigger button on front */}
          {onClick && (
            <button
              className="flip-card-action-btn details-btn-front"
              onClick={(e) => {
                e.stopPropagation();
                onClick(card);
              }}
              title="Open detail view"
            >
              👁
            </button>
          )}
        </div>

        {/* Back Face */}
        <div className="card-3d-back">
          {/* Top Right Badge */}
          <div className="card-ovr-badge-3d back-ovr-badge">{card.ovr} OVR</div>

          {/* Header */}
          <div className="back-header">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
              <h4 className="back-title-name">{card.name}</h4>
              {elemMeta && (
                <span
                  className={`card-element-pill element-pill-${cardElement}`}
                  title={`Chakra Nature: ${elemMeta.label}`}
                  style={{ fontSize: '10px', padding: '2px 6px' }}
                >
                  {elemMeta.symbol} {elemMeta.label}
                </span>
              )}
            </div>
            <div className="back-stars">{starStr}</div>
          </div>

          {/* Jutsu Section */}
          <div className="back-jutsu">
            <span className="back-jutsu-label">SECRET JUTSU</span>
            <div className="back-jutsu-desc">{card.jutsu || 'Secret Ninja Art'}</div>
          </div>

          {/* Stats Bars */}
          <div className="back-stats">
            {[
              { label: 'ATK', value: card.atk },
              { label: 'DEF', value: card.def },
              { label: 'SPD', value: card.spd },
              { label: 'CHK', value: card.chk }
            ].map(({ label, value }) => (
              <div className="back-stat-row" key={label}>
                <span className="back-stat-label">{label}</span>
                <div className="back-stat-bar-track">
                  <div
                    className={`back-stat-bar-fill fill-${label.toLowerCase()}`}
                    style={{ width: `${value || 50}%` }}
                  />
                </div>
                <span className={`back-stat-value ${getAttributeColorClass(value)}`}>{value || 50}</span>
              </div>
            ))}
          </div>

          {/* Bottom Footer */}
          <div className="back-footer">
            {isUnlocked ? (
              <span className="status-unlocked">UNLOCKED IN VAULT</span>
            ) : (
              <span className="status-locked">Roll in Gacha to unlock this shinobi!</span>
            )}
          </div>

          {/* Quick detail trigger button on back */}
          {onClick && (
            <button
              className="flip-card-action-btn details-btn-back"
              onClick={(e) => {
                e.stopPropagation();
                onClick(card);
              }}
              title="Open detail view"
            >
              👁
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
