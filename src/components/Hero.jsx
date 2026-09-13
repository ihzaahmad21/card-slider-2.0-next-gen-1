import React, { useState, useEffect, useMemo } from 'react';
import { getCardImageSrc, getAttributeColorClass } from '../utils/cards.js';

export default function Hero({ cards = [], inventory = [], onOpenShowcase, onOpenInventory, onOpenShop, onSelectCard }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Filter kartu Gold atau top OVR sama seperti HeaderCarousel
  const heroCards = useMemo(() => {
    if (!cards || cards.length === 0) return [];
    let golds = cards.filter(c => c.rarityClass === 'gold' || c.ovr >= 90);
    golds.sort((a, b) => b.ovr - a.ovr || b.stars - a.stars);
    if (golds.length === 0) {
      golds = [...cards].sort((a, b) => b.ovr - a.ovr || b.stars - a.stars).slice(0, 6);
    }
    return golds;
  }, [cards]);

  // Efek rotasi otomatis berganti gambar tiap 4 detik
  useEffect(() => {
    if (heroCards.length === 0) return;

    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev === heroCards.length - 1 ? 0 : prev + 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [heroCards.length]);

  const featuredCard = heroCards.length > 0 ? heroCards[currentIndex] : null;

  const openShopModal = () => {
    if (onOpenShop) {
      onOpenShop();
      return;
    }
    const el = document.getElementById('gacha');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="hero-section" id="home" style={{
      padding: '60px 0',
      minHeight: '520px',           // ← tambahan, biar section lebih "penuh"
      display: 'flex',              // ← tambahan
      alignItems: 'center',         // ← tambahan: center vertikal
      overflow: 'hidden',
      position: 'relative'
    }}>
      <div className="container">
        <div className="hero-grid" style={{ position: 'relative' }}>
          {/* Left Hero Content */}
          <div className="hero-content" style={{ maxWidth: '640px', paddingRight: '20px' }}>
            <h1 className="hero-title">
              Collect & Upgrade <span>Shinobi Cards</span>
            </h1>

          </div>

        </div>
      </div>

      {/* Right Hero Character Render (Floating & Auto-Rotating) */}
      <div className="hero-render-container" style={{
        position: 'absolute',
        right: '60px',
        bottom: '10px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        zIndex: 2,
        pointerEvents: 'none'
      }}>
        {featuredCard && (
          <div style={{ textAlign: 'center' }}>
            <img
              src={getCardImageSrc(featuredCard)}
              alt={featuredCard.name}
              style={{
                maxHeight: '480px',
                objectFit: 'contain',
                filter: 'drop-shadow(0 15px 25px rgba(0,0,0,0.8))',
                transition: 'opacity 0.5s ease-in-out'
              }}
            />
            <div style={{ marginTop: '8px', color: 'var(--parchment)', fontSize: '18px', fontWeight: 'bold', fontFamily: '"Cinzel", serif', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
              {featuredCard.name}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}