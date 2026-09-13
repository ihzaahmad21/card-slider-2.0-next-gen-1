import React from 'react';
import FlipCard from './FlipCard.jsx';
import { createBackdropClickHandler } from '../utils/modal.js';
import './GachaResultModal.css';

export default function GachaResultModal({
  results,
  onKeep,
  onQuickSell,
  onClose,
  onSelectCard
}) {
  if (!results || results.length === 0) return null;

  const topRarity = results[0]?.rarityClass || 'gold';
  const total = results.length;
  const pullTypeClass = total === 1 ? 'pull-single' : total < 5 ? 'pull-small' : 'pull-multi';

  const hasJackpot = results.some(c => c.rarityClass === 'diamond' || c.rarityClass === 'mythic');
  const jackpotTier = results.some(c => c.rarityClass === 'mythic') ? 'mythic'
                     : results.some(c => c.rarityClass === 'diamond') ? 'diamond' : null;

  return (
    <div className="modal-overlay active" onClick={createBackdropClickHandler(onClose)}>
        <div className={`gacha-reveal-stage ${pullTypeClass} ${hasJackpot ? 'jackpot jackpot-' + jackpotTier : ''}`}>
        {/* Header Title Section */}
        <div className="gacha-reveal-title">
          <h3>PACK OPENED!</h3>
          <span className={`reveal-tier-tag ${topRarity}-tag`}>
            {total} {total === 1 ? 'Card' : 'Cards'} Revealed
          </span>
          {hasJackpot && (
            <div className={`jackpot-banner jackpot-${jackpotTier}`}>
              ★ JACKPOT! {jackpotTier === 'mythic' ? 'MYTHIC' : 'DIAMOND'} OBTAINED ★
            </div>
          )}
        </div>

        {/* Static Grid Display (Uniform Card Size) */}
        <div className="gacha-grid-scroll-area">
          <div className={`gacha-cards-grid count-${Math.min(total, 10)}`}>
            {results.map((card, idx) => {
              const isAwakening = Array.isArray(card.tags) && card.tags.includes('awakening');
              const rarityClass = card.rarityClass || 'bronze';
              const isJackpot = rarityClass === 'diamond' || rarityClass === 'mythic';

              return (
                <div
                  key={`${card.id}-${idx}`}
                  className={[
                    'gacha-card-item',
                    isAwakening ? 'awakening-card' : '',
                    isAwakening ? `awakening-${rarityClass}` : '',
                    isJackpot ? 'jackpot-card' : ''
                  ].filter(Boolean).join(' ')}
                >
                  <FlipCard
                    card={card}
                    onClick={onSelectCard ? () => onSelectCard(card) : undefined}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Action Buttons */}
        <div className="gacha-modal-actions">
          <button className="btn-primary" onClick={onKeep}>
            KEEP ALL CARDS
          </button>
          <button className="btn-secondary" onClick={onQuickSell}>
            QUICK SELL
          </button>
        </div>
      </div>
    </div>
  );
}
