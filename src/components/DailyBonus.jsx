import React from 'react';
import { useDailyBonus, rewardForStreak } from '../hooks/useDailyBonus.js';
import './DailyBonus.css';

const CHAKRA_TIER_NAMES = [
  'Awakening Spark',
  'Blue Flame',
  'Cyan Surge',
  'Golden Aura',
  'Solar Flare',
  'Inferno Charge',
  'MAX CHAKRA OVERLOAD'
];

const DailyBonus = ({ onClaim }) => {
  const {
    streak,
    totalClaims,
    canClaim,
    claimedToday,
    claim
  } = useDailyBonus();

  const handleClaim = () => {
    const result = claim();
    if (result && onClaim) onClaim(result);
  };

  const displayReward = rewardForStreak(streak);
  const currentCycleDay = Math.min(7, Math.max(1, ((streak - 1) % 7) + 1));
  const chakraTierName = CHAKRA_TIER_NAMES[currentCycleDay - 1] || 'Chakra Flame';

  return (
    <div className={`daily-bonus chakra-meter-widget ${claimedToday ? 'claimed' : canClaim ? 'ready-to-claim' : ''} tier-${currentCycleDay}`}>
      {/* Header */}
      <div className="daily-bonus-header">
        <div className="chakra-title-group">
          <span className="chakra-core-icon">🌀</span>
          <div>
            <span className="daily-bonus-label">Chakra Infusion</span>
            <div className="chakra-tier-subtitle">{chakraTierName}</div>
          </div>
        </div>
        <div className="chakra-streak-pill">
          Day {streak} Streak
        </div>
      </div>

      {/* 7-Segment Chakra Meter Bar */}
      <div className="chakra-track-container" title={`Cycle Day ${currentCycleDay} of 7`}>
        <div className="chakra-segments-grid">
          {[1, 2, 3, 4, 5, 6, 7].map((d) => {
            const isFilled = d < currentCycleDay || (d === currentCycleDay && claimedToday);
            const isTarget = d === currentCycleDay && !claimedToday;
            const segmentClass = isFilled ? 'segment-filled' : isTarget ? 'segment-active' : 'segment-locked';

            return (
              <div
                key={d}
                className={`chakra-segment-bar ${segmentClass} seg-${d}`}
                title={`Day ${d}: +${rewardForStreak(d)} Coins`}
              >
                <div className="chakra-segment-fill" />
                <span className="chakra-segment-num">{d}</span>
              </div>
            );
          })}
        </div>
        <div className="chakra-flow-indicator" style={{ width: `${(currentCycleDay / 7) * 100}%` }} />
      </div>

      {/* Reward highlight */}
      <div className="daily-bonus-streak">
        <span className="daily-bonus-day">
          {claimedToday ? 'Chakra Stabilized' : `Level ${currentCycleDay} Surge`}
        </span>
        <span className="daily-bonus-reward">+{displayReward} Coins</span>
      </div>

      {/* Claim Button */}
      <button
        type="button"
        className="daily-bonus-claim chakra-infuse-btn"
        onClick={handleClaim}
        disabled={!canClaim}
      >
        {claimedToday ? '✓ Infused Today' : canClaim ? '⚡ Infuse Chakra Now' : 'Recharging...'}
      </button>

      {totalClaims > 0 && (
        <div className="daily-bonus-total">
          🔥 {totalClaims} total infusions completed
        </div>
      )}
    </div>
  );
};

export default DailyBonus;