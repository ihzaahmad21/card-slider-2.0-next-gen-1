import React, { useState } from 'react';
import { DECK_SIZE, calculateDeckStats } from '../utils/deck.js';
import { getActiveSynergies, getTotalSynergyBonus } from '../config/squadSynergy.js';
import { getCardImageSrc, RARITY_LABELS, getBaseCharacterName } from '../utils/cards.js';
import { validateSquad, MIN_SQUAD_SIZE } from '../utils/battle.js';
import './DeckView.css';

export default function DeckView({
  inventory = [],
  presets = [],
  activePresetId = 'preset-1',
  onSelectPreset,
  deck = [],
  onToggleDeckCard,
  onSelectCard,
  showToast,
  onConfirmSquad
}) {
  const [feedback, setFeedback] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('ovr'); // 'ovr' | 'character' | 'name' | 'level'


  // Available Shinobi:
  // 1. Filter out items currently in the active deck
  const unselectedItems = inventory.filter(item => !deck.includes(item.instanceId));

  // 2. Group by card.id and pick only the single instance with highest plusLevel (and highest OVR if tied)
  const bestInstancesByCardId = new Map();
  for (const item of unselectedItems) {
    const existing = bestInstancesByCardId.get(item.id);
    if (!existing) {
      bestInstancesByCardId.set(item.id, item);
    } else {
      const itemPlus = item.plusLevel || 0;
      const existingPlus = existing.plusLevel || 0;
      if (
        itemPlus > existingPlus ||
        (itemPlus === existingPlus && (item.ovr || 0) > (existing.ovr || 0))
      ) {
        bestInstancesByCardId.set(item.id, item);
      }
    }
  }

  // 3. Filter by search term (searches card name, base character, rarity, jutsu)
  let filteredAvailable = Array.from(bestInstancesByCardId.values());
  if (searchTerm.trim()) {
    const q = searchTerm.trim().toLowerCase();
    filteredAvailable = filteredAvailable.filter(item => {
      const name = (item.name || '').toLowerCase();
      const baseName = getBaseCharacterName(item.name).toLowerCase();
      const rarity = (item.rarityClass || '').toLowerCase();
      const jutsu = (item.jutsu || '').toLowerCase();
      return name.includes(q) || baseName.includes(q) || rarity.includes(q) || jutsu.includes(q);
    });
  }

  // 4. Sort Available Shinobi based on selected sort option
  const availableShinobi = [...filteredAvailable].sort((a, b) => {
    if (sortBy === 'character') {
      const baseA = getBaseCharacterName(a.name).toLowerCase();
      const baseB = getBaseCharacterName(b.name).toLowerCase();
      const nameComp = baseA.localeCompare(baseB);
      if (nameComp !== 0) return nameComp;
      // In same base character group, highest OVR first
      return (b.ovr || 0) - (a.ovr || 0);
    }

    if (sortBy === 'name') {
      return (a.name || '').localeCompare(b.name || '');
    }

    if (sortBy === 'level') {
      const levelDiff = (b.plusLevel || 0) - (a.plusLevel || 0);
      if (levelDiff !== 0) return levelDiff;
      return (b.ovr || 0) - (a.ovr || 0);
    }

    // Default: 'ovr' (highest OVR first)
    return (b.ovr || 0) - (a.ovr || 0);
  });

  // Resolved deck cards (in order)
  const { avgOvr, deckCards } = calculateDeckStats(deck, inventory);
  // selectedSquad contains the active equipped cards
  const selectedSquad = deckCards.filter(Boolean);

  // Squad Synergy calculations based on active deck cards
  const deckCardIds = selectedSquad.map(c => c.id);
  const activeSynergies = getActiveSynergies(deckCardIds);
  const synergyBonus = getTotalSynergyBonus(deckCardIds);
  const hasSynergy = activeSynergies.length > 0;

  const displayFeedback = (message, type = 'success') => {
    setFeedback({ message, type });
    if (showToast) {
      showToast(message);
    }
    setTimeout(() => {
      setFeedback(prev => (prev?.message === message ? null : prev));
    }, 3500);
  };

  // Handle adding card from Available Shinobi to squad
  const handleAddShinobi = (item) => {
    if (deck.length >= DECK_SIZE) {
      displayFeedback('Squad is already full (6/6)! Click a shinobi in the squad to remove first.', 'warning');
      return;
    }

    // Rule: Hanya boleh 1 kartu per karakter dasar dalam 1 squad
    const cardBaseName = getBaseCharacterName(item.name);
    const duplicateInSquad = deckCards.find(
      c => c && getBaseCharacterName(c.name).toLowerCase() === cardBaseName.toLowerCase()
    );

    if (duplicateInSquad) {
      displayFeedback(
        `${cardBaseName} sudah ada di squad (${duplicateInSquad.name}). Lepas dulu variasi tersebut sebelum menambahkan versi ini.`,
        'warning'
      );
      return;
    }

    onToggleDeckCard(item.instanceId);
  };

  // Handle removing card from squad slot
  const handleRemoveFromSquad = (instanceId) => {
    onToggleDeckCard(instanceId);
  };

  // Handle Confirm Squad button click
  const handleConfirmSquad = () => {
    const validation = validateSquad(selectedSquad);
    if (!validation.valid) {
      displayFeedback(validation.message, 'warning');
      return;
    }

    displayFeedback(`⚡ Squad Confirmed! (${selectedSquad.length} Shinobi, Avg OVR: ${avgOvr}). Entering Battle Arena...`, 'success');
    if (onConfirmSquad) {
      onConfirmSquad(selectedSquad, avgOvr);
    }
  };

  return (
    <section className="view active deck-builder-view" id="view-deck">
      <div className="deck-builder-layout">
        
        {/* ── LEFT PANEL: Available Shinobi (Roster) ── */}
        <div className="deck-panel">
          <div className="deck-roster-header">
            <div>
              <span className="deck-panel-subtitle">Roster</span>
              <h2 className="deck-panel-title">Available Shinobi</h2>
            </div>
            <span className="deck-roster-count">{availableShinobi.length} Available</span>
          </div>

          {/* Search Box and Sort Controls */}
          <div className="deck-controls-row">
            <div className="deck-search-box">
              <span className="deck-search-icon">🔍</span>
              <input
                type="text"
                className="deck-search-input"
                placeholder="Search shinobi name, clan, jutsu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  type="button"
                  className="deck-search-clear"
                  onClick={() => setSearchTerm('')}
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="deck-sort-group">
              <span className="deck-sort-label">Sort:</span>
              <select
                className="deck-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort Available Shinobi"
              >
                <option value="ovr">⚡ Highest OVR</option>
                <option value="character">👤 By Character</option>
                <option value="name">🔤 Name (A-Z)</option>
                <option value="level">⚔️ Plus Level</option>
              </select>
            </div>
          </div>

          <div className="deck-card-list">
            {availableShinobi.length === 0 ? (
              <div className="deck-empty-state">
                {searchTerm.trim() ? (
                  `No shinobi found matching "${searchTerm}".`
                ) : inventory.length === 0 ? (
                  'Your inventory is empty. Roll in Gacha to recruit shinobi!'
                ) : (
                  'All available Shinobi are deployed in your squad.'
                )}
              </div>
            ) : (
              availableShinobi.map(item => {
                const rarityLabel = RARITY_LABELS[item.rarityClass] || (item.rarityClass ? item.rarityClass.toUpperCase() : 'BRONZE');
                const starsCount = item.stars || 1;
                const starsStr = '★'.repeat(starsCount);

                return (
                  <div
                    key={item.instanceId}
                    className="deck-mini-card"
                    onClick={() => handleAddShinobi(item)}
                    title={`Click to deploy ${item.name} to squad`}
                  >
                    <div className="thumb">
                      <img
                        src={getCardImageSrc(item)}
                        alt={item.name}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'images/1 shukaku.webp';
                        }}
                      />
                    </div>
                    <div className="info">
                      <div className="name">
                        {item.name}
                        {(item.plusLevel || 0) > 0 && (
                          <span style={{ color: '#00d2d3', marginLeft: '5px', fontSize: '0.7rem', fontWeight: '800' }}>
                            +{item.plusLevel}
                          </span>
                        )}
                      </div>
                      <div className="sub">
                        <span>{rarityLabel}</span>
                        <span>·</span>
                        <span style={{ color: '#fbbf24' }}>{starsStr}</span>
                      </div>
                    </div>
                    <div className="ovr-badge">{item.ovr || 70}</div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── RIGHT PANEL: Current Squad (Formation) ── */}
        <div className="deck-panel">
          <div className="deck-squad-header">
            <div>
              <span className="deck-panel-subtitle">Formation</span>
              <h2 className="deck-panel-title">Current Squad</h2>
            </div>
            <div className="deck-stat-summary">
              <div className="label">Avg OVR</div>
              <div className="value">{avgOvr}</div>
            </div>
          </div>

          {/* Squad Preset Tabs */}
          {presets && presets.length > 0 && (
            <div className="deck-preset-bar">
              <span className="deck-preset-title">Squad Presets:</span>
              <div className="deck-preset-tabs">
                {presets.map((preset, idx) => {
                  const isActive = preset.id === activePresetId;
                  const count = (preset.deck || []).length;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      className={`deck-preset-tab ${isActive ? 'active' : ''}`}
                      onClick={() => onSelectPreset && onSelectPreset(preset.id)}
                      title={`Switch to ${preset.name}`}
                    >
                      <span className="preset-idx">P{idx + 1}</span>
                      <span className="preset-name">{preset.name}</span>
                      <span className={`preset-badge ${count === DECK_SIZE ? 'full' : ''}`}>
                        {count}/{DECK_SIZE}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 6-Slot Grid (3 columns x 2 rows) */}
          <div className="deck-slot-grid">
            {Array.from({ length: DECK_SIZE }).map((_, idx) => {
              const card = deckCards[idx];

              if (card) {
                return (
                  <div
                    key={card.instanceId || idx}
                    className="deck-slot filled"
                    onClick={() => handleRemoveFromSquad(card.instanceId)}
                    title={`Click to remove ${card.name} from squad`}
                  >
                    <div className="render-bg" />
                    <img
                      src={getCardImageSrc(card)}
                      alt={card.name}
                      className="render-art"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'images/1 shukaku.webp';
                      }}
                    />
                    <div className="ovr-chip">
                      {card.ovr || 70}
                      {(card.plusLevel || 0) > 0 && (
                        <span style={{ color: '#00d2d3', marginLeft: '3px', fontSize: '0.58rem', fontWeight: '800' }}>
                          +{card.plusLevel}
                        </span>
                      )}
                    </div>
                    <div className="slot-remove-hint" title="Remove from squad">✕</div>
                    <div className="fill-name">
                      {card.name}
                      {(card.plusLevel || 0) > 0 ? ` +${card.plusLevel}` : ''}
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={`empty-${idx}`}
                  className="deck-slot empty-slot"
                  onClick={() => {
                    const firstValid = availableShinobi.find(item => {
                      const baseName = getBaseCharacterName(item.name).toLowerCase();
                      return !deckCards.some(c => c && getBaseCharacterName(c.name).toLowerCase() === baseName);
                    });
                    if (firstValid) {
                      handleAddShinobi(firstValid);
                    } else if (availableShinobi.length > 0) {
                      handleAddShinobi(availableShinobi[0]);
                    }
                  }}
                  title="Click a shinobi from the roster on the left to deploy here"
                >
                  {/* Subtle Humanoid Ninja Silhouette Background */}
                  <div className="slot-silhouette-bg" aria-hidden="true">
                    <svg viewBox="0 0 100 130" fill="currentColor">
                      {/* Stylized ninja/shinobi silhouette with headband ribbon & collar */}
                      <path d="M50 12 C41 12 34 19 34 28 C34 35 38 41 44 43 C33 46 22 55 20 68 L17 84 C16 88 19 92 23 92 L28 92 L28 122 C28 126 31 128 35 128 L43 128 L43 96 L57 96 L57 128 L65 128 C69 128 72 126 72 122 L72 92 L77 92 C81 92 84 88 83 84 L80 68 C78 55 67 46 56 43 C62 41 66 35 66 28 C66 19 59 12 50 12 Z M39 23 L61 23 C62 23 62 25 61 26 L39 26 C38 26 38 23 39 23 Z" />
                    </svg>
                  </div>
                  <div className="slot-icon">+</div>
                  <span className="slot-label">Slot {idx + 1}</span>
                </div>
              );
            })}
          </div>

          {/* Squad Synergy Box */}
          <div className={`deck-synergy-box ${hasSynergy ? 'active' : 'inactive'}`}>
            <div className="deck-synergy-title">
              <span>⚡ Squad synergy</span>
              {hasSynergy && (
                <div className="deck-synergy-bonuses">
                  {synergyBonus.atk > 0 && <span style={{ color: '#f87171' }}>+{synergyBonus.atk} ATK</span>}
                  {synergyBonus.def > 0 && <span style={{ color: '#60a5fa' }}>+{synergyBonus.def} DEF</span>}
                  {synergyBonus.chk > 0 && <span style={{ color: '#c084fc' }}>+{synergyBonus.chk} CHK</span>}
                </div>
              )}
            </div>
            <div className="deck-synergy-desc">
              {hasSynergy ? (
                activeSynergies.map(s => `${s.label} (+${s.bonus.atk} ATK / +${s.bonus.def} DEF / +${s.bonus.chk} CHK to all cards)`).join(' | ')
              ) : (
                'No active synergy — complete a squad for bonus stats'
              )}
            </div>
          </div>

          {/* Confirm Squad Button */}
          <button
            type="button"
            className={`deck-confirm-btn ${selectedSquad.length >= MIN_SQUAD_SIZE ? 'ready' : ''}`}
            onClick={handleConfirmSquad}
          >
            ⚔️ Confirm Squad ({selectedSquad.length}/{DECK_SIZE})
          </button>

          {/* Feedback notification banner */}
          {feedback && (
            <div className={`deck-banner-feedback deck-banner-${feedback.type}`}>
              {feedback.message}
            </div>
          )}
        </div>

      </div>
    </section>
  );
}

