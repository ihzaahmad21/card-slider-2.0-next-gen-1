import React, { useEffect, useState, useRef } from 'react';
import useEscapeKey from '../hooks/useEscapeKey.js';
import { getSummonDetails } from '../utils/cardData.js';
import { ELEMENT_META, getCharacterMeta } from '../utils/characterMeta.js';
import { createBackdropClickHandler } from '../utils/modal.js';
import {
  MAX_PLUS_LEVEL,
  RARITY_LABELS,
  buildHdImagePath,
  getCardImageSrc,
  getCardKey,
  getRarityClass,
  getSellValue,
  getStarString,
  getUpgradeCost,
  isSameCardInstance,
  getAttributeColorClass,
  getJutsuDetails,
  calculateChakraCost
} from '../utils/cards.js';
import './Storm4Modal.css';

export default function Storm4Modal({
  card,
  onClose,
  inventory,
  coins,
  onUpgrade,
  onSell
}) {
  const [imgSrc, setImgSrc] = useState(() => card ? buildHdImagePath(card.img) : '');
  const [imgLoaded, setImgLoaded] = useState(false);
  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  const [activeSummon, setActiveSummon] = useState(null);

  const inventoryEntry = (inventory && card.instanceId)
    ? inventory.find(item => item.instanceId === card.instanceId)
    : null;
  const currentStars = inventoryEntry ? inventoryEntry.stars : card.stars;
  const currentOvr = inventoryEntry ? inventoryEntry.ovr : card.ovr;
  const currentAtk = inventoryEntry ? inventoryEntry.atk : card.atk;
  const currentDef = inventoryEntry ? inventoryEntry.def : card.def;
  const currentChk = inventoryEntry ? inventoryEntry.chk : card.chk;
  const currentSpd = inventoryEntry ? inventoryEntry.spd : card.spd;
  const currentPlusLevel = inventoryEntry ? (inventoryEntry.plusLevel || 0) : 0;

  const targetCard = inventoryEntry || card;
  const upgradeCost = getUpgradeCost(currentPlusLevel);
  const sellValue = getSellValue(targetCard);
  const rarityClass = getRarityClass(targetCard);
  const isOwned = Boolean(inventoryEntry);

  const availableMaterials = inventory ? inventory.filter(item => {
    if (item.id !== card.id) return false;
    // Don't use the exact same instance as the main card
    if (item.instanceId === (inventoryEntry?.instanceId || card.instanceId)) return false;
    // Don't use a stronger (higher +level) card as fodder — it would be wasted
    if ((item.plusLevel || 0) > currentPlusLevel) return false;
    return true;
  }) : [];
  const selectedMaterial = availableMaterials.find(item => item.instanceId === selectedMaterialId) || null;

  // Reset image state whenever the selected card changes
  const prevImgKeyRef = useRef(null);

  useEffect(() => {
    if (!card) return;
    const newSrc = buildHdImagePath(card.img);
    if (prevImgKeyRef.current !== newSrc) {
      prevImgKeyRef.current = newSrc;
      setImgSrc(newSrc);
      setImgLoaded(false);
    }
  }, [card]);

  useEscapeKey(onClose);

  useEffect(() => {
    if (availableMaterials.length > 0) {
      if (!selectedMaterialId || !availableMaterials.some(item => item.instanceId === selectedMaterialId)) {
        setSelectedMaterialId(availableMaterials[0].instanceId);
      }
    } else {
      setSelectedMaterialId('');
    }
  }, [availableMaterials, selectedMaterialId]);

  const starStr = getStarString(currentStars);

  // Resolve jutsu items automatically via getJutsuDetails
  const resolvedJutsuList = (() => {
    // 1. Array of jutsu IDs in equippedJutsu
    const equipped = targetCard.equippedJutsu || card.equippedJutsu;
    if (Array.isArray(equipped) && equipped.length > 0) {
      return equipped.map(jId => getJutsuDetails(jId));
    }
    // 2. Jutsu property as array
    const rawJutsu = targetCard.jutsu || card.jutsu;
    if (Array.isArray(rawJutsu) && rawJutsu.length > 0) {
      return rawJutsu.map(item => getJutsuDetails(item));
    }
    // 3. Legacy string jutsu
    if (typeof rawJutsu === 'string' && rawJutsu.trim()) {
      return rawJutsu
        .split(/\s*\/\s*/)
        .filter(Boolean)
        .map(jName => getJutsuDetails(jName));
    }
    return [getJutsuDetails('Secret Ninja Art')];
  })();

  const handleBackdropClick = createBackdropClickHandler(onClose, { stopPropagation: true });

  const handleCloseClick = (e) => {
    e.stopPropagation();
    onClose();
  };

  // HD fallback: if HD png fails to load, fall back to original grid .webp
  const handleImageError = (e) => {
    e.target.onerror = null;
    setImgSrc(getCardImageSrc(card));
  };

  return (
    <div className="storm4-modal-overlay" onClick={handleBackdropClick}>
      <div className={`storm4-split-container storm4-rarity-${rarityClass}`}>

        {/* ── LEFT COLUMN: Full-body HD Character Showcase ── */}
        <div className="storm4-left-col">
          {/* Atmospheric rarity glow background */}
          <div className={`storm4-artwork-bg storm4-bg-${rarityClass}`} />

          {/* Loading shimmer until HD image is ready */}
          {!imgLoaded && <div className="storm4-img-shimmer" />}

          <img
            key={imgSrc}
            src={imgSrc}
            alt={card.name}
            className={`storm4-hd-img${imgLoaded ? ' storm4-img-visible' : ''}`}
            onLoad={() => setImgLoaded(true)}
            onError={handleImageError}
          />

          {/* Rarity watermark badge (kept in DOM for test suite compatibility, hidden visually via CSS) */}
          <div className={`storm4-rarity-watermark storm4-rw-${rarityClass}`}>
            {RARITY_LABELS[rarityClass] || 'BRONZE'}
          </div>
        </div>

        {/* ── RIGHT COLUMN: Stats & Control Panel ── */}
        <div className="storm4-right-col">

          {/* Top: Logo + Close Button */}
          <div className="storm4-right-header">
            <span className="storm4-logo-text">⚡ STORM 4</span>
            <button className="storm4-close-btn" onClick={handleCloseClick} title="Close (ESC)">✕</button>
          </div>

          {/* Character Name + OVR Badge */}
          <div className="storm4-name-row">
            <h2 className="storm4-card-name">
              {card.name}
              {currentPlusLevel > 0 && (
                <span className={`storm4-plus-badge ${currentPlusLevel >= MAX_PLUS_LEVEL ? 'storm4-plus-max' : ''}`}>+{currentPlusLevel}</span>
              )}
            </h2>
            <div className={`storm4-ovr-badge storm4-ovr-${rarityClass}`}>
              <span className="storm4-ovr-num">{currentOvr}</span>
              <span className="storm4-ovr-label">OVR</span>
            </div>
          </div>

          {/* Star Rating & Element Row */}
          <div className="storm4-stars-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            <span className={`storm4-stars storm4-stars-${rarityClass}`}>
              {starStr}
            </span>
            {(() => {
              const cardElement = targetCard.element || (targetCard.id ? getCharacterMeta(targetCard.id)?.element : null) || 'neutral';
              const elemMeta = ELEMENT_META[cardElement];
              if (!elemMeta) return null;
              return (
                <span
                  className={`card-element-pill element-pill-${cardElement}`}
                  style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '6px', fontWeight: 600 }}
                  title={`Chakra Nature: ${elemMeta.label}`}
                >
                  {elemMeta.symbol} {elemMeta.label}
                </span>
              );
            })()}
          </div>

          {/* Info Box Jutsu/Summon (separated clearly) */}
          <div className="storm4-info-boxes">
            <div className="storm4-info-box storm4-jutsu-box">
              <div className="storm4-jutsu-header">
                <span className="storm4-info-label">JUTSU</span>
                {(targetCard.awakeningId || card.awakeningId) && (
                  <span className="storm4-awakening-tag" title={`Awakening ID: ${targetCard.awakeningId || card.awakeningId}`}>
                    ⚡ AWAKENED
                  </span>
                )}
              </div>
              <div className="storm4-jutsu-list">
                {resolvedJutsuList.map((jutsu, idx) => {
                  const chkCost = calculateChakraCost(jutsu.baseChakraCost, currentChk);
                  return (
                    <div className="storm4-jutsu-item" key={jutsu.id || idx}>
                      <span className="storm4-jutsu-bullet">•</span>
                      <div className="storm4-jutsu-content">
                        <span className="storm4-jutsu-text">{jutsu.name}</span>
                        {jutsu.baseChakraCost != null && (
                          <span
                            className="storm4-jutsu-cost-tag"
                            title={`Base: ${jutsu.baseChakraCost} CHK | Current CHK stat: ${currentChk} | Damage: ${jutsu.baseDamage || '-'}`}
                          >
                            ⚡{chkCost} CHK
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            {card.summons && card.summons.length > 0 && (
              <div className="storm4-info-box storm4-summon-box">
                <span className="storm4-info-label">SUMMON</span>
                <div className="storm4-summon-thumbnails" title="Click an icon to view Summon details">
                  {card.summons.map(summonKey => {
                    const sd = getSummonDetails(summonKey);
                    return (
                      <img
                        key={summonKey}
                        src={sd.icon}
                        alt={sd.name}
                        className="storm4-summon-icon"
                        onClick={(e) => { e.stopPropagation(); setActiveSummon(sd); }}
                        onError={(e) => { e.target.onerror = null; e.target.src = sd.image; }}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="storm4-divider" />

          {/* ATK / DEF / SPD / CHK Stats Grid (2x2) */}
          <div className="storm4-stats-grid">
            {[
              { label: 'ATK', value: currentAtk },
              { label: 'DEF', value: currentDef },
              { label: 'SPD', value: currentSpd },
              { label: 'CHK', value: currentChk },
            ].map(({ label, value }) => (
              <div className="storm4-stat-box" key={label}>
                <span className="storm4-stat-label">{label}</span>
                <span className={`storm4-stat-value ${getAttributeColorClass(value)}`}>
                  {value}
                </span>
              </div>
            ))}
          </div>

          {/* Upgrade Panel (placed below stats grid) */}
          {isOwned && (
            <div className="storm4-upgrade-panel">
              <div className="storm4-upgrade-header">
                <span className="storm4-upgrade-title">Ninja Upgrade</span>
                <span className="storm4-upgrade-cost">{upgradeCost}C + 1 Duplicate</span>
              </div>
              <div className="storm4-refine-summary">
                <span>Duplicates Available: {availableMaterials.length}</span>
              </div>
              <label className="storm4-upgrade-label" htmlFor="refine-material">Select Material Card</label>
              <select
                id="refine-material"
                className="storm4-upgrade-select"
                value={selectedMaterialId}
                onChange={(e) => setSelectedMaterialId(e.target.value)}
              >
                {availableMaterials.length === 0 ? (
                  <option value="">No duplicates available</option>
                ) : availableMaterials.map((item) => (
                  <option key={item.instanceId} value={item.instanceId}>
                    {item.name} +{item.plusLevel || 0} (OVR {item.ovr})
                  </option>
                ))}
              </select>
              <div className="storm4-refine-summary">
                <span>Success Rate: 100%</span>
                <span>Target: +{currentPlusLevel + 1}</span>
              </div>
              <button
                className="storm4-action-btn storm4-btn-upgrade"
                disabled={currentPlusLevel >= MAX_PLUS_LEVEL || !selectedMaterial || coins < upgradeCost}
                onClick={() => {
                  if (onUpgrade && inventoryEntry && selectedMaterial) {
                    onUpgrade(inventoryEntry, selectedMaterial);
                  }
                }}
              >
                {currentPlusLevel >= MAX_PLUS_LEVEL ? `MAX +${MAX_PLUS_LEVEL}` : `UPGRADE TO +${currentPlusLevel + 1}`}
              </button>
            </div>
          )}

          {/* Flexible Spacer */}
          <div className="storm4-spacer" />

          {/* Bottom Action Buttons: SELL and CLOSE aligned side-by-side */}
          <div className="storm4-actions">
            {isOwned ? (
              <button
                className="storm4-action-btn storm4-btn-sell"
                onClick={() => onSell && onSell(getCardKey(inventoryEntry) || card.id)}
              >
                SELL +{sellValue}C
              </button>
            ) : (
              <div className="storm4-unowned-hint">
                Roll in Gacha to unlock this card!
              </div>
            )}
            <button className="storm4-action-btn storm4-btn-close" onClick={handleCloseClick}>
              CLOSE
            </button>
          </div>
          {/* ── SUMMON DETAIL POPUP MODAL ── */}
          {activeSummon && (
            <div style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.85)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: '20px'
            }} onClick={() => setActiveSummon(null)}>
              <div style={{
                background: '#1e293b',
                border: '2px solid #38bdf8',
                borderRadius: '16px',
                padding: '24px',
                maxWidth: '400px',
                width: '100%',
                textAlign: 'center',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
                position: 'relative'
              }} onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setActiveSummon(null)}
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: 'transparent',
                    border: 'none',
                    color: '#fff',
                    fontSize: '18px',
                    cursor: 'pointer'
                  }}
                >✕</button>

                <h3 style={{ color: '#38bdf8', marginBottom: '16px', fontSize: '20px' }}>{activeSummon.name}</h3>

                <div style={{
                  width: '100%',
                  maxWidth: '350px',
                  height: '250px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#0f172a',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  marginBottom: '16px'
                }}>
                  <img
                    src={activeSummon.image}
                    alt={activeSummon.name}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'images/default_summon.webp';
                    }}
                  />
                </div>

                <p style={{ color: '#cbd5e1', fontSize: '13px', lineHeight: '1.5' }}>
                  {activeSummon.desc} (Bound to {card.name}).
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
