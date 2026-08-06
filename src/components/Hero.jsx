import React, { useState, useEffect, useRef, useMemo } from 'react';
import CardContainer from './CardContainer.jsx';

export default function Hero({ cards, onOpenShowcase, onOpenShop, onSelectCard }) {
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Filter top Gold cards (or fallback top OVR cards)
  const carouselCandidates = useMemo(() => {
    if (!cards || cards.length === 0) return [];
    let golds = cards.filter(c => c.rarity === 'GOLD RARE' || c.ovr >= 90);
    golds.sort((a, b) => b.ovr - a.ovr || b.stars - a.stars);
    if (golds.length === 0) {
      golds = [...cards].sort((a, b) => b.ovr - a.ovr || b.stars - a.stars).slice(0, 6);
    }
    return golds;
  }, [cards]);

  useEffect(() => {
    if (carouselCandidates.length === 0 || isHovered) return;

    const timer = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setCarouselIndex(prev => (prev + 1) % carouselCandidates.length);
        setIsFading(false);
      }, 300);
    }, 4000);

    return () => clearInterval(timer);
  }, [carouselCandidates, isHovered]);

  const currentCard = carouselCandidates[carouselIndex] || cards[0];

  const openShopModal = () => {
    if (onOpenShop) {
      onOpenShop();
      return;
    }
    const el = document.getElementById('gacha');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="hero-section" id="home">
      <div className="container">
        <div className="hero-grid">
          {/* Left Hero Content */}
          <div className="hero-content">
            <div className="hero-badge">
              <span className="pulse-dot"></span>
              <span>Next-Gen React TCG App</span>
            </div>

            <h1 className="hero-title">
              Collect & Upgrade <span>Shinobi Cards</span>
            </h1>

            <p className="hero-subtitle">
              Experience the ultimate Ninja TCG card collector. Build your roster, unlock legendary gacha packs, upgrade
              your Jutsu stats, and master the card arena.
            </p>

            <div className="hero-cta-group">
              <button className="btn-primary" onClick={openShopModal}>
                <span>Gacha Now</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
              <button className="btn-secondary" onClick={onOpenShowcase}>
                <span>View Showcase</span>
              </button>
            </div>

            <div className="hero-stats">
              <div className="stat-item">
                <h4>{cards ? cards.length : 190}</h4>
                <p>Ninja Cards</p>
              </div>
              <div className="stat-item">
                <h4>3</h4>
                <p>Pack Tiers</p>
              </div>
              <div className="stat-item">
                <h4>99</h4>
                <p>Max OVR Power</p>
              </div>
            </div>
          </div>

          {/* Right Auto-Rotating Live Card Carousel */}
          <div className="hero-card-preview">
            <div
              className={`hero-card-stage ${isFading ? 'hero-carousel-fade' : ''}`}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onClick={() => currentCard && onSelectCard(currentCard)}
              title="Click to view Storm 4 Card Detail"
            >
              {currentCard && <CardContainer card={currentCard} />}
            </div>
            <div className="preview-label">
              <span>Live 2:3 Scale Preview (Auto-Rotating)</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
