import React, { useState, useEffect, useRef } from 'react';
import { getCardImageSrc } from '../utils/cards.js';
import {
  simulateClashRound,
  calculateSquadAvgOvr,
  MIN_SQUAD_SIZE,
  calculateBattleRewards,
  calculateLevelUp,
  getExpProgress
} from '../utils/battle.js';
import { saveMatchToHistory, resolveShinobiThumbnail, resolveShinobiJutsu } from '../utils/matchHistory.js';
import './BattleArenaView.css';

export default function BattleArenaView({
  playerSquad = [],
  botSquad = [],
  botName = 'Rogue Shinobi Brigade',
  onRerollBot,
  onNavigateToDeck,
  onNavigateToHome,
  onAwardRewards,
  onAwardCoins,
  addPlayerExp,
  playerLevel = 1,
  playerExp = 0,
  showToast,
  playerSynergyBonus = { atk: 0, def: 0, chk: 0 },
  onOpenMatchHistory
}) {
  const [activeSlot, setActiveSlot] = useState(null); // current round in animation
  const [clashResults, setClashResults] = useState([]);
  const [battleLogs, setBattleLogs] = useState([]);
  const [isBattling, setIsBattling] = useState(false);
  const [battleFinished, setBattleFinished] = useState(false);
  const [battleOutcome, setBattleOutcome] = useState(null); // 'player' | 'bot' | 'draw'
  const [rewardClaimed, setRewardClaimed] = useState(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [matchScore, setMatchScore] = useState({ playerWins: 0, botWins: 0, draws: 0 });
  const logEndRef = useRef(null);
  const resultsRef = useRef([]);
  const matchRecordedRef = useRef(false);

  const playerFilled = (playerSquad || []).filter(Boolean);
  const botFilled = (botSquad || []).filter(Boolean);
  const maxSlots = Math.max(playerFilled.length, botFilled.length, 3);

  const playerAvgOvr = calculateSquadAvgOvr(playerFilled);
  const botAvgOvr = calculateSquadAvgOvr(botFilled);

  const ovrDiff = playerAvgOvr - botAvgOvr;
  const matchupStatus = ovrDiff > 3
    ? { label: 'Player Advantage', color: '#10b981' }
    : ovrDiff < -3
      ? { label: 'BOT Advantage', color: '#ef4444' }
      : { label: 'Evenly Matched', color: '#f59e0b' };

  // Scroll logs to bottom
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollTop = logEndRef.current.scrollHeight;
    }
  }, [battleLogs]);

  // Reset battle state when botSquad or playerSquad changes
  useEffect(() => {
    setClashResults([]);
    setBattleLogs([
      `🥋 Battle Arena Initialized!`,
      `👉 Player Squad (${playerFilled.length} Shinobi, Avg OVR: ${playerAvgOvr}) vs ${botName} (${botFilled.length} Shinobi, Avg OVR: ${botAvgOvr}).`,
      `⚔️ Matchup: ${matchupStatus.label}. Click "START CLASH" to begin!`
    ]);
    setIsBattling(false);
    setBattleFinished(false);
    setBattleOutcome(null);
    setActiveSlot(null);
    setRewardClaimed(false);
    setIsResultModalOpen(false);
    setMatchScore({ playerWins: 0, botWins: 0, draws: 0 });
  }, [botSquad, playerSquad]);

  // Handle running the clash step-by-step
  const handleStartClash = async () => {
    if (playerFilled.length < MIN_SQUAD_SIZE) {
      if (showToast) showToast('⚠️ Equiplah minimal 3 shinobi di Deck Builder sebelum bertarung!');
      return;
    }

    if (isBattling || battleFinished) return;
    setIsBattling(true);
    setClashResults([]);
    setBattleLogs(prev => [...prev, '⚡ FIGHT BEGINS! Clashing shinobi formations...']);

    const results = [];
    resultsRef.current = [];
    let playerWins = 0;
    let botWins = 0;

    for (let i = 0; i < maxSlots; i++) {
      setActiveSlot(i);
      const pCard = playerFilled[i] || null;
      const bCard = botFilled[i] || null;

      // Small delay between rounds for dramatic effect
      await new Promise(r => setTimeout(r, 650));

      const roundResult = simulateClashRound(pCard, bCard, playerSynergyBonus, i + 1);
      results.push(roundResult);
      setClashResults([...results]);
      resultsRef.current = [...results];

      if (roundResult.winner === 'player') playerWins++;
      else if (roundResult.winner === 'bot') botWins++;

      setBattleLogs(prev => [
        ...prev,
        `[Slot ${i + 1}] ${roundResult.log}`
      ]);
    }

    setMatchScore({
      playerWins,
      botWins,
      draws: Math.max(0, maxSlots - playerWins - botWins)
    });
    setActiveSlot(null);
    setIsBattling(false);
    setBattleFinished(true);

    let finalOutcome = 'draw';
    if (playerWins > botWins) {
      finalOutcome = 'player';
    } else if (botWins > playerWins) {
      finalOutcome = 'bot';
    } else {
      finalOutcome = 'draw';
    }

    const calculatedReward = calculateBattleRewards(finalOutcome);

    if (finalOutcome === 'player') {
      setBattleLogs(prev => [
        ...prev,
        `🏆 VICTORY! Player wins ${playerWins} - ${botWins}! Rewards: +${calculatedReward.coins.toLocaleString()} Coins & +${calculatedReward.exp} EXP!`
      ]);
      if (showToast) showToast(`🏆 VICTORY! +${calculatedReward.coins.toLocaleString()} Coins & +${calculatedReward.exp} EXP earned!`);
    } else if (finalOutcome === 'bot') {
      setBattleLogs(prev => [
        ...prev,
        `💀 DEFEAT! ${botName} wins ${botWins} - ${playerWins}. Consolation: +${calculatedReward.coins.toLocaleString()} Coins & +${calculatedReward.exp} EXP.`
      ]);
      if (showToast) showToast(`💀 DEFEAT! +${calculatedReward.coins.toLocaleString()} Coins & +${calculatedReward.exp} EXP received.`);
    } else {
      setBattleLogs(prev => [
        ...prev,
        `⚖️ DRAW! Battle ended in a tie (${playerWins} - ${botWins}). Rewards: +${calculatedReward.coins.toLocaleString()} Coins & +${calculatedReward.exp} EXP.`
      ]);
      if (showToast) showToast(`⚖️ DRAW! +${calculatedReward.coins.toLocaleString()} Coins & +${calculatedReward.exp} EXP received.`);
    }

    setBattleOutcome(finalOutcome);
    setIsResultModalOpen(true);
  };

  const recordCurrentMatch = (rewards) => {
    const finalResult = battleOutcome === 'player' ? 'VICTORY' : battleOutcome === 'bot' ? 'DEFEAT' : 'DRAW';
    const finalScore = `${matchScore.playerWins} - ${matchScore.botWins}`;
    // Store raw image_url (not resolved) so resolveShinobiThumbnail can do a clean lookup.
    // Storing resolved paths causes double-prepend of BASE_URL → broken images.
    const mapCard = (c) => ({
      id: c.id,
      name: c.name,
      image_url: c.image_url || c.img || c.image || '',   // keep raw relative path
      img: c.image_url || c.img || c.image || '',
      ovr: c.ovr,
      rarityClass: c.rarityClass,
      rarity: c.rarity,
      equippedJutsu: c.equippedJutsu || [],               // for resolveShinobiJutsu
      jutsu: c.jutsu || ''
    });
    const pSquad = playerFilled.map(mapCard);
    const eSquad = botFilled.map(mapCard);

    const rawRounds = (clashResults && clashResults.length > 0) ? clashResults : resultsRef.current;
    const formattedRounds = (rawRounds || []).map((r, idx) => ({
      ...r,
      slot: r.slot || r.round || idx + 1,
      round: r.round || r.slot || idx + 1
    }));

    saveMatchToHistory({
      result: finalResult,
      score: finalScore,
      playerSquad: pSquad,
      enemySquad: eSquad,
      enemyName: botName,
      rounds: formattedRounds,
      rewards: { coins: rewards?.coins || 0, exp: rewards?.exp || 0 }
    });
  };

  const handleClaimRewardAndReturn = (destination = 'deck') => {
    const rewards = calculateBattleRewards(battleOutcome);
    if (!rewardClaimed) {
      setRewardClaimed(true);
      recordCurrentMatch(rewards);
      if (onAwardRewards) {
        onAwardRewards({ ...rewards, outcome: battleOutcome });
      } else {
        if (onAwardCoins) onAwardCoins(rewards.coins);
        if (addPlayerExp) addPlayerExp(rewards.exp);
      }
      if (showToast) {
        showToast(`💰 Claimed +${rewards.coins.toLocaleString()} Coins & +${rewards.exp} EXP!`);
      }
    }
    setIsResultModalOpen(false);
    if (destination === 'home' && onNavigateToHome) {
      onNavigateToHome();
    } else if (onNavigateToDeck) {
      onNavigateToDeck();
    }
  };

  const handleClaimOnly = () => {
    if (rewardClaimed) return;
    setRewardClaimed(true);
    const rewards = calculateBattleRewards(battleOutcome);
    recordCurrentMatch(rewards);
    if (onAwardRewards) {
      onAwardRewards({ ...rewards, outcome: battleOutcome });
    } else {
      if (onAwardCoins) onAwardCoins(rewards.coins);
      if (addPlayerExp) addPlayerExp(rewards.exp);
    }
    if (showToast) {
      showToast(`💰 Claimed +${rewards.coins.toLocaleString()} Coins & +${rewards.exp} EXP!`);
    }
  };

  const handleResetBattle = () => {
    setClashResults([]);
    setBattleLogs([
      `🥋 Rematch Ready!`,
      `Click "START CLASH" to challenge ${botName} again, or "RE-ROLL BOT" for a new opponent.`
    ]);
    setIsBattling(false);
    setBattleFinished(false);
    setBattleOutcome(null);
    setActiveSlot(null);
    setRewardClaimed(false);
    setIsResultModalOpen(false);
  };

  if (playerFilled.length === 0) {
    return (
      <section className="view active battle-arena-view" id="view-battle">
        <div className="battle-empty-container">
          <div className="battle-empty-emblem">⚔️</div>
          <h2>No Active Squad in Battle Arena</h2>
          <p>
            You have not confirmed a squad yet. Head over to <strong>Deck Builder</strong>,
            assemble at least 3 of your strongest shinobi, and click <strong>Confirm Squad</strong>!
          </p>
          <button
            type="button"
            className="battle-btn battle-btn-primary"
            onClick={onNavigateToDeck}
          >
            🛡️ Go to Deck Builder
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="view active battle-arena-view" id="view-battle">
      {/* ── HEADER BANNER: VERSUS DISPLAY ── */}
      <div className="battle-matchup-header">
        {/* Left: Player Info */}
        <div className="team-summary player-side">
          <div className="team-badge">YOUR TEAM</div>
          <h2 className="team-name">Player Shinobi Cell</h2>
          <div className="team-stats-row">
            <span className="stat-pill avg-ovr">Avg OVR ⚡ {playerAvgOvr}</span>
            <span className="stat-pill">{playerFilled.length} Shinobi</span>
            {(playerSynergyBonus.atk > 0 || playerSynergyBonus.def > 0) && (
              <span className="stat-pill synergy">
                Synergy +{playerSynergyBonus.atk} ATK
              </span>
            )}
          </div>
        </div>

        {/* Center: VS Emblem */}
        <div className="versus-emblem-container">
          <div className="versus-ring">
            <span className="vs-text">VS</span>
          </div>
          <div className="matchup-indicator" style={{ color: matchupStatus.color }}>
            {matchupStatus.label}
          </div>
        </div>

        {/* Right: BOT Info */}
        <div className="team-summary bot-side">
          <div className="team-badge bot-badge">AI ENEMY</div>
          <h2 className="team-name">{botName}</h2>
          <div className="team-stats-row">
            <span className="stat-pill avg-ovr bot-ovr">Avg OVR ⚡ {botAvgOvr}</span>
            <span className="stat-pill">{botFilled.length} Shinobi</span>
            <span className="stat-pill bot-tag">Rogue Shinobi</span>
          </div>
        </div>
      </div>

      {/* ── CONTROLS BAR ── */}
      <div className="battle-controls-bar">
        {!battleFinished ? (
          <button
            type="button"
            className="battle-btn battle-btn-clash"
            onClick={handleStartClash}
            disabled={isBattling}
          >
            {isBattling ? '⚡ Clashing in Progress...' : '⚔️ START CLASH'}
          </button>
        ) : (
          <button
            type="button"
            className="battle-btn battle-btn-clash"
            onClick={handleResetBattle}
          >
            🔁 REMATCH
          </button>
        )}

        <button
          type="button"
          className="battle-btn battle-btn-secondary"
          onClick={onRerollBot}
          disabled={isBattling}
          title="Auto-generate a new balanced bot squad"
        >
          🎲 Re-roll BOT Squad
        </button>

        <button
          type="button"
          className="battle-btn battle-btn-outline"
          onClick={onNavigateToDeck}
          disabled={isBattling}
        >
          🛡️ Edit Squad in Deck Builder
        </button>

        <button
          type="button"
          className="battle-btn battle-btn-history"
          onClick={onOpenMatchHistory}
          disabled={isBattling}
          title="View battle match history"
        >
          📜 MATCH HISTORY
        </button>
      </div>

      {/* ── VICTORY / DEFEAT BANNER ── */}
      {battleFinished && battleOutcome && (
        <div className={`battle-outcome-banner outcome-${battleOutcome}`}>
          <div className="outcome-icon">
            {battleOutcome === 'player' ? '🏆' : battleOutcome === 'bot' ? '💀' : '⚖️'}
          </div>
          <div className="outcome-info">
            <h3 className="outcome-title">
              {battleOutcome === 'player'
                ? 'VICTORY ACHIEVED!'
                : battleOutcome === 'bot'
                  ? 'DEFEATED BY ROGUE BOT'
                  : 'BATTLE STALEMATE'}
            </h3>
            <p className="outcome-desc">
              {battleOutcome === 'player'
                ? `Sensational clash! Your shinobi squad overwhelmed ${botName}!`
                : battleOutcome === 'bot'
                  ? `The enemy squad was relentless. Upgrade your cards and try again!`
                  : `An equal clash of chakra! Both squads stood their ground.`}
            </p>
          </div>
          <div className="outcome-action">
            {!rewardClaimed ? (
              <div className="banner-btn-group">
                <button
                  type="button"
                  className="battle-claim-btn"
                  onClick={() => handleClaimRewardAndReturn('deck')}
                >
                  💰 CLAIM REWARD & RETURN
                </button>
                <button
                  type="button"
                  className="battle-details-btn"
                  onClick={() => setIsResultModalOpen(true)}
                  title="View Rewards & Level Details"
                >
                  📜 Rewards Modal
                </button>
              </div>
            ) : (
              <div className="banner-btn-group">
                <span className="reward-claimed-tag">✓ Reward Claimed</span>
                <button
                  type="button"
                  className="battle-details-btn"
                  onClick={() => setIsResultModalOpen(true)}
                  title="View Rewards & Level Details"
                >
                  📜 View Summary
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── SQUAD SHOWDOWN GRID ── */}
      <div className="battle-arena-grid">
        {Array.from({ length: maxSlots }).map((_, slotIdx) => {
          const pCard = playerFilled[slotIdx];
          const bCard = botFilled[slotIdx];
          const result = clashResults[slotIdx];
          const isActive = activeSlot === slotIdx;

          return (
            <div
              key={`slot-clash-${slotIdx}`}
              className={`battle-slot-row ${isActive ? 'active-round' : ''} ${result ? `resolved winner-${result.winner}` : ''}`}
            >
              <div className="slot-round-indicator">
                <span className="round-number">R{slotIdx + 1}</span>
                {result && (
                  <span className={`round-badge badge-${result.winner}`}>
                    {result.winner === 'player' ? 'WIN' : result.winner === 'bot' ? 'LOSS' : 'DRAW'}
                  </span>
                )}
              </div>

              {/* Player Card Slot */}
              <div className={`battle-card-box player-box ${result?.winner === 'player' ? 'winner-card' : ''}`}>
                {pCard ? (
                  <>
                    <div className="battle-card-thumb">
                      <img
                        src={getCardImageSrc(pCard)}
                        alt={pCard.name}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'images/1 shukaku.webp';
                        }}
                      />
                      <span className="card-ovr-chip">{pCard.ovr || 70}</span>
                    </div>
                    <div className="battle-card-meta">
                      <div className="card-name">
                        {pCard.name}
                        {(pCard.plusLevel || 0) > 0 && (
                          <span className="plus-tag">+{pCard.plusLevel}</span>
                        )}
                      </div>
                      <div className="card-jutsu">{pCard.jutsu || 'Special Art'}</div>
                      <div className="card-stats-mini">
                        <span>⚔️ {pCard.atk || pCard.ovr}</span>
                        <span>🛡️ {pCard.def || pCard.ovr}</span>
                        <span>🌀 {pCard.chk || pCard.ovr}</span>
                        <span>💨 {pCard.spd || pCard.ovr}</span>
                      </div>
                    </div>
                    {result && (
                      <div className="round-dmg-popup player-dmg">
                        {result.playerDmg} DMG
                      </div>
                    )}
                  </>
                ) : (
                  <div className="battle-empty-slot">Empty Slot</div>
                )}
              </div>

              {/* Center Clash Icon */}
              <div className="slot-vs-divider">
                {isActive ? (
                  <span className="clash-flash">💥</span>
                ) : result ? (
                  <span className="clash-resolved">⚔️</span>
                ) : (
                  <span className="clash-pending">vs</span>
                )}
              </div>

              {/* BOT Card Slot */}
              <div className={`battle-card-box bot-box ${result?.winner === 'bot' ? 'winner-card' : ''}`}>
                {bCard ? (
                  <>
                    <div className="battle-card-thumb">
                      <img
                        src={getCardImageSrc(bCard)}
                        alt={bCard.name}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'images/1 shukaku.webp';
                        }}
                      />
                      <span className="card-ovr-chip bot-chip">{bCard.ovr || 70}</span>
                    </div>
                    <div className="battle-card-meta">
                      <div className="card-name">
                        {bCard.name}
                        {(bCard.plusLevel || 0) > 0 && (
                          <span className="plus-tag">+{bCard.plusLevel}</span>
                        )}
                      </div>
                      <div className="card-jutsu">{bCard.jutsu || 'Secret Art'}</div>
                      <div className="card-stats-mini">
                        <span>⚔️ {bCard.atk || bCard.ovr}</span>
                        <span>🛡️ {bCard.def || bCard.ovr}</span>
                        <span>🌀 {bCard.chk || bCard.ovr}</span>
                        <span>💨 {bCard.spd || bCard.ovr}</span>
                      </div>
                    </div>
                    {result && (
                      <div className="round-dmg-popup bot-dmg">
                        {result.botDmg} DMG
                      </div>
                    )}
                  </>
                ) : (
                  <div className="battle-empty-slot">Empty Slot</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── BATTLE LOG TERMINAL ── */}
      <div className="battle-log-card">
        <div className="battle-log-header">
          <span className="log-title">📜 Battle Theater & Combat Log</span>
          <span className="log-count">{battleLogs.length} events</span>
        </div>
        <div className="battle-log-content" ref={logEndRef}>
          {battleLogs.map((log, idx) => (
            <div key={`log-${idx}`} className="battle-log-line">
              <span className="log-arrow">›</span> {log}
            </div>
          ))}
        </div>
      </div>
      {/* ── POST-BATTLE REWARD & LEVELING RESULT MODAL ── */}
      {isResultModalOpen && battleFinished && battleOutcome && (() => {
        const currentRewards = calculateBattleRewards(battleOutcome);
        const levelSim = calculateLevelUp(playerLevel, playerExp, currentRewards.exp);
        const nextRequiredExp = levelSim.leveledUp ? levelSim.nextLevelExp : (playerLevel * 500);
        const previewExp = rewardClaimed ? levelSim.newExp : playerExp + currentRewards.exp;
        const previewPct = Math.min(100, Math.max(0, Math.round((previewExp / nextRequiredExp) * 100)));

        return (
          <div className="battle-modal-backdrop" onClick={() => setIsResultModalOpen(false)}>
            <div
              className={`battle-result-modal outcome-${battleOutcome}`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Kanji Background Watermark */}
              <div className="modal-kanji-watermark">
                {battleOutcome === 'player' ? '勝利' : battleOutcome === 'bot' ? '敗北' : '引分'}
              </div>

              {/* Close Cross Button */}
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsResultModalOpen(false)}
                title="Close modal"
              >
                ✕
              </button>

              {/* Outcome Header */}
              <div className="result-modal-header">
                <div className="result-emblem-halo">
                  <span className="result-emblem-icon">
                    {battleOutcome === 'player' ? '🏆' : battleOutcome === 'bot' ? '💀' : '⚖️'}
                  </span>
                </div>
                <h2 className="result-modal-title">
                  {battleOutcome === 'player'
                    ? 'VICTORY ACHIEVED!'
                    : battleOutcome === 'bot'
                      ? 'DEFEAT IN BATTLE'
                      : 'CHAKRA STALEMATE'}
                </h2>
                <p className="result-modal-subtitle">
                  {battleOutcome === 'player'
                    ? `Your shinobi cell overwhelmed ${botName} (${matchScore.playerWins} - ${matchScore.botWins})!`
                    : battleOutcome === 'bot'
                      ? `The rogue shinobi brigade overpowered your squad (${matchScore.botWins} - ${matchScore.playerWins}).`
                      : `An equal clash of jutsu (${matchScore.playerWins} - ${matchScore.botWins})!`}
                </p>
              </div>

              {/* Rewards Section */}
              <div className="result-rewards-section">
                <div className="rewards-section-label">
                  <span>POST-BATTLE REWARDS</span>
                </div>

                <div className="reward-badges-grid">
                  {/* Coins Badge */}
                  <div className="reward-badge-card badge-coins animate-pop-coin">
                    <div className="badge-glow-ring coin-glow" />
                    <div className="badge-icon-box">
                      <svg viewBox="0 0 24 24" fill="#f0c14b" className="badge-svg">
                        <circle cx="12" cy="12" r="10" />
                      </svg>
                    </div>
                    <div className="badge-meta">
                      <span className="badge-value">+{currentRewards.coins.toLocaleString()}</span>
                      <span className="badge-title">Ninja Coins</span>
                    </div>
                  </div>

                  {/* EXP Badge */}
                  <div className="reward-badge-card badge-exp animate-pop-exp">
                    <div className="badge-glow-ring exp-glow" />
                    <div className="badge-icon-box">
                      <svg viewBox="0 0 24 24" fill="#38bdf8" className="badge-svg">
                        <path d="M12 2l4 6-4 14-4-14z" />
                      </svg>
                    </div>
                    <div className="badge-meta">
                      <span className="badge-value">+{currentRewards.exp} EXP</span>
                      <span className="badge-title">Player EXP</span>
                    </div>
                  </div>
                </div>

                {/* Leveling Progression Preview Card */}
                <div className="player-level-card">
                  <div className="level-card-header">
                    <div className="level-status-left">
                      <span className="level-label">SHINOBI LEVEL PROGRESSION</span>
                      <div className="level-tag-big">
                        Lv. <b>{rewardClaimed ? levelSim.newLevel : playerLevel}</b>
                        {!rewardClaimed && levelSim.leveledUp && (
                          <span className="level-up-badge animate-pulse-glow">
                            ➔ Lv.{levelSim.newLevel} (LEVEL UP READY!)
                          </span>
                        )}
                        {rewardClaimed && levelSim.leveledUp && (
                          <span className="level-up-badge animate-pulse-glow">
                            ★ LEVEL UP!
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="level-status-right">
                      <span className="exp-progress-numbers">
                        {previewExp} / {nextRequiredExp} EXP
                      </span>
                    </div>
                  </div>

                  <div className="level-bar-track">
                    <div
                      className="level-bar-fill animate-exp-bar"
                      style={{ width: `${previewPct}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="result-modal-actions">
                <button
                  type="button"
                  className="modal-btn-claim-return"
                  onClick={() => handleClaimRewardAndReturn('deck')}
                >
                  <span className="btn-icon">💰</span>
                  <span>CLAIM REWARD & RETURN</span>
                </button>

                <button
                  type="button"
                  className="modal-btn-return-home"
                  onClick={() => handleClaimRewardAndReturn('home')}
                >
                  <span>🏠 Return to Home</span>
                </button>

                <button
                  type="button"
                  className="modal-btn-rematch"
                  onClick={() => {
                    handleClaimOnly();
                    handleResetBattle();
                  }}
                >
                  <span>🔁 Rematch</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </section>
  );
}
