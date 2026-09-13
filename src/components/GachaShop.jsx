import React, { useState } from 'react';
import { PACK_CONFIG, PACK_TYPES } from '../config/packs.js';

const COIN_BUNDLES = [
  { amount: 1500, className: 'btn-shop-action' },
  { amount: 1000000, className: 'btn-shop-action secondary' }
];

export default function GachaShop({
  coins,
  rateBoosters,
  pity,
  onOpenPack,
  onBuyCoins,
  onBuyBooster
}) {
  const [quantities, setQuantities] = useState(() =>
    PACK_TYPES.reduce((acc, pack) => ({ ...acc, [pack]: 1 }), {})
  );
  const handleSetMax = (pack) => {
    setQuantities(prev => ({ ...prev, [pack]: 10 }));
  };
  const handleQtyChange = (pack, delta) => {
    setQuantities(prev => ({
      ...prev,
      [pack]: Math.max(1, Math.min(10, prev[pack] + delta))
    }));
  };


  return (
    <>
      {/* Booster Packs Section */}
      <section className="section-padding gacha-section" id="gacha">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">Shinobi Gacha System</span>
            <h2 className="section-title">Open Booster Packs</h2>
          </div>

          <div className="gacha-grid">
            {PACK_TYPES.map(pack => {
              const config = PACK_CONFIG[pack];
              return (
                <div className={`pack-card ${pack}-pack`} key={pack}>
                  <div className="pack-tier-badge">{config.tierBadge}</div>
                  <div className="pack-image-container">
                    <img
                      src={config.image || ''}
                      alt={`${config.label} Shinobi Pack`}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://placehold.co/180x240/0f172a/${pack === 'premium' ? 'a855f7' : pack === 'gold' ? 'd4af37' : pack === 'silver' ? 'c0c0c0' : 'cd7f32'}?text=${config.label}+Pack`;
                      }}
                    />
                  </div>
                  <h3 className="pack-title">{config.label} Pack</h3>
                  <p className="pack-description">{config.description}</p>
                  <div className="pack-drop-rates">{config.dropRates}</div>
                  <div className="pack-pity-status" style={{ fontSize: '0.85rem', color: pack === 'premium' ? '#ec4899' : '#10b981', margin: '4px 0 12px', fontWeight: 'bold' }}>
                    {pity[pack] || 0}/{config.pityGuarantee} pulls to guaranteed {pack === 'premium' ? 'Mythic' : pack === 'gold' ? 'Diamond' : 'top-tier'}
                  </div>
                  <div className="pack-cost">
                    <span className="coin-icon">⚙</span>
                    <span>{config.cost.toLocaleString()} Coins</span>
                  </div>
                  <button
                    className="btn-pack-buy"
                    onClick={() => onOpenPack(pack, 1)}
                  >
                    Open 1x {config.label} Pack
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Multi-Pull & Shop Hub Section */}
      <section className="section-padding shop-section" id="shop">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">Upgrade & Trade Hub</span>
            <h2 className="section-title">Shop & Multi-Pulls</h2>
          </div>

          <div className="shop-grid">
            {/* Multi-Pull Control Card */}
            <div className="shop-card">
              <h3>Multi-Pull Packs</h3>
              <p>Roll multiple packs in one go and decide whether to keep or quick-sell each reveal.</p>

              {PACK_TYPES.map(pack => {
                const config = PACK_CONFIG[pack];
                const quantity = quantities[pack];
                return (
                  <div className={`pack-shop-item ${pack}`} key={pack}>
                    <div className="pack-shop-info">
                      <strong>{config.label} Pack</strong>
                      <span>{config.cost.toLocaleString()} Coins / pull</span>
                      <span style={{ fontSize: '0.8rem', color: pack === 'premium' ? '#ec4899' : '#10b981', display: 'block', marginTop: '4px', fontWeight: 'bold' }}>
                        Pity: {pity[pack] || 0}/{config.pityGuarantee}
                      </span>
                    </div>
                    <div className="pack-counter">
                      <button className="qty-btn" onClick={() => handleQtyChange(pack, -1)}>−</button>
                      <span className="qty-value">x{quantity}</span>
                      <button className="qty-btn" onClick={() => handleQtyChange(pack, 1)}>+</button>
                    </div>
                    <button className="btn-qty-max" onClick={() => handleSetMax(pack)}>Max x10</button>
                    <div className="pack-total">Total: {(config.cost * quantity).toLocaleString()} Coins</div>
                    <button
                      className="btn-shop-action"
                      onClick={() => onOpenPack(pack, quantity)}
                    >
                      Open {quantity}x {config.label} Pack
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Coin Bundle Card */}
            <div className="shop-card">
              <h3>Coin Bundle</h3>
              <p>Purchase a fresh stack of coins to keep upgrading your best Shinobi.</p>
              {COIN_BUNDLES.map(({ amount, className }) => (
                <button
                  className={className}
                  key={amount}
                  onClick={() => onBuyCoins(amount)}
                >
                  Buy {amount.toLocaleString()} Coins
                </button>
              ))}
            </div>

            {/* Rate Booster Card */}
            <div className="shop-card">
              <h3>Rate Booster</h3>
              <p>Unlock temporary drop-rate boosts for your next pack runs.</p>
              <div className="shop-booster-pill">
                Owned Boosters: <span>{rateBoosters}</span>
              </div>
              <button
                className="btn-shop-action"
                onClick={onBuyBooster}
              >
                Unlock Booster
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
