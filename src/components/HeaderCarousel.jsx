import React, { useState, useEffect, useMemo, useRef } from 'react';
import FlipCard from './FlipCard.jsx';
import './HeaderCarousel.css';

export default function HeaderCarousel({ cards, onSelectCard }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  
  // Drag states
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentTranslate, setCurrentTranslate] = useState(0);
  
  const trackRef = useRef(null);
  
  // Filter top Gold cards (or fallback top OVR cards)
  const carouselCards = useMemo(() => {
    if (!cards || cards.length === 0) return [];
    let golds = cards.filter(c => c.rarityClass === 'gold' || c.ovr >= 90);
    golds.sort((a, b) => b.ovr - a.ovr || b.stars - a.stars);
    if (golds.length === 0) {
      golds = [...cards].sort((a, b) => b.ovr - a.ovr || b.stars - a.stars).slice(0, 6);
    }
    return golds;
  }, [cards]);

  useEffect(() => {
    if (carouselCards.length === 0 || isHovered || isDragging) return;

    const timer = setInterval(() => {
      handleNext();
    }, 3500);

    return () => clearInterval(timer);
  }, [carouselCards.length, isHovered, isDragging, currentIndex]);

  if (carouselCards.length === 0) return null;

  const handlePrev = () => {
    setCurrentIndex(prev => (prev === 0 ? carouselCards.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev === carouselCards.length - 1 ? 0 : prev + 1));
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };
  
  // Drag / Swipe Handlers
  const handleDragStart = (e) => {
    setIsDragging(true);
    setStartX(e.type.includes('mouse') ? e.pageX : e.touches[0].clientX);
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;
    const currentX = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
    const diff = currentX - startX;
    setCurrentTranslate(diff);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (currentTranslate < -50) {
      handleNext();
    } else if (currentTranslate > 50) {
      handlePrev();
    }
    setCurrentTranslate(0);
  };

  // Center the active slide
  const slideWidth = 260; 
  const gap = 32; // 2rem
  const itemWidth = slideWidth + gap;
  
  // We want the active index to be centered.
  // container center = trackRef.current?.offsetWidth / 2
  // slide offset = index * itemWidth
  // transform = center - slide offset - slideWidth/2
  
  let baseTransform = 0;
  if (trackRef.current) {
    const containerWidth = trackRef.current.offsetWidth;
    baseTransform = (containerWidth / 2) - (currentIndex * itemWidth) - (slideWidth / 2);
  }

  const transformValue = `translateX(calc(${baseTransform}px + ${currentTranslate}px))`;

  return (
    <section 
      className="header-carousel-section"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <h2 className="header-carousel-title">
        Featured <span>Shinobi</span>
      </h2>
      
      <div className="carousel-container">
        <button className="carousel-btn prev" onClick={handlePrev} aria-label="Previous">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        
        <div 
          className="carousel-track-wrapper" 
          ref={trackRef}
          onMouseDown={handleDragStart}
          onMouseMove={handleDragMove}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          onTouchStart={handleDragStart}
          onTouchMove={handleDragMove}
          onTouchEnd={handleDragEnd}
        >
          <div 
            className="carousel-track"
            style={{ 
              transform: trackRef.current ? transformValue : 'translateX(0)',
              transition: isDragging ? 'none' : 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)'
            }}
          >
            {carouselCards.map((card, idx) => (
              <div 
                key={card.id + idx} 
                className={`carousel-slide ${idx === currentIndex ? 'active-slide' : ''}`}
                onClick={(e) => {
                  if (Math.abs(currentTranslate) < 10) {
                    if (idx !== currentIndex) {
                       goToSlide(idx);
                    } else if (onSelectCard) {
                       onSelectCard(card);
                    }
                  }
                }}
              >
                <FlipCard
                  card={card}
                  isUnlocked={true}
                  disableClickFlip={true}
                  className={idx === currentIndex ? 'hover-flip' : ''}
                />
              </div>
            ))}
          </div>
        </div>

        <button className="carousel-btn next" onClick={handleNext} aria-label="Next">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      <div className="carousel-dots">
        {carouselCards.map((_, idx) => (
          <div 
            key={idx} 
            className={`dot ${idx === currentIndex ? 'active' : ''}`}
            onClick={() => goToSlide(idx)}
          />
        ))}
      </div>
    </section>
  );
}
