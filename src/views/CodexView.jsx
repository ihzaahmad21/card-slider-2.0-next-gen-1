import React, { useState, useMemo } from 'react';
import CardContainer from '../components/CardContainer.jsx';
import TagFilterBar from '../components/TagFilterBar.jsx';
import { createDefaultCardFilterState, filterCards } from '../utils/cardFilters.js';
import { RARITY_CLASSES } from '../utils/cards.js';

const BATCH_SIZE = 12;

const RARITY_TIERS = [
  { key: 'mythic', label: 'MYTHIC', color: '#ec4899', gradient: 'linear-gradient(90deg, #fbcfe8, #ec4899, #a855f7)' },
  { key: 'diamond', label: 'DIAMOND', color: '#38bdf8', gradient: 'linear-gradient(90deg, #e0f2fe, #38bdf8, #0284c7)' },
  { key: 'gold', label: 'GOLD', color: '#f59e0b', gradient: 'linear-gradient(90deg, #fef08a, #f59e0b, #b45309)' },
  { key: 'silver', label: 'SILVER', color: '#94a3b8', gradient: 'linear-gradient(90deg, #f1f5f9, #94a3b8, #475569)' },
  { key: 'bronze', label: 'BRONZE', color: '#b45309', gradient: 'linear-gradient(90deg, #fdba74, #b45309, #78350f)' }
]

export default function CodexView({ cards, inventory, onSelectCard, onSwitchToLore }) {
  const [filterState, setFilterState] = useState(createDefaultCardFilterState());
  const [displayLimit, setDisplayLimit] = useState(BATCH_SIZE);

  // Set of owned card IDs
  const ownedIds = useMemo(() => {
    if (!inventory) return new Set();
    return new Set(inventory.map(item => item.id));
  }, [inventory]);

  const stats = useMemo(() => {
    let goldOwned = 0, goldTotal = 0;
    let diamondOwned = 0, diamondTotal = 0;
    let mythicOwned = 0, mythicTotal = 0;
    let silverOwned = 0, silverTotal = 0;
    let bronzeOwned = 0, bronzeTotal = 0;

    cards.forEach(card => {
      const isOwned = ownedIds.has(card.id);
      if (card.rarityClass === 'mythic') {
        mythicTotal++;
        if (isOwned) mythicOwned++;
      } else if (card.rarityClass === 'diamond') {
        diamondTotal++;
        if (isOwned) diamondOwned++;
      } else if (card.rarityClass === 'gold') {
        goldTotal++;
        if (isOwned) goldOwned++;
      } else if (card.rarityClass === 'silver') {
        silverTotal++;
        if (isOwned) silverOwned++;
      } else if (card.rarityClass === 'bronze') {
        bronzeTotal++;
        if (isOwned) bronzeOwned++;
      }
    });

    return {
      mythic: { owned: mythicOwned, total: mythicTotal },
      diamond: { owned: diamondOwned, total: diamondTotal },
      gold: { owned: goldOwned, total: goldTotal },
      silver: { owned: silverOwned, total: silverTotal },
      bronze: { owned: bronzeOwned, total: bronzeTotal },
      total: {
        owned: mythicOwned + diamondOwned + goldOwned + silverOwned + bronzeOwned,
        total: mythicTotal + diamondTotal + goldTotal + silverTotal + bronzeTotal
      }
    };
  }, [cards, ownedIds]);

  const filteredCards = useMemo(() => {
    return filterCards(cards, filterState);
  }, [cards, filterState]);

  const visibleCards = useMemo(() => {
    return filteredCards.slice(0, displayLimit);
  }, [filteredCards, displayLimit]);

  const handleFilterChange = (nextFilterState) => {
    setFilterState(nextFilterState);
    setDisplayLimit(BATCH_SIZE);
  };

  const handleSearchChange = (e) => {
    setFilterState(prev => ({ ...prev, searchTerm: e.target.value }));
    setDisplayLimit(BATCH_SIZE);
  };

  const handleLoadMore = () => {
    setDisplayLimit(prev => prev + BATCH_SIZE);
  };

  const remaining = filteredCards.length - visibleCards.length;

  return (
    <section className="view active section-padding" id="view-codex">
      <div className="container">
        <div className="section-header">
          <span className="section-subtitle">Shinobi Collection</span>
          <h2 className="section-title">Collection Codex</h2>

          {onSwitchToLore && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '12px' }}>
              <button
                type="button"
                style={{
                  background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.3), rgba(212, 175, 55, 0.1))',
                  border: '1px solid #d4af37',
                  color: '#ffffff',
                  padding: '6px 16px',
                  borderRadius: '20px',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                🃏 Card Codex
              </button>
              <button
                type="button"
                onClick={onSwitchToLore}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(212, 175, 55, 0.25)',
                  color: '#94a3b8',
                  padding: '6px 16px',
                  borderRadius: '20px',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                📜 Character Lore Wiki
              </button>
            </div>
          )}

           {/* Overall Progress Bar */}
           <div className="codex-progress" style={{ margin: '20px auto', maxWidth: '600px', background: 'var(--panel, #1d1613)', padding: '16px', borderRadius: '12px', border: '1px solid var(--line)' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: 'var(--parchment, #f3e6c8)' }}>
               <strong>Total Progress</strong>
               <span>{Math.round((stats.total.owned / stats.total.total) * 100) || 0}% ({stats.total.owned}/{stats.total.total})</span>
             </div>
             <div style={{ width: '100%', height: '12px', background: 'rgba(0,0,0,0.5)', borderRadius: '6px', overflow: 'hidden' }}>
               <div style={{ width: `${(stats.total.owned / stats.total.total) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #10b981, #34d399)' }}></div>
             </div>
           </div>

           {/* Per-Tier Progress Bars */}
           <div className="codex-tier-progress" style={{ margin: '18px auto', maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
             {RARITY_TIERS.map(tier => {
               const tierStats = stats[tier.key] || { owned: 0, total: 0 };
               const pct = tierStats.total > 0 ? (tierStats.owned / tierStats.total) * 100 : 0;
               return (
                 <div key={tier.key}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '12px', color: 'var(--parchment-dim, #cabb98)' }}>
                     <span style={{ color: tier.color, fontWeight: '700' }}>{tier.label}</span>
                     <span>{tierStats.owned}/{tierStats.total}</span>
                   </div>
                   <div style={{ width: '100%', height: '8px', background: 'rgba(0,0,0,0.5)', borderRadius: '4px', overflow: 'hidden' }}>
                     <div style={{ width: `${pct}%`, height: '100%', background: tier.gradient, borderRadius: '4px', transition: 'width 0.4s ease' }}></div>
                   </div>
                 </div>
               );
             })}
           </div>

           <div style={{ margin: '15px 0', display: 'flex', justifyContent: 'center' }}>
             <input
               type="text"
               placeholder="🔍 Search Shinobi by name or Jutsu..."
               value={filterState.searchTerm}
               onChange={handleSearchChange}
               style={{
                 width: '100%',
                 maxWidth: '400px',
                 background: 'rgba(15, 23, 42, 0.8)',
                 border: '1px solid rgba(212, 175, 55, 0.4)',
                 borderRadius: '8px',
                 padding: '10px 16px',
                 color: '#fff',
                 fontSize: '14px',
                 outline: 'none',
                 boxSizing: 'border-box'
               }}
             />
           </div>

          {/* Advanced Filter Bar (rarity + category + team + village + clan) */}
          <TagFilterBar
            cards={cards}
            filterState={filterState}
            onChange={handleFilterChange}
          />
        </div>

        <div className="showcase-grid-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '20px', padding: '20px' }}>
          {visibleCards.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#aaa', padding: '40px' }}>
              No Shinobi found matching your filters.
            </div>
          ) : (
            visibleCards.map(card => {
              const isOwned = ownedIds.has(card.id);
              return (
                <div
                  className={`codex-card-wrapper ${!isOwned ? 'locked-silhouette' : ''}`}
                  key={card.id}
                  style={{
                    opacity: isOwned ? 1 : 0.6,
                    filter: isOwned ? 'none' : 'grayscale(100%) brightness(0.4)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  title={!isOwned ? 'Card not collected yet' : 'Click to view details'}
                  onClick={() => onSelectCard(card)}
                >
                  <CardContainer
                    card={card}
                    isThumbnail={true}
                  />
                  <div className="card-meta-info" style={{ textAlign: 'center', marginTop: '10px', color: 'var(--parchment, #f3e6c8)' }}>
                    <h4 style={{ margin: '0 0 4px', fontSize: '1rem' }}>{isOwned ? card.name : '???'}</h4>
                    {isOwned && <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--parchment-dim, #cabb98)' }}>{card.ovr} OVR · {card.stars}★</p>}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {remaining > 0 && (
          <div className="load-more-wrapper" style={{ textAlign: 'center', marginTop: '20px' }}>
            <button className="btn-load-more" onClick={handleLoadMore}>
              Load More Cards ({remaining} Remaining)
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
