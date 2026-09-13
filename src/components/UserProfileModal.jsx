import React, { useState, useMemo, useEffect } from 'react';
import { getCardImageSrc } from '../utils/cards.js';
import AchievementBadge from './AchievementBadge.jsx';
import { ACHIEVEMENTS } from '../config/achievements.js';
import './UserProfileModal.css';

// ── Shinobi Rank Titles based on Player Level ──────────────────
export const SHINOBI_RANKS = [
  { minLevel: 50, title: 'Hokage',       kanji: '火影', color: '#ffd700', tier: 'kage',    desc: 'The Supreme Leader of the Hidden Leaf' },
  { minLevel: 40, title: 'Kage',         kanji: '影',   color: '#f97316', tier: 'kage',    desc: 'Village Leader with god-tier chakra mastery' },
  { minLevel: 30, title: 'S-Rank Ninja', kanji: 'S級', color: '#a855f7', tier: 's-rank',  desc: 'Legendary shinobi feared across the ninja world' },
  { minLevel: 20, title: 'ANBU Black Ops', kanji: '暗部', color: '#38bdf8', tier: 'anbu', desc: 'Elite covert operative under direct Kage orders' },
  { minLevel: 14, title: 'Special Jonin', kanji: '特上', color: '#06b6d4', tier: 'jonin',  desc: 'High-level shinobi with specialized ninja arts' },
  { minLevel: 8,  title: 'Chunin',       kanji: '中忍', color: '#10b981', tier: 'chunin', desc: 'Qualified squad commander and battle tactician' },
  { minLevel: 1,  title: 'Genin',        kanji: '下忍', color: '#94a3b8', tier: 'genin',  desc: 'Promising novice shinobi taking on D-rank missions' }
];

export function getPlayerRank(level) {
  const lvl = Math.max(1, Math.floor(Number(level) || 1));
  return SHINOBI_RANKS.find(r => lvl >= r.minLevel) || SHINOBI_RANKS[SHINOBI_RANKS.length - 1];
}

// ── Available Avatar / Profile Icons ───────────────────────────
export const AVATAR_PRESETS = [
  { id: 'kage',    icon: '影', label: 'Shadow (Kage)', element: 'Yin / Darkness', bg: '#1e1b4b' },
  { id: 'flame',   icon: '炎', label: 'Fire (Katon)',   element: 'Fire Style',     bg: '#451a03' },
  { id: 'water',   icon: '水', label: 'Water (Suiton)', element: 'Water Style',    bg: '#0c4a6e' },
  { id: 'wind',    icon: '風', label: 'Wind (Futon)',   element: 'Wind Style',     bg: '#064e3b' },
  { id: 'thunder', icon: '雷', label: 'Lightning (Rai)',element: 'Lightning Style',bg: '#3b0764' },
  { id: 'earth',   icon: '土', label: 'Earth (Doton)',  element: 'Earth Style',    bg: '#3f2c1d' },
  { id: 'shinobi', icon: '忍', label: 'Shinobi Way',    element: 'Ninja Creed',    bg: '#172554' },
  { id: 'dragon',  icon: '龍', label: 'Azure Dragon',   element: 'Sage Art',       bg: '#042f2e' },
  { id: 'oni',     icon: '鬼', label: 'Oni Demon',      element: 'Forbidden Jutsu',bg: '#4c0519' },
  { id: 'sword',   icon: '剣', label: 'Kenjutsu Master',element: 'Blade Art',      bg: '#1f2937' },
  { id: 'moon',    icon: '月', label: 'Tsukuyomi',      element: 'Dojutsu',        bg: '#2e1065' },
  { id: 'sun',     icon: '陽', label: 'Amaterasu Sun',  element: 'Kagutsuchi',     bg: '#431407' }
];

export const TABS = [
  { id: 'stats',         label: 'Battle Stats',     icon: '⚔️' },
  { id: 'collection',    label: 'Collection',       icon: '🎴' },
  { id: 'favorites',     label: 'Favorite Shinobi', icon: '⭐' },
  { id: 'customization', label: 'Customization',    icon: '🎭' }
];

export default function UserProfileModal({
  isOpen,
  onClose,
  level = 1,
  exp = 0,
  coins = 0,
  gems = 50,
  inventory = [],
  totalCardCount = 0,
  deckPresets = [],
  battleStats = null,
  avatarIcon = '影',
  onChangeAvatar,
  userName = 'Shadow Shinobi',
  onChangeUserName,
  onOpenMatchHistory,
  unlockedAchievements = []
}) {
  const [activeTab, setActiveTab] = useState('stats');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(userName);

  // Synchronize temp name if prop changes
  useEffect(() => {
    setTempName(userName);
  }, [userName]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Derived Player Rank & Level math
  const currentLevel = Math.max(1, Math.floor(Number(level) || 1));
  const currentExp = Math.max(0, Math.floor(Number(exp) || 0));
  const requiredExp = currentLevel * 500;
  const progressPct = Math.min(100, Math.max(0, Math.round((currentExp / requiredExp) * 100)));
  const rank = getPlayerRank(currentLevel);
  const expRemaining = Math.max(0, requiredExp - currentExp);

  // Battle Stats Calculation
  const stats = useMemo(() => {
    const totalMatches = Number(battleStats?.totalMatches) || 0;
    const wins = Number(battleStats?.wins) || 0;
    const losses = Number(battleStats?.losses) || 0;
    const draws = Number(battleStats?.draws) || 0;
    const currentWinStreak = Number(battleStats?.currentWinStreak) || 0;
    const winrate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;
    return { totalMatches, wins, losses, draws, currentWinStreak, winrate };
  }, [battleStats]);

  // Unique Collection Progress Calculation
  const collectionStats = useMemo(() => {
    const uniqueNames = new Set((inventory || []).map(c => c?.name).filter(Boolean));
    const ownedCount = uniqueNames.size;
    const totalCount = Math.max(1, Number(totalCardCount) || 1);
    const pct = Math.min(100, Math.round((ownedCount / totalCount) * 100));
    return { ownedCount, totalCount, pct };
  }, [inventory, totalCardCount]);

  // Favorite Shinobi: Top 3 cards most assigned across deck presets, or top OVR
  const topShinobi = useMemo(() => {
    if (!inventory || inventory.length === 0) return [];
    const usageCount = {};
    (deckPresets || []).forEach(preset => {
      (preset?.deck || []).forEach(instId => {
        if (instId) {
          usageCount[instId] = (usageCount[instId] || 0) + 1;
        }
      });
    });

    // Score cards by frequency in decks, break ties by OVR
    const scoredCards = [...inventory].sort((a, b) => {
      const freqA = usageCount[a.instanceId] || 0;
      const freqB = usageCount[b.instanceId] || 0;
      if (freqB !== freqA) return freqB - freqA;
      return (b.ovr || 70) - (a.ovr || 70);
    });

    // Deduplicate by name for visual diversity in top 3
    const seen = new Set();
    const uniqueTop = [];
    for (const card of scoredCards) {
      if (!seen.has(card.name)) {
        seen.add(card.name);
        uniqueTop.push({
          ...card,
          deckPresence: usageCount[card.instanceId] || 0
        });
      }
      if (uniqueTop.length >= 3) break;
    }
    return uniqueTop;
  }, [inventory, deckPresets]);

  const handleSaveName = (e) => {
    e.preventDefault();
    const clean = tempName.trim();
    if (clean && onChangeUserName) {
      onChangeUserName(clean);
    }
    setIsEditingName(false);
  };

  if (!isOpen) return null;

  return (
    <div className="upm-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="upm-modal upm-modal-split" onClick={e => e.stopPropagation()}>
        {/* Ambient Top Glow */}
        <div className="upm-ambient-glow" style={{ '--rank-color': rank.color }} />

        {/* Modal Close Button */}
        <button
          type="button"
          className="upm-close-btn"
          onClick={onClose}
          aria-label="Close Profile"
        >
          ✕
        </button>

        {/* ═════════════════════════════════════════════════════
            SPLIT DASHBOARD CONTAINER (SIDEBAR + MAIN CONTENT)
        ═════════════════════════════════════════════════════ */}
        <div className="upm-dashboard-layout">

          {/* ── LEFT COLUMN: SHINOBI PROFILE & LOGO SIDEBAR ── */}
          <aside className={`upm-sidebar upm-tier-${rank.tier}`}>
            {/* Avatar Logo Ring */}
            <div className="upm-avatar-container">
              <div className="upm-avatar-glow" style={{ borderColor: rank.color, color: rank.color }} />
              <div className="upm-avatar-badge" style={{ backgroundColor: rank.color }}>
                {avatarIcon}
              </div>
              <div className="upm-online-status" title="Status: Online" />
            </div>

            {/* Username & Rename */}
            <div className="upm-name-box">
              {isEditingName ? (
                <form onSubmit={handleSaveName} className="upm-name-form">
                  <input
                    type="text"
                    className="upm-name-input"
                    value={tempName}
                    maxLength={20}
                    autoFocus
                    onChange={e => setTempName(e.target.value)}
                  />
                  <button type="submit" className="upm-name-save" title="Save">✓</button>
                  <button type="button" className="upm-name-cancel" onClick={() => setIsEditingName(false)} title="Cancel">✕</button>
                </form>
              ) : (
                <h2 className="upm-username" onClick={() => setIsEditingName(true)} title="Click to rename">
                  <span>{userName}</span>
                  <span className="upm-edit-pencil">✎</span>
                </h2>
              )}
            </div>

            {/* Rank Title & Kanji */}
            <div className="upm-rank-badge-box">
              <span className="upm-rank-kanji" style={{ color: rank.color, borderColor: rank.color }}>
                {rank.kanji}
              </span>
              <span className="upm-rank-title" style={{ color: rank.color }}>
                {rank.title}
              </span>
            </div>

            {/* Level Badge Pill */}
            <div className="upm-level-pill">
              <span className="upm-level-pill-lbl">SHINOBI LEVEL</span>
              <span className="upm-level-pill-val" style={{ color: rank.color }}>Lv.{currentLevel}</span>
            </div>

            {/* EXP Progress Area */}
            <div className="upm-xp-sidebar-block">
              <div className="upm-xp-row">
                <span className="upm-xp-lbl">CHAKRA MASTERY</span>
                <span className="upm-xp-pct">{progressPct}%</span>
              </div>
              <div className="upm-xp-bar-track">
                <div
                  className="upm-xp-bar-fill"
                  style={{ width: `${progressPct}%`, '--bar-glow': rank.color }}
                />
              </div>
              <div className="upm-xp-sub">
                {currentExp.toLocaleString()} / {requiredExp.toLocaleString()} EXP
              </div>
              {expRemaining > 0 && (
                <div className="upm-xp-hint">
                  Need {expRemaining.toLocaleString()} EXP to Lv.{currentLevel + 1}
                </div>
              )}
            </div>

            {/* Player Vault / Currencies */}
            <div className="upm-vault-list">
              <div className="upm-vault-item upm-vault-coins">
                <div className="upm-vault-icon">
                  <svg viewBox="0 0 24 24" fill="#f0c14b">
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                </div>
                <div className="upm-vault-meta">
                  <span className="upm-vault-val">{(coins || 0).toLocaleString()}</span>
                  <span className="upm-vault-lbl">Ninja Coins</span>
                </div>
              </div>

              <div className="upm-vault-item upm-vault-gems">
                <div className="upm-vault-icon">
                  <svg viewBox="0 0 24 24" fill="#7fd8ff">
                    <path d="M12 2l4 6-4 14-4-14z" />
                  </svg>
                </div>
                <div className="upm-vault-meta">
                  <span className="upm-vault-val">{(gems || 0).toLocaleString()}</span>
                  <span className="upm-vault-lbl">Shinobi Gems / Ryo</span>
                </div>
              </div>

              <div className="upm-vault-item upm-vault-scrolls">
                <div className="upm-vault-icon">📜</div>
                <div className="upm-vault-meta">
                  <span className="upm-vault-val">{inventory.length}</span>
                  <span className="upm-vault-lbl">Cards in Deck Archive</span>
                </div>
              </div>
            </div>
          </aside>

          {/* ── RIGHT COLUMN: TABS (SUB MENU) & ACTIVE CONTENT ── */}
          <main className="upm-main-panel">
            {/* SUB MENU TABS NAVIGATION */}
            <div className="upm-tabs-nav" role="tablist">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  className={`upm-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span className="upm-tab-icon">{tab.icon}</span>
                  <span className="upm-tab-text">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* TAB CONTENT PANELS */}
            <div className="upm-tab-body">
              {/* TAB 1: BATTLE STATS */}
              {activeTab === 'stats' && (
                <div className="upm-panel upm-panel-stats animate-fade-in">
                  <div className="upm-stats-metrics-grid">
                    <div className="upm-metric-box">
                      <span className="upm-metric-val">{stats.totalMatches}</span>
                      <span className="upm-metric-title">TOTAL CLASHES</span>
                    </div>
                    <div className="upm-metric-box metric-win">
                      <span className="upm-metric-val">{stats.wins}</span>
                      <span className="upm-metric-title">VICTORIES</span>
                    </div>
                    <div className="upm-metric-box metric-loss">
                      <span className="upm-metric-val">{stats.losses}</span>
                      <span className="upm-metric-title">DEFEATS</span>
                    </div>
                    <div className="upm-metric-box metric-draw">
                      <span className="upm-metric-val">{stats.draws}</span>
                      <span className="upm-metric-title">DRAWS</span>
                    </div>
                    <div className="upm-metric-box" style={{ borderColor: 'rgba(245, 158, 11, 0.45)', background: 'rgba(245, 158, 11, 0.08)' }}>
                      <span className="upm-metric-val" style={{ color: '#fbbf24' }}>
                        {stats.currentWinStreak} 🔥
                      </span>
                      <span className="upm-metric-title">WIN STREAK</span>
                    </div>
                  </div>

                  {/* Winrate gauge visual */}
                  <div className="upm-winrate-banner">
                    <div className="upm-winrate-info">
                      <span className="upm-winrate-lbl">BATTLE WINRATE</span>
                      <span className="upm-winrate-pct">{stats.winrate}%</span>
                    </div>
                    <div className="upm-winrate-bar-track">
                      <div
                        className="upm-winrate-bar-fill"
                        style={{ width: `${stats.winrate}%` }}
                      />
                    </div>
                    <div className="upm-winrate-sub">
                      {stats.totalMatches === 0
                        ? 'No battle data recorded yet. Enter the Battle Arena to start testing your cell in combat!'
                        : `Dominating the shinobi arena with a ${stats.winrate}% victory ratio across ${stats.totalMatches} matches.`}
                    </div>
                  </div>

                  {/* Match History Action Button */}
                  <div className="upm-history-btn-box">
                    <button
                      type="button"
                      className="upm-history-trigger-btn"
                      onClick={onOpenMatchHistory}
                    >
                      <span className="upm-htb-icon">📜</span>
                      <div className="upm-htb-text">
                        <span className="upm-htb-title">VIEW MATCH HISTORY</span>
                        <span className="upm-htb-desc">Browse past clashes, squads, scores, and rewards</span>
                      </div>
                      <span className="upm-htb-arrow">➔</span>
                    </button>
                  </div>

                  {/* Achievements & Milestones Section */}
                  <div className="achievements-section">
                    <div className="achievements-section-header">
                      <div className="achievements-section-title">
                        <span>🏆</span> SHINOBI MILESTONES
                      </div>
                      <span className="achievements-progress-pill">
                        {unlockedAchievements.length} / {ACHIEVEMENTS.length} Unlocked
                      </span>
                    </div>

                    <div className="achievements-grid">
                      {ACHIEVEMENTS.map(ach => (
                        <AchievementBadge
                          key={ach.id}
                          achievement={ach}
                          isUnlocked={unlockedAchievements.includes(ach.id)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: COLLECTION PROGRESS */}
              {activeTab === 'collection' && (
                <div className="upm-panel upm-panel-collection animate-fade-in">
                  <div className="upm-collection-showcase">
                    <div className="upm-col-pct-disc">
                      <span className="upm-disc-num">{collectionStats.pct}%</span>
                      <span className="upm-disc-sub">COMPLETED</span>
                    </div>
                    <div className="upm-col-details">
                      <h3 className="upm-col-heading">Ninja Scroll Archive</h3>
                      <p className="upm-col-expl">
                        You have unlocked <strong>{collectionStats.ownedCount}</strong> unique shinobi cards
                        out of <strong>{collectionStats.totalCount}</strong> known characters in the ninja world.
                      </p>
                      <div className="upm-col-track">
                        <div
                          className="upm-col-bar"
                          style={{ width: `${collectionStats.pct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="upm-col-badges">
                    <div className="upm-col-badge-item">
                      <span className="upm-badge-num">{inventory.length}</span>
                      <span className="upm-badge-lbl">Total Copies Owned</span>
                    </div>
                    <div className="upm-col-badge-item">
                      <span className="upm-badge-num">{collectionStats.ownedCount}</span>
                      <span className="upm-badge-lbl">Unique Shinobi Found</span>
                    </div>
                    <div className="upm-col-badge-item">
                      <span className="upm-badge-num">{Math.max(0, collectionStats.totalCount - collectionStats.ownedCount)}</span>
                      <span className="upm-badge-lbl">Remaining to Collect</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: FAVORITE SHINOBI */}
              {activeTab === 'favorites' && (
                <div className="upm-panel upm-panel-favorites animate-fade-in">
                  <div className="upm-fav-header">
                    <h4 className="upm-fav-title">TOP DEPLOYED SHINOBI (TOP 3)</h4>
                    <span className="upm-fav-sub">Your most trusted cell members across battle formations</span>
                  </div>

                  {topShinobi.length === 0 ? (
                    <div className="upm-fav-empty">
                      <div className="upm-empty-icon">🎴</div>
                      <p>Assemble and confirm your squad in Deck Builder to discover your favorite shinobi cell!</p>
                    </div>
                  ) : (
                    <div className="upm-fav-grid">
                      {topShinobi.map((card, idx) => {
                        const cardImg = getCardImageSrc(card);
                        const rClass = card.rarityClass || 'bronze';
                        const rLabel = card.rarity || 'COMMON';
                        const medalTitle = idx === 0 ? '🥇 #1 VANGUARD' : idx === 1 ? '🥈 #2 TACTICIAN' : '🥉 #3 SUPPORT';
                        return (
                          <div key={card.instanceId || card.id || idx} className={`upm-fav-card rank-${idx + 1} rarity-${rClass}`}>
                            <div className={`upm-fav-medal medal-${idx + 1}`}>
                              {medalTitle}
                            </div>
                            <div className="upm-fav-avatar-wrap">
                              <img
                                src={cardImg}
                                alt={card.name}
                                className="upm-fav-photo"
                                onError={e => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = getCardImageSrc({ image_url: 'images/1 shukaku.webp' });
                                }}
                              />
                              <span className={`upm-fav-rarity-tag rarity-${rClass}`}>
                                {rLabel}
                              </span>
                            </div>
                            <div className="upm-fav-info">
                              <span className="upm-fav-name" title={card.name}>{card.name}</span>
                              <div className="upm-fav-stats-line">
                                <span className="upm-fav-ovr-badge">OVR ⚡ {card.ovr || 70}</span>
                                {card.deckPresence > 0 ? (
                                  <span className="upm-fav-deploy-badge">🛡️ {card.deckPresence} Deck{card.deckPresence > 1 ? 's' : ''}</span>
                                ) : (
                                  <span className="upm-fav-deploy-badge">⭐ Top Shinobi</span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: CUSTOMIZATION (Avatar / Profile Icon) */}
              {activeTab === 'customization' && (
                <div className="upm-panel upm-panel-customization animate-fade-in">
                  <div className="upm-custom-header">
                    <h4 className="upm-custom-title">CHOOSE YOUR SHINOBI EMBLEM</h4>
                    <p className="upm-custom-sub">Select your avatar kanji to represent your ninja identity across all menus and arenas.</p>
                  </div>

                  <div className="upm-avatar-picker-grid">
                    {AVATAR_PRESETS.map(preset => {
                      const isSelected = avatarIcon === preset.icon;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          className={`upm-avatar-preset-btn ${isSelected ? 'selected' : ''}`}
                          onClick={() => onChangeAvatar?.(preset.icon)}
                          title={preset.label}
                        >
                          <div
                            className="upm-preset-circle"
                            style={{ background: preset.bg, borderColor: isSelected ? '#38bdf8' : 'transparent' }}
                          >
                            <span className="upm-preset-icon">{preset.icon}</span>
                            {isSelected && <span className="upm-preset-check">✓</span>}
                          </div>
                          <span className="upm-preset-label">{preset.label}</span>
                          <span className="upm-preset-element">{preset.element}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* FOOTER ACTION */}
            <div className="upm-modal-footer">
              <button type="button" className="upm-footer-done-btn" onClick={onClose}>
                Close Profile
              </button>
            </div>
          </main>

        </div>
      </div>
    </div>
  );
}
