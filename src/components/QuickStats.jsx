import React, { useMemo } from 'react';
import { calculateStats, getRarityColor, formatNumber } from '../utils/statsCalculator';
import './QuickStats.css';

const QuickStats = ({ inventory = [], allCards = [] }) => {
  const stats = useMemo(() => {
    return calculateStats(inventory, allCards);
  }, [inventory, allCards]);

  return (
    <div className="quick-stats">
      <div className="quick-stats-header">
        <svg className="stats-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 20V10M12 20V4M6 20v-6" />
        </svg>
        <span className="stats-label">Collection Stats</span>
      </div>

      {/* Completion Progress */}
      <div className="stats-completion">
        <div className="stats-completion-header">
          <span className="stats-completion-label">Collection</span>
          <span className="stats-completion-value">{stats.completionPercentage}%</span>
        </div>
        <div className="stats-progress-bar">
          <div
            className="stats-progress-fill"
            style={{ width: `${stats.completionPercentage}%` }}
          />
        </div>
        <div className="stats-completion-text">
          {stats.uniqueCards} / {allCards.length} unique cards
        </div>
      </div>

      {/* Cards Count */}
      <div className="stats-row">
        <div className="stats-item">
          <div className="stats-item-icon">🎴</div>
          <div className="stats-item-content">
            <div className="stats-item-value">{formatNumber(stats.totalCards)}</div>
            <div className="stats-item-label">Total Cards</div>
          </div>
        </div>

        <div className="stats-item">
          <div className="stats-item-icon">💎</div>
          <div className="stats-item-content">
            <div className="stats-item-value">{formatNumber(stats.totalValue)}</div>
            <div className="stats-item-label">Total OVR</div>
          </div>
        </div>
      </div>

      {/* Rarity Breakdown */}
      <div className="stats-rarity">
        <div className="stats-rarity-item">
          <div className="stats-rarity-dot" style={{ background: getRarityColor('gold') }} />
          <span className="stats-rarity-label">Gold</span>
          <span className="stats-rarity-count">{stats.rareCounts.gold}</span>
        </div>

        <div className="stats-rarity-item">
          <div className="stats-rarity-dot" style={{ background: getRarityColor('silver') }} />
          <span className="stats-rarity-label">Silver</span>
          <span className="stats-rarity-count">{stats.rareCounts.silver}</span>
        </div>

        <div className="stats-rarity-item">
          <div className="stats-rarity-dot" style={{ background: getRarityColor('bronze') }} />
          <span className="stats-rarity-label">Bronze</span>
          <span className="stats-rarity-count">{stats.rareCounts.bronze}</span>
        </div>
      </div>

      {/* Duplicates Count */}
      {stats.duplicates > 0 && (
        <div className="stats-duplicates">
          <span className="stats-duplicates-icon">📋</span>
          <span className="stats-duplicates-text">
            {formatNumber(stats.duplicates)} duplicate{stats.duplicates !== 1 ? 's' : ''}
          </span>
        </div>
      )}
    </div>
  );
};

export default QuickStats;