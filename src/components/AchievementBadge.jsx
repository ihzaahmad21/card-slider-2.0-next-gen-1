import React from 'react';
import './AchievementBadge.css';

export default function AchievementBadge({ achievement, isUnlocked }) {
  const { label, desc, icon, reward, category } = achievement;

  return (
    <div className={`achievement-card ${isUnlocked ? 'unlocked' : 'locked'} cat-${category}`}>
      <div className="achievement-icon-wrapper">
        <span className="achievement-icon">{icon}</span>
        {isUnlocked ? (
          <span className="achievement-status-badge unlocked-badge" title="Unlocked">✓</span>
        ) : (
          <span className="achievement-status-badge locked-badge" title="Locked">🔒</span>
        )}
      </div>
      <div className="achievement-info">
        <div className="achievement-header-row">
          <h4 className="achievement-title">{label}</h4>
          <span className="achievement-reward">+{reward} 🪙</span>
        </div>
        <p className="achievement-desc">{desc}</p>
      </div>
    </div>
  );
}
