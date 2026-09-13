import React, { useState, useMemo, useCallback } from 'react';
import { getCardImageSrc } from '../utils/cards.js';
import './CardFusionModal.css';

// ─── Constants ──────────────────────────────────────────────────────────────
const MAX_ENHANCEMENT = 10;
const STAT_BOOST_PER_LEVEL = 0.03; // +3% per enhancement level
const RARITIES = ['all', 'mythic', 'diamond', 'gold', 'silver', 'bronze'];

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Calculate boosted stats for a card at a target enhancement level */
function calcBoostedStats(card, targetLevel) {
  if (!card) return null;
  const boost = 1 + STAT_BOOST_PER_LEVEL * targetLevel;
  return {
    atk: Math.min(110, Math.round((card.atk || 50) * boost)),
    def: Math.min(110, Math.round((card.def || 50) * boost)),
    spd: Math.min(110, Math.round((card.spd || 50) * boost)),
    chk: Math.min(110, Math.round((card.chk || 50) * boost)),
    ovr: Math.min(110, Math.round((card.ovr || 70) * boost))
  };
}

/** Are two inventory cards the same base character (same master id) */
function isSameBaseCard(a, b) {
  if (!a || !b) return false;
  return String(a.id) === String(b.id);
}

// ─── Sub-component: Card Slot ─────────────────────────────────────────────────
function FusionSlot({ card, label, onOpen, onRemove, isFusing }) {
  const rarityClass = card?.rarityClass || 'bronze';
  return (
    <div className="cfm-slot-group">
      <span className="cfm-slot-label">{label}</span>
      <div
        className={`cfm-slot ${card ? `has-card rarity-${rarityClass}` : ''}`}
        onClick={!card && !isFusing ? onOpen : undefined}
        title={card ? card.name : 'Click to select a card'}
      >
        {card ? (
          <>
            <img
              className="cfm-slot-img"
              src={getCardImageSrc(card)}
              alt={card.name}
              onError={(e) => { e.currentTarget.src = getCardImageSrc({ image_url: 'images/naruto chunin.webp' }); }}
            />
            <div className="cfm-slot-info">
              <div className="cfm-slot-name">{card.name}</div>
              <div className="cfm-slot-ovr">{card.ovr} OVR · Enh.{card.enhancementLevel || 0}</div>
            </div>
            {!isFusing && (
              <button
                className="cfm-slot-remove"
                onClick={(e) => { e.stopPropagation(); onRemove(); }}
                title="Remove"
              >✕</button>
            )}
          </>
        ) : (
          <>
            <span className="cfm-slot-empty-icon">⊕</span>
            <span className="cfm-slot-empty-text">Click to<br />select card</span>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Sub-component: Card Picker bottom sheet ──────────────────────────────────
function CardPicker({ inventory, excludeInstanceId, identicalToId, onSelect, onClose }) {
  const [search, setSearch] = useState('');
  const [rarityFilter, setRarityFilter] = useState('all');

  const filtered = useMemo(() => {
    return inventory.filter(c => {
      if (c.instanceId === excludeInstanceId) return false;
      const name = (c.name || '').toLowerCase();
      if (search && !name.includes(search.toLowerCase())) return false;
      if (rarityFilter !== 'all' && c.rarityClass !== rarityFilter) return false;
      return true;
    });
  }, [inventory, excludeInstanceId, search, rarityFilter]);

  return (
    <div className="cfm-picker-backdrop" onClick={onClose}>
      <div className="cfm-picker-panel" onClick={e => e.stopPropagation()}>
        <div className="cfm-picker-header">
          <span className="cfm-picker-title">⚡ SELECT SHINOBI</span>
          <button className="cfm-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="cfm-picker-search-wrap">
          <input
            className="cfm-picker-search"
            type="text"
            placeholder="Search by name…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
          />
        </div>

        <div className="cfm-picker-filter-row">
          {RARITIES.map(r => (
            <button
              key={r}
              className={`cfm-rarity-chip ${rarityFilter === r ? 'active' : ''}`}
              onClick={() => setRarityFilter(r)}
            >
              {r === 'all' ? 'All' : r}
            </button>
          ))}
        </div>

        <div className="cfm-picker-grid">
          {filtered.length === 0 && (
            <div className="cfm-picker-empty">No cards found.</div>
          )}
          {filtered.map(card => {
            const isIdentical = identicalToId && String(card.id) === String(identicalToId);
            return (
              <div
                key={card.instanceId || card.id}
                className={`cfm-picker-item ${isIdentical ? 'is-identical' : ''}`}
                onClick={() => { onSelect(card); onClose(); }}
                title={card.name}
              >
                <img
                  src={getCardImageSrc(card)}
                  alt={card.name}
                  onError={(e) => { e.currentTarget.src = getCardImageSrc({ image_url: 'images/naruto chunin.webp' }); }}
                />
                <div className="cfm-picker-item-info">
                  <div className="cfm-picker-item-name">{card.name}</div>
                  <div className="cfm-picker-item-ovr">{card.ovr} OVR</div>
                  {(card.enhancementLevel || 0) > 0 && (
                    <div className="cfm-picker-item-badge">Enh.{card.enhancementLevel}</div>
                  )}
                  {isIdentical && (
                    <div className="cfm-picker-item-badge">✓ IDENTICAL</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CardFusionModal({ isOpen, onClose, inventory, onFuse, showToast }) {
  const [slotA, setSlotA] = useState(null); // main card (will be enhanced)
  const [slotB, setSlotB] = useState(null); // sacrifice card (will be consumed)
  const [pickerFor, setPickerFor] = useState(null); // 'A' | 'B' | null
  const [isFusing, setIsFusing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // ── Reset on close ──
  const handleClose = useCallback(() => {
    if (isFusing) return;
    setSlotA(null);
    setSlotB(null);
    setPickerFor(null);
    setShowSuccess(false);
    onClose();
  }, [isFusing, onClose]);

  // ── Fusion compatibility check ──
  const isIdenticalPair = slotA && slotB && isSameBaseCard(slotA, slotB);
  const isDifferentInstance = slotA && slotB && slotA.instanceId !== slotB.instanceId;
  const canFuse = isIdenticalPair && isDifferentInstance;
  const currentLevel = slotA ? (slotA.enhancementLevel || 0) : 0;
  const isMaxed = currentLevel >= MAX_ENHANCEMENT;

  // ── Preview output stats ──
  const outputLevel = currentLevel + 1;
  const baseStats = slotA ? {
    atk: slotA.atk || 50,
    def: slotA.def || 50,
    spd: slotA.spd || 50,
    chk: slotA.chk || 50,
    ovr: slotA.ovr || 70
  } : null;
  const boostedStats = slotA ? calcBoostedStats(slotA, outputLevel) : null;

  // ── Handle Fuse ──
  const handleFuse = useCallback(async () => {
    if (!canFuse || isFusing || isMaxed) return;

    setIsFusing(true);
    // Animate for 1.4s
    await new Promise(r => setTimeout(r, 1400));

    // Call parent handler — returns true on success
    const success = onFuse(slotA, slotB);

    if (success !== false) {
      setShowSuccess(true);
      if (showToast) showToast(`⚡ FUSION SUCCESS! ${slotA.name} → Enhancement Lv.${outputLevel}!`);
      await new Promise(r => setTimeout(r, 1000));
      // Clear slots after success
      setSlotA(null);
      setSlotB(null);
      setShowSuccess(false);
    }

    setIsFusing(false);
  }, [canFuse, isFusing, isMaxed, onFuse, slotA, slotB, outputLevel, showToast]);

  if (!isOpen) return null;

  const STAT_KEYS = ['ATK', 'DEF', 'SPD', 'CHK'];
  const STAT_FIELDS = { ATK: 'atk', DEF: 'def', SPD: 'spd', CHK: 'chk' };

  return (
    <div className="cfm-backdrop" onClick={handleClose} role="dialog" aria-modal="true">
      <div className="cfm-modal" onClick={e => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className="cfm-header">
          <div className="cfm-header-left">
            <span className="cfm-header-icon">⚗️</span>
            <div>
              <h2 className="cfm-title">FUSION LAB</h2>
              <span className="cfm-subtitle">Combine identical shinobi to enhance their power</span>
            </div>
          </div>
          <button className="cfm-close-btn" onClick={handleClose} aria-label="Close">✕</button>
        </div>

        {/* ── Body ── */}
        <div className="cfm-body">

          {/* How-to hint */}
          <div className="cfm-how-to">
            <span className="cfm-how-to-icon">💡</span>
            <div>
              Select <strong>2 identical cards</strong> (same character, different copies).
              The <strong>Sacrifice Card</strong> is consumed and the <strong>Main Card</strong> gains
              <strong> +3% to all stats</strong> per Enhancement Level (max <strong>Lv.{MAX_ENHANCEMENT}</strong>).
            </div>
          </div>

          {/* ── Fusion Workbench ── */}
          <div className="cfm-workbench">

            {/* Slot A — Main Card */}
            <FusionSlot
              label="⚔️ MAIN CARD"
              card={slotA}
              onOpen={() => setPickerFor('A')}
              onRemove={() => setSlotA(null)}
              isFusing={isFusing}
            />

            {/* Center connector */}
            <div className="cfm-center-connector">
              <span className="cfm-plus-sign">+</span>
              {isFusing
                ? <div className="cfm-fusing-ring" />
                : <span className="cfm-arrow-down">▼</span>
              }
            </div>

            {/* Slot B — Sacrifice Card */}
            <FusionSlot
              label="💀 SACRIFICE"
              card={slotB}
              onOpen={() => setPickerFor('B')}
              onRemove={() => setSlotB(null)}
              isFusing={isFusing}
            />
          </div>

          {/* ── Output Preview ── */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div className="cfm-output-section">
              <span className="cfm-output-label">✦ FUSION RESULT</span>
              <div className={`cfm-output-slot ${canFuse && !isFusing ? 'ready' : ''} ${isFusing ? 'fusing' : ''}`}>
                {isFusing ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <div className="cfm-fusing-ring" />
                    <span style={{ fontSize: '0.65rem', color: '#8b5cf6', marginTop: 4 }}>FUSING…</span>
                  </div>
                ) : slotA && canFuse ? (
                  <>
                    {showSuccess && (
                      <div className="cfm-success-overlay">
                        <span className="cfm-success-burst">✦</span>
                        <span className="cfm-success-text">ENHANCED!</span>
                      </div>
                    )}
                    <span className="cfm-enhancement-badge">Enh.{outputLevel}</span>
                    <img
                      className="cfm-output-img"
                      src={getCardImageSrc(slotA)}
                      alt={slotA.name}
                      onError={(e) => { e.currentTarget.src = getCardImageSrc({ image_url: 'images/naruto chunin.webp' }); }}
                    />
                    <div className="cfm-output-info">
                      <div className="cfm-output-name">{slotA.name}</div>
                      <div className="cfm-output-level">
                        {boostedStats?.ovr} OVR · Enhancement Lv.{outputLevel}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="cfm-output-empty-icon">⚗️</span>
                    <span className="cfm-output-empty-text">
                      {!slotA && !slotB ? 'Select cards to preview' :
                       !canFuse ? 'Cards must be identical' : 'Ready to fuse!'}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ── Compatibility Banner ── */}
          {slotA && slotB && (
            canFuse
              ? <div className="cfm-compat-ok">
                  ✅ <strong>Fusion Ready!</strong> Both cards are identical — {slotA.name} will reach Enhancement Lv.{outputLevel}.
                </div>
              : <div className="cfm-compat-warning">
                  ⚠️ Cards must be the <strong>same character</strong> (different copies). Please select matching shinobi.
                </div>
          )}

          {/* ── Max Level Warning ── */}
          {isMaxed && slotA && (
            <div className="cfm-max-notice">
              🌟 <strong>{slotA.name}</strong> is already at MAX Enhancement Level {MAX_ENHANCEMENT}. No further fusion possible.
            </div>
          )}

          {/* ── Stat Comparison Panel ── */}
          {slotA && canFuse && boostedStats && baseStats && (
            <div className="cfm-stat-panel">
              <div className="cfm-stat-panel-title">📊 STAT PREVIEW — After Fusion</div>
              <div className="cfm-stat-rows">
                {STAT_KEYS.map(key => {
                  const field = STAT_FIELDS[key];
                  const before = baseStats[field];
                  const after = boostedStats[field];
                  const delta = after - before;
                  const pct = Math.min(100, Math.round((after / 110) * 100));
                  return (
                    <div key={key} className="cfm-stat-row">
                      <span className="cfm-stat-key">{key}</span>
                      <div className="cfm-stat-bar-track">
                        <div
                          className={`cfm-stat-bar-fill ${delta > 0 ? 'boosted' : ''}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className={`cfm-stat-val ${delta > 0 ? 'boosted' : ''}`}>
                        {after}
                        {delta > 0 && <span className="cfm-stat-delta"> +{delta}</span>}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Enhancement track (pip indicators) */}
              <div className="cfm-enhancement-track">
                <span className="cfm-enh-track-label">ENH LEVEL:</span>
                {Array.from({ length: MAX_ENHANCEMENT }, (_, i) => {
                  const level = i + 1;
                  const isFilled = level <= currentLevel;
                  const isPreview = level === outputLevel && !isFilled;
                  const isMax = isFilled && currentLevel === MAX_ENHANCEMENT;
                  return (
                    <div
                      key={level}
                      className={`cfm-enh-pip ${isMax ? 'max' : isFilled ? 'filled' : isPreview ? 'preview' : ''}`}
                      title={`Level ${level}`}
                    />
                  );
                })}
                <span style={{ fontSize: '0.6rem', color: '#6d5a90', marginLeft: 4 }}>
                  {currentLevel}/{MAX_ENHANCEMENT}
                </span>
              </div>
            </div>
          )}

          {/* ── FUSE Button ── */}
          <div className="cfm-fuse-btn-wrap">
            <button
              id="cfm-fuse-btn"
              className={`cfm-fuse-btn ${isFusing ? 'fusing' : ''}`}
              onClick={handleFuse}
              disabled={!canFuse || isMaxed || isFusing}
            >
              {isFusing ? (
                <>
                  <div className="cfm-fusing-ring" style={{ width: 18, height: 18, borderWidth: 2 }} />
                  FUSING…
                </>
              ) : (
                <>⚗️ FUSE SHINOBI</>
              )}
            </button>
          </div>

        </div>{/* end body */}
      </div>{/* end modal */}

      {/* ── Card Picker Sheet ── */}
      {pickerFor && (
        <CardPicker
          inventory={inventory}
          excludeInstanceId={pickerFor === 'A' ? slotB?.instanceId : slotA?.instanceId}
          identicalToId={pickerFor === 'A' ? slotB?.id : slotA?.id}
          onSelect={(card) => {
            if (pickerFor === 'A') setSlotA(card);
            else setSlotB(card);
            setPickerFor(null);
          }}
          onClose={() => setPickerFor(null)}
        />
      )}
    </div>
  );
}
