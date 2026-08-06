import React, { useState } from 'react';

const PACK_PRICES = {
  bronze: 100,
  silver: 500,
  gold: 1000
};

export default function GachaShop({
  coins,
  rateBoosters,
  onOpenPack,
  onBuyCoins,
  onBuyBooster
}) {
  const [quantities, setQuantities] = useState({
    bronze: 1,
    silver: 1,
    gold: 1
  });

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
            {/* Bronze Pack */}
            <div className="pack-card bronze-pack">
              <div className="pack-tier-badge">Common Tier</div>
              <div className="pack-image-container">
                <img src="/images/case/bronze.png" alt="Bronze Shinobi Pack" />
              </div>
              <h3 className="pack-title">Bronze Pack</h3>
              <p className="pack-description">Contains Genin & Chunin Shinobi cards with up to 3-Star potential.</p>
              <div className="pack-drop-rates">Drops 1-3★ (3★ Drop Rate: 10%)</div>
              <div className="pack-cost">
                <span className="coin-icon">⚙</span>
                <span>100 Coins</span>
              </div>
              <button
                className="btn-pack-buy"
                onClick={() => onOpenPack('bronze', 1)}
              >
                Open 1x Bronze Pack
              </button>
            </div>

            {/* Silver Pack */}
            <div className="pack-card silver-pack">
              <div className="pack-tier-badge">Elite Tier</div>
              <div className="pack-image-container">
                <img src="/images/case/silver.png" alt="Silver Shinobi Pack" />
              </div>
              <h3 className="pack-title">Silver Pack</h3>
              <p className="pack-description">Contains Jonin & ANBU Shinobi cards with up to 4-Star potential.</p>
              <div className="pack-drop-rates">Drops 3-4★ (4★ Drop Rate: 15%)</div>
              <div className="pack-cost">
                <span className="coin-icon">⚙</span>
                <span>500 Coins</span>
              </div>
              <button
                className="btn-pack-buy"
                onClick={() => onOpenPack('silver', 1)}
              >
                Open 1x Silver Pack
              </button>
            </div>

            {/* Gold Pack */}
            <div className="pack-card gold-pack">
              <div className="pack-tier-badge">Legendary Tier</div>
              <div className="pack-image-container">
                <img src="/images/case/gold.png" alt="Gold Shinobi Pack" />
              </div>
              <h3 className="pack-title">Gold Pack</h3>
              <p className="pack-description">Guarantees Legendary Kage & Mythic Shinobi cards up to 5-Star OVR.</p>
              <div className="pack-drop-rates">Drops 4-5★ (5★ Drop Rate: 20%)</div>
              <div className="pack-cost">
                <span className="coin-icon">⚙</span>
                <span>1,000 Coins</span>
              </div>
              <button
                className="btn-pack-buy"
                onClick={() => onOpenPack('gold', 1)}
              >
                Open 1x Gold Pack
              </button>
            </div>
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

              {/* Bronze Multi-Pull */}
              <div className="pack-shop-item bronze">
                <div className="pack-shop-info">
                  <strong>Bronze Pack</strong>
                  <span>100 Coins / pull</span>
                </div>
                <div className="pack-counter">
                  <button className="qty-btn" onClick={() => handleQtyChange('bronze', -1)}>−</button>
                  <span className="qty-value">x{quantities.bronze}</span>
                  <button className="qty-btn" onClick={() => handleQtyChange('bronze', 1)}>+</button>
                </div>
                <div className="pack-total">Total: {(PACK_PRICES.bronze * quantities.bronze).toLocaleString()} Coins</div>
                <button
                  className="btn-shop-action"
                  onClick={() => onOpenPack('bronze', quantities.bronze)}
                >
                  Open {quantities.bronze}x Bronze Pack
                </button>
              </div>

              {/* Silver Multi-Pull */}
              <div className="pack-shop-item silver">
                <div className="pack-shop-info">
                  <strong>Silver Pack</strong>
                  <span>500 Coins / pull</span>
                </div>
                <div className="pack-counter">
                  <button className="qty-btn" onClick={() => handleQtyChange('silver', -1)}>−</button>
                  <span className="qty-value">x{quantities.silver}</span>
                  <button className="qty-btn" onClick={() => handleQtyChange('silver', 1)}>+</button>
                </div>
                <div className="pack-total">Total: {(PACK_PRICES.silver * quantities.silver).toLocaleString()} Coins</div>
                <button
                  className="btn-shop-action"
                  onClick={() => onOpenPack('silver', quantities.silver)}
                >
                  Open {quantities.silver}x Silver Pack
                </button>
              </div>

              {/* Gold Multi-Pull */}
              <div className="pack-shop-item gold">
                <div className="pack-shop-info">
                  <strong>Gold Pack</strong>
                  <span>1,000 Coins / pull</span>
                </div>
                <div className="pack-counter">
                  <button className="qty-btn" onClick={() => handleQtyChange('gold', -1)}>−</button>
                  <span className="qty-value">x{quantities.gold}</span>
                  <button className="qty-btn" onClick={() => handleQtyChange('gold', 1)}>+</button>
                </div>
                <div className="pack-total">Total: {(PACK_PRICES.gold * quantities.gold).toLocaleString()} Coins</div>
                <button
                  className="btn-shop-action"
                  onClick={() => onOpenPack('gold', quantities.gold)}
                >
                  Open {quantities.gold}x Gold Pack
                </button>
              </div>
            </div>

            {/* Coin Bundle Card */}
            <div className="shop-card">
              <h3>Coin Bundle</h3>
              <p>Purchase a fresh stack of coins to keep upgrading your best Shinobi.</p>
              <button
                className="btn-shop-action"
                onClick={() => onBuyCoins(1500)}
              >
                Buy 1,500 Coins
              </button>
              <button
                className="btn-shop-action secondary"
                onClick={() => onBuyCoins(4000)}
              >
                Buy 4,000 Coins
              </button>
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
