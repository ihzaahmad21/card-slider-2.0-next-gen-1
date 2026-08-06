import React, { useEffect, useState } from 'react';

function getSuccessRate(mainLevel, materialLevel) {
  const baseRate = Math.max(100 - (mainLevel * 10), 5);
  const materialBonus = (materialLevel - 1) * 8;
  return Math.max(Math.min(baseRate + materialBonus, 90), 5);
}

export default function Storm4Modal({
  card,
  onClose,
  inventory,
  coins,
  onUpgrade,
  onSell
}) {
  // --- Dual-Image Strategy ---
  // Grid uses lightweight .webp thumbnail; Modal loads full HD .png from /images/HD/
  const buildHdPath = (img) =>
    img
      .replace('/images/', '/images/HD/')
      .replace('.webp', '.png');

  const [imgSrc, setImgSrc] = useState(() => card ? buildHdPath(card.img) : '');
  const [imgLoaded, setImgLoaded] = useState(false);
  const [selectedMaterialId, setSelectedMaterialId] = useState('');

  // ✅ REVISI: Cari murni berdasarkan instanceId dulu, kalau tidak ada baru berdasarkan ID unik kartu
  const inventoryEntry = inventory ? inventory.find(item => {
    if (card.instanceId && item.instanceId) {
      return item.instanceId === card.instanceId;
    }
    return item.id === card.id;
  }) : null;
  const currentStars = inventoryEntry ? inventoryEntry.stars : card.stars;
  const currentOvr = inventoryEntry ? inventoryEntry.ovr : card.ovr;
  const currentAtk = inventoryEntry ? inventoryEntry.atk : card.atk;
  const currentDef = inventoryEntry ? inventoryEntry.def : card.def;
  const currentChk = inventoryEntry ? inventoryEntry.chk : card.chk;
  const currentPlusLevel = inventoryEntry ? (inventoryEntry.plusLevel || 0) : 0;

  const amountOwned = inventoryEntry ? (inventoryEntry.quantity || 1) : 0;
  const upgradeCost = 200 * (currentPlusLevel + 1);
  const sellValue = card.rarityClass === 'gold' ? 400 : (card.rarityClass === 'silver' ? 150 : 30);
  const canUpgrade = Boolean(inventoryEntry) && currentPlusLevel < 10 && amountOwned > 1;
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
      setImgSrc(buildHdPath(card.img));
      setImgLoaded(false);
    }
  }, [card]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (availableMaterials.length > 0) {
      if (!selectedMaterialId || !availableMaterials.some(item => item.instanceId === selectedMaterialId)) {
        setSelectedMaterialId(availableMaterials[0].instanceId);
      }
    } else {
      setSelectedMaterialId('');
    }
  }, [availableMaterials, selectedMaterialId]);

  // Star display
  const starsFull = currentStars || 1;
  const starsEmpty = Math.max(0, 5 - starsFull);
  const starStr = '★'.repeat(starsFull) + '☆'.repeat(starsEmpty);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      e.stopPropagation();
      onClose();
    }
  };

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
      <div className={`storm4-split-container storm4-rarity-${card.rarityClass || 'bronze'}`}>

        {/* ── LEFT COLUMN: Full-body HD Character Showcase ── */}
        <div className="storm4-left-col">
          {/* Atmospheric rarity glow background */}
          <div className={`storm4-artwork-bg storm4-bg-${card.rarityClass || 'bronze'}`} />

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
          <div className={`storm4-rarity-watermark storm4-rw-${card.rarityClass || 'bronze'}`}>
            {card.rarityClass === 'gold' ? 'GOLD RARE' : card.rarityClass === 'silver' ? 'SILVER RARE' : 'BRONZE'}
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
                <span className={`storm4-plus-badge ${currentPlusLevel >= 10 ? 'storm4-plus-max' : ''}`}>+{currentPlusLevel}</span>
              )}
            </h2>
            <div className={`storm4-ovr-badge storm4-ovr-${card.rarityClass || 'bronze'}`}>
              <span className="storm4-ovr-num">{currentOvr}</span>
              <span className="storm4-ovr-label">OVR</span>
            </div>
          </div>

          {/* Star Rating */}
          <div className="storm4-stars-row">
            <span className={`storm4-stars storm4-stars-${card.rarityClass || 'bronze'}`}>
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
                    className={`storm4-bar-fill storm4-fill-${card.rarityClass || 'bronze'}`}
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
                    disabled={currentPlusLevel >= 10 || !selectedMaterial || coins < upgradeCost}
                    // ✅ KODE REVISI (Pastiin selalu passing data kartu yang fresh):
                    onClick={() => {
                      if (onUpgrade && selectedMaterial) {
                        onUpgrade(inventoryEntry || card, selectedMaterial);
                      }
                    }}
                  >
                    {currentPlusLevel >= 10 ? 'MAX +10' : `UPGRADE TO +${currentPlusLevel + 1}`}
                  </button>
                </div>
                <button
                  className="storm4-action-btn storm4-btn-sell"
                  onClick={() => onSell && onSell(inventoryEntry ? inventoryEntry.instanceId || inventoryEntry.id : card.id)}
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
