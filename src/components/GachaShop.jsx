import React, { useState } from 'react';
import { PACK_CONFIG, PACK_TYPES } from '../config/packs.js';

const COIN_BUNDLES = [
  { amount: 1500, className: 'btn-shop-action' },
  { amount: 4000, className: 'btn-shop-action secondary' }
];

export default function GachaShop({
  coins,
  rateBoosters,
  onOpenPack,
  onBuyCoins,
  onBuyBooster
}) {
  const [quantities, setQuantities] = useState(() =>
    PACK_TYPES.reduce((acc, pack) => ({ ...acc, [pack]: 1 }), {})
  );

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
                    <img src={config.image} alt={`${config.label} Shinobi Pack`} />
                  </div>
                  <h3 className="pack-title">{config.label} Pack</h3>
                  <p className="pack-description">{config.description}</p>
                  <div className="pack-drop-rates">{config.dropRates}</div>
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
                    </div>
                    <div className="pack-counter">
                      <button className="qty-btn" onClick={() => handleQtyChange(pack, -1)}>−</button>
                      <span className="qty-value">x{quantity}</span>
                      <button className="qty-btn" onClick={() => handleQtyChange(pack, 1)}>+</button>
                    </div>
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
