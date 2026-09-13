import React, { useState, useEffect, useMemo } from 'react';
import { getMatchHistory, clearMatchHistory, resolveShinobiThumbnail, ensureRecordRounds } from '../utils/matchHistory.js';
import { getCardImageSrc } from '../utils/cards.js';
import './MatchHistoryModal.css';

export default function MatchHistoryModal({ isOpen, onClose, showToast }) {
  const [history, setHistory] = useState(() => getMatchHistory());
  const [confirmClear, setConfirmClear] = useState(false);
  const [expandedMatchId, setExpandedMatchId] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setHistory(getMatchHistory());
      setConfirmClear(false);
      setExpandedMatchId(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleUpdate = () => {
      setHistory(getMatchHistory());
    };
    window.addEventListener('shinobi_match_history_updated', handleUpdate);
    return () => window.removeEventListener('shinobi_match_history_updated', handleUpdate);
  }, []);

  const stats = useMemo(() => {
    const total = history.length;
    const wins = history.filter(h => h.result === 'VICTORY').length;
    const losses = history.filter(h => h.result === 'DEFEAT').length;
    const draws = history.filter(h => h.result === 'DRAW').length;
    const winrate = total > 0 ? Math.round((wins / total) * 100) : 0;
    return { total, wins, losses, draws, winrate };
  }, [history]);

  if (!isOpen) return null;

  const handleClear = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    clearMatchHistory();
    setConfirmClear(false);
    setExpandedMatchId(null);
    if (showToast) {
      showToast('🗑️ Match history cleared successfully.');
    }
  };

  return (
    <div className="mhm-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="mhm-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="mhm-header">
          <div className="mhm-header-title-box">
            <span className="mhm-icon">⚔️</span>
            <div>
              <h2 className="mhm-title">BATTLE MATCH HISTORY</h2>
              <span className="mhm-subtitle">Arena combat log & battle performance archive</span>
            </div>
          </div>
          <button
            type="button"
            className="mhm-close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Quick Stats Bar */}
        <div className="mhm-stats-bar">
          <div className="mhm-stat-chip">
            <span className="mhm-stat-val">{stats.total}</span>
            <span className="mhm-stat-label">MATCHES</span>
          </div>
          <div className="mhm-stat-chip chip-win">
            <span className="mhm-stat-val">{stats.wins}</span>
            <span className="mhm-stat-label">VICTORIES</span>
          </div>
          <div className="mhm-stat-chip chip-loss">
            <span className="mhm-stat-val">{stats.losses}</span>
            <span className="mhm-stat-label">DEFEATS</span>
          </div>
          <div className="mhm-stat-chip chip-draw">
            <span className="mhm-stat-val">{stats.draws}</span>
            <span className="mhm-stat-label">DRAWS</span>
          </div>
          <div className="mhm-stat-chip chip-rate">
            <span className="mhm-stat-val">{stats.winrate}%</span>
            <span className="mhm-stat-label">WIN RATE</span>
          </div>
        </div>

        {/* Body / List of Matches */}
        <div className="mhm-body">
          {history.length === 0 ? (
            <div className="mhm-empty-state">
              <div className="mhm-empty-emblem">📜</div>
              <h3>No Battle Records Yet</h3>
              <p>Clash against rogue shinobi in the Battle Arena and claim your rewards to log combat history here!</p>
            </div>
          ) : (
            <div className="mhm-list">
              {history.map(record => {
                const isWin = record.result === 'VICTORY';
                const isLoss = record.result === 'DEFEAT';
                const cardClass = isWin ? 'match-win' : isLoss ? 'match-loss' : 'match-draw';
                const isExpanded = expandedMatchId === record.id;

                return (
                  <div
                    key={record.id}
                    className={`mhm-card ${cardClass} ${isExpanded ? 'is-expanded' : ''}`}
                    onClick={() => setExpandedMatchId(prev => (prev === record.id ? null : record.id))}
                  >
                    {/* Top Row: Result Badge, Date, Rewards & Expand Indicator */}
                    <div className="mhm-card-header">
                      <div className="mhm-card-badge-row">
                        <span className={`mhm-badge ${cardClass}`}>
                          {isWin ? '🏆 VICTORY' : isLoss ? '💀 DEFEAT' : '⚖️ DRAW'}
                        </span>
                        <span className="mhm-card-date">🕒 {record.date}</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className="mhm-card-rewards">
                          {record.rewards?.coins > 0 && (
                            <span className="mhm-reward-pill coin">
                              🪙 +{record.rewards.coins.toLocaleString()}
                            </span>
                          )}
                          {record.rewards?.exp > 0 && (
                            <span className="mhm-reward-pill exp">
                              ⚡ +{record.rewards.exp} EXP
                            </span>
                          )}
                        </div>

                        <div className="mhm-expand-pill" title="Click to view round details">
                          <span>{isExpanded ? 'Hide' : 'Details'}</span>
                          <span className="mhm-chevron">▼</span>
                        </div>
                      </div>
                    </div>

                    {/* Middle Row: Squad vs Squad */}
                    <div className="mhm-squads-container">
                      {/* Player Squad */}
                      <div className="mhm-squad-side player-side">
                        <div className="mhm-squad-label">YOUR SQUAD</div>
                        <div className="mhm-squad-thumbs">
                          {record.playerSquad.map((shinobi, idx) => (
                            <div
                              key={shinobi.id || idx}
                              className={`mhm-mini-thumb rarity-${shinobi.rarityClass || 'bronze'}`}
                              title={`${shinobi.name} (OVR ${shinobi.ovr || 70})`}
                            >
                              <img
                                className="card-thumb-img"
                                src={resolveShinobiThumbnail(shinobi)}
                                alt={shinobi.name}
                                onError={e => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = getCardImageSrc({ image_url: 'images/naruto chunin.webp' });
                                }}
                              />
                              <span className="mhm-mini-ovr">{shinobi.ovr || 70}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Score Divider */}
                      <div className="mhm-score-box">
                        <span className="mhm-vs-tag">VS</span>
                        <span className="mhm-score-display">{record.score}</span>
                      </div>

                      {/* Enemy Squad */}
                      <div className="mhm-squad-side enemy-side">
                        <div className="mhm-squad-label enemy-label">{record.enemyName || 'ROGUE SHINOBI'}</div>
                        <div className="mhm-squad-thumbs">
                          {record.enemySquad.map((shinobi, idx) => (
                            <div
                              key={shinobi.id || idx}
                              className={`mhm-mini-thumb rarity-${shinobi.rarityClass || 'bronze'}`}
                              title={`${shinobi.name} (OVR ${shinobi.ovr || 70})`}
                            >
                              <img
                                className="card-thumb-img"
                                src={resolveShinobiThumbnail(shinobi)}
                                alt={shinobi.name}
                                onError={e => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = getCardImageSrc({ image_url: 'images/naruto chunin.webp' });
                                }}
                              />
                              <span className="mhm-mini-ovr">{shinobi.ovr || 70}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Expandable Detail Drawer: Slot Matchup Breakdown */}
                    {isExpanded && (() => {
                      const matchups = ensureRecordRounds(record);
                      const pWinsCount = matchups.filter(m => m.winner === 'player').length;
                      const bWinsCount = matchups.filter(m => m.winner === 'bot').length;
                      const drawsCount = matchups.filter(m => m.winner === 'draw').length;

                      return (
                        <div className="mhm-details-drawer" onClick={e => e.stopPropagation()}>
                          <div className="mhm-details-title-row">
                            <span className="mhm-details-title">
                              <span>⚔️</span> SLOT MATCHUP BREAKDOWN
                            </span>
                            <span className="mhm-breakdown-score-tag">
                              {record.score || `${pWinsCount} - ${bWinsCount}`} ({pWinsCount} WIN · {bWinsCount} LOSE{drawsCount > 0 ? ` · ${drawsCount} DRAW` : ''})
                            </span>
                          </div>

                          <div className="mhm-rounds-list">
                            {matchups.map((rnd, rIdx) => {
                              const isRoundWin = rnd.winner === 'player';
                              const isRoundLoss = rnd.winner === 'bot';
                              const roundPillClass = isRoundWin ? 'win' : isRoundLoss ? 'loss' : 'draw';
                              const roundPillText = isRoundWin ? 'WIN' : isRoundLoss ? 'LOSE' : 'DRAW';
                              const slotNum = rnd.slot || rnd.round || rIdx + 1;

                              return (
                                <div
                                  key={slotNum}
                                  className={`mhm-round-card round-${roundPillClass}`}
                                >
                                  {/* Slot Matchup Header */}
                                  <div className="mhm-round-top">
                                    <div className="mhm-slot-badge-label">
                                      <span>SLOT {slotNum} MATCHUP</span>
                                    </div>
                                    <span className={`mhm-round-pill ${roundPillClass}`}>
                                      {isRoundWin ? '✓ WIN' : isRoundLoss ? '✗ LOSE' : '− DRAW'}
                                    </span>
                                  </div>

                                  <div className="mhm-round-clash">
                                    {/* Player Fighter */}
                                    <div className="mhm-combatant player">
                                      <div className={`mhm-combatant-thumb rarity-${rnd.playerCard?.rarityClass || 'bronze'}`}>
                                        <img
                                          className="card-thumb-img"
                                          src={resolveShinobiThumbnail(rnd.playerCard)}
                                          alt={rnd.playerCard?.name || 'Your Shinobi'}
                                          onError={e => {
                                            e.currentTarget.onerror = null;
                                            e.currentTarget.src = getCardImageSrc({ image_url: 'images/naruto chunin.webp' });
                                          }}
                                        />
                                        <span className="mhm-mini-ovr">{rnd.playerCard?.ovr || 70}</span>
                                      </div>
                                      <div className="mhm-combatant-info">
                                        <span className="mhm-combatant-name">{rnd.playerCard?.name || 'Your Shinobi'}</span>
                                        <span className="mhm-combatant-jutsu">⚡ {rnd.playerCard?.jutsu || 'Secret Art'}</span>
                                        <span className="mhm-combatant-ovr">{rnd.playerCard?.ovr || 70} OVR</span>
                                      </div>
                                    </div>

                                    {/* Center Clash Area: Result Badge & VS & DMG */}
                                    <div className="mhm-clash-center">
                                      <span className={`mhm-clash-winner-tag ${roundPillClass}`}>
                                        {roundPillText}
                                      </span>
                                      <span className="mhm-vs-tag" style={{ fontSize: '0.62rem' }}>VS</span>
                                      {(rnd.playerDmg > 0 || rnd.botDmg > 0) && (
                                        <div className="mhm-clash-dmg-row">
                                          <span className="mhm-dmg-p">{rnd.playerDmg}</span>
                                          <span className="mhm-dmg-vs">:</span>
                                          <span className="mhm-dmg-e">{rnd.botDmg}</span>
                                        </div>
                                      )}
                                    </div>

                                    {/* Enemy Fighter */}
                                    <div className="mhm-combatant enemy">
                                      <div className={`mhm-combatant-thumb rarity-${rnd.botCard?.rarityClass || 'bronze'}`}>
                                        <img
                                          className="card-thumb-img"
                                          src={resolveShinobiThumbnail(rnd.botCard)}
                                          alt={rnd.botCard?.name || 'Enemy Shinobi'}
                                          onError={e => {
                                            e.currentTarget.onerror = null;
                                            e.currentTarget.src = getCardImageSrc({ image_url: 'images/naruto chunin.webp' });
                                          }}
                                        />
                                        <span className="mhm-mini-ovr">{rnd.botCard?.ovr || 70}</span>
                                      </div>
                                      <div className="mhm-combatant-info">
                                        <span className="mhm-combatant-name">{rnd.botCard?.name || 'Enemy Shinobi'}</span>
                                        <span className="mhm-combatant-jutsu">🔥 {rnd.botCard?.jutsu || 'Secret Jutsu'}</span>
                                        <span className="mhm-combatant-ovr">{rnd.botCard?.ovr || 70} OVR</span>
                                      </div>
                                    </div>
                                  </div>

                                  {rnd.log && (
                                    <div className="mhm-round-log">
                                      {rnd.log}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mhm-footer">
          {history.length > 0 && (
            <button
              type="button"
              className={`mhm-btn mhm-btn-clear ${confirmClear ? 'confirm' : ''}`}
              onClick={handleClear}
            >
              {confirmClear ? '⚠️ CONFIRM CLEAR?' : '🗑️ CLEAR HISTORY'}
            </button>
          )}
          <button
            type="button"
            className="mhm-btn mhm-btn-close"
            onClick={onClose}
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}
