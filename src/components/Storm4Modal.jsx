import React, { useEffect, useState } from 'react';
import useEscapeKey from '../hooks/useEscapeKey.js';
import { createBackdropClickHandler } from '../utils/modal.js';
import {
  MAX_PLUS_LEVEL,
  RARITY_LABELS,
  buildHdImagePath,
  getCardKey,
  getRarityClass,
  getSellValue,
  getStarString,
  getUpgradeCost,
  isSameCardInstance
} from '../utils/cards.js';

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

  const inventoryEntry = inventory
    ? inventory.find(item => isSameCardInstance(item, card))
    : null;
  const currentStars = inventoryEntry ? inventoryEntry.stars : card.stars;
  const currentOvr = inventoryEntry ? inventoryEntry.ovr : card.ovr;
  const currentAtk = inventoryEntry ? inventoryEntry.atk : card.atk;
  const currentDef = inventoryEntry ? inventoryEntry.def : card.def;
  const currentChk = inventoryEntry ? inventoryEntry.chk : card.chk;
  const currentPlusLevel = inventoryEntry ? (inventoryEntry.plusLevel || 0) : 0;

  const amountOwned = inventoryEntry ? (inventoryEntry.quantity || 1) : 0;
  const upgradeCost = getUpgradeCost(currentPlusLevel);
  const sellValue = getSellValue(card);
  const rarityClass = getRarityClass(card);
  const canUpgrade = Boolean(inventoryEntry) && currentPlusLevel < MAX_PLUS_LEVEL && amountOwned > 1;
  const isOwned = Boolean(inventoryEntry);
  const availableMaterials = inventory ? inventory.filter(item => {
    if (item.id !== card.id) return false;
    // Don't use the exact same instance as the main card
    return item.instanceId !== (inventoryEntry?.instanceId || card.instanceId);
  }) : [];
  const selectedMaterial = availableMaterials.find(item => item.instanceId === selectedMaterialId) || null;
  const successRate = 100; // Updated logic: 100% success based on request or simplified FO3

  // Reset image state whenever the selected card changes
  useEffect(() => {
    if (card) {
      setImgSrc(buildHdImagePath(card.img));
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

  const handleBackdropClick = createBackdropClickHandler(onClose, { stopPropagation: true });

  const handleCloseClick = (e) => {
    e.stopPropagation();
    onClose();
  };

  // HD fallback: if HD png fails to load, fall back to original grid .webp
  const handleImageError = (e) => {
    e.target.onerror = null;
    setImgSrc(card.img);
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

          {/* Rarity watermark badge */}
          <div className={`storm4-rarity-watermark storm4-rw-${rarityClass}`}>
            {RARITY_LABELS[rarityClass]}
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

          {/* Star Rating */}
          <div className="storm4-stars-row">
            <span className={`storm4-stars storm4-stars-${rarityClass}`}>
              {starStr}
            </span>
          </div>

          {/* Jutsu Name */}
          <div className="storm4-jutsu-row">
            <span className="storm4-jutsu-label">JUTSU</span>
            <span className="storm4-jutsu-name">{card.jutsu || 'Secret Ninja Art'}</span>
          </div>

          {/* Divider */}
          <div className="storm4-divider" />

          {/* ATK / DEF / CHK Stat Bars */}
          <div className="storm4-stats-grid">
            {[
              { label: 'ATK', value: currentAtk },
              { label: 'DEF', value: currentDef },
              { label: 'CHK', value: currentChk },
            ].map(({ label, value }) => (
              <div className="storm4-stat-line" key={label}>
                <label className="storm4-stat-label">{label}</label>
                <div className="storm4-bar-track">
                  <div
                    className={`storm4-bar-fill storm4-fill-${rarityClass}`}
                    style={{ width: `${value || 50}%` }}
                  />
                </div>
                <span className="storm4-stat-value">{value}</span>
              </div>
            ))}
          </div>

          {/* Flexible Spacer */}
          <div className="storm4-spacer" />

          {/* Action Buttons */}
          <div className="storm4-actions">
            {isOwned ? (
              <>
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
                    // ✅ KODE REVISI (Pastiin selalu passing data kartu yang fresh):
                    onClick={() => {
                      if (onUpgrade && selectedMaterial) {
                        onUpgrade(inventoryEntry || card, selectedMaterial);
                      }
                    }}
                  >
                    {currentPlusLevel >= MAX_PLUS_LEVEL ? `MAX +${MAX_PLUS_LEVEL}` : `UPGRADE TO +${currentPlusLevel + 1}`}
                  </button>
                </div>
                <button
                  className="storm4-action-btn storm4-btn-sell"
                  onClick={() => onSell && onSell(getCardKey(inventoryEntry) || card.id)}
                >
                  SELL  +{sellValue}C
                </button>
              </>
            ) : (
              <div className="storm4-unowned-hint">
                Roll in Gacha to unlock this card!
              </div>
            )}
            <button className="storm4-action-btn storm4-btn-close" onClick={handleCloseClick}>
              CLOSE
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
