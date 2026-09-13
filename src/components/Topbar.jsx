import React from 'react';
import './Topbar.css';

export default function Topbar({
  coins = 1500,
  gems = 50,
  level = 1,
  exp = 0,
  avatarIcon = '影',
  onOpenProfile
}) {
  const currentLevel = Math.max(1, Math.floor(Number(level) || 1));
  const currentExp = Math.max(0, Math.floor(Number(exp) || 0));
  const requiredExp = currentLevel * 500;
  const progressPct = Math.min(100, Math.max(0, Math.round((currentExp / requiredExp) * 100)));

  return (
    <header className="topbar">
      <div className="server-pill">
        <span className="server-dot" /> SERVER: ONLINE (12ms)
      </div>

      <div className="topbar-right">
        <div className="currency" style={{ color: '#f0c14b' }} title="Ninja Coins">
          <svg viewBox="0 0 24 24" fill="#f0c14b">
            <circle cx="12" cy="12" r="10" />
          </svg>
          {typeof coins === 'number' ? coins.toLocaleString() : coins}
        </div>

        <div className="currency" style={{ color: '#7fd8ff' }} title="Shinobi Gems">
          <svg viewBox="0 0 24 24" fill="#7fd8ff">
            <path d="M12 2l4 6-4 14-4-14z" />
          </svg>
          {gems}
        </div>

        <div
          className="avatar-wrap"
          onClick={onOpenProfile}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onOpenProfile?.();
            }
          }}
          title={`Click to view Shinobi Profile - Lv.${currentLevel} | EXP: ${currentExp.toLocaleString()} / ${requiredExp.toLocaleString()} (${progressPct}%)`}
        >
          <div className="avatar-ring">
            <div className="avatar-inner">{avatarIcon}</div>
          </div>
          <div className="player-meta-box">
            <div className="level-tag">
              Lv. <b>{currentLevel}</b>
            </div>
            <div className="exp-bar-track" title={`EXP: ${currentExp} / ${requiredExp} (${progressPct}%)`}>
              <div className="exp-bar-fill" style={{ width: `${progressPct}%` }} />
            </div>
            <span className="exp-text-sub">{currentExp}/{requiredExp} XP</span>
          </div>
        </div>
      </div>
    </header>
  );
}

