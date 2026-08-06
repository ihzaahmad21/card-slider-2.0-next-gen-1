import React from 'react';

export default function CardContainer({ card, onClick, className = '' }) {
  if (!card) return null;

  const starsFull = card.stars || 1;
  const starsEmpty = Math.max(0, 5 - starsFull);
  const starStr = '★ '.repeat(starsFull) + '☆ '.repeat(starsEmpty);
  const plusLevel = Math.max(0, Number(card.plusLevel || 0));

  const fallbackImage = '/images/naruto__part_1__by_masonengine_daim8u2.png';

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = fallbackImage;
  };

  return (
    <div
      className={`card-container ${card.rarityClass || 'bronze'}-tier ${className}`}
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
            src={card.img || fallbackImage}
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
            <div className="stat-row">
              <span className="stat-label">ATK</span>
              <div className="stat-track">
                <div className="stat-fill" style={{ width: `${card.atk || 50}%` }}></div>
              </div>
            </div>
            <div className="stat-row">
              <span className="stat-label">DEF</span>
              <div className="stat-track">
                <div className="stat-fill" style={{ width: `${card.def || 50}%` }}></div>
              </div>
            </div>
            <div className="stat-row">
              <span className="stat-label">CHK</span>
              <div className="stat-track">
                <div className="stat-fill" style={{ width: `${card.chk || 50}%` }}></div>
              </div>
            </div>
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
