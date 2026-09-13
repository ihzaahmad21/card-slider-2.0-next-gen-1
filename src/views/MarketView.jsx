import React, { useState, useEffect, useMemo } from 'react';
import CardContainer from '../components/CardContainer.jsx';
import { getSellValue } from '../utils/cards.js';
import ConfirmModal from '../components/ConfirmModal.jsx';
import { buildBotListings, createPlayerListing } from '../utils/market.js';

export default function MarketView({
  cards,
  inventory,
  coins,
  playerListings,
  onBuyListing,
  onCreateListing,
  onCancelListing,
  onQuickSell,
  onSelectCard,
  onOpenFusion
}) {
  const [activeTab, setActiveTab] = useState('bot'); // 'bot' | 'player' | 'sell'
  const [botListings, setBotListings] = useState([]);

  // State for Sell Tab
  const [selectedSellItem, setSelectedSellItem] = useState(null);
  const [sellPrice, setSellPrice] = useState(0);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [sellSearch, setSellSearch] = useState('');
  const [sellRarityFilter, setSellRarityFilter] = useState('all');
  const [confirmMessage, setConfirmMessage] = useState(null);

  // Generate bot listings on mount (sekali per sesi)
  useEffect(() => {
    if (cards && cards.length > 0 && botListings.length === 0) {
      setBotListings(buildBotListings(cards, inventory, 8));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cards]);

  const ownedIds = useMemo(() => new Set(inventory.map(c => c.id)), [inventory]);

  // Filtered inventory for Sell tab
  const filteredSellInventory = useMemo(() => {
    if (!inventory) return [];
    return inventory.filter(item => {
      if (sellSearch) {
        const query = sellSearch.toLowerCase();
        if (!item.name?.toLowerCase().includes(query) && !item.jutsu?.toLowerCase().includes(query)) {
          return false;
        }
      }
      if (sellRarityFilter !== 'all') {
        const itemRarityClass = item.rarityClass || 'bronze';
        if (itemRarityClass !== sellRarityFilter) {
          return false;
        }
      }
      return true;
    });
  }, [inventory, sellSearch, sellRarityFilter]);

  // Calculate total sell value for checked cards
  const selectedCards = useMemo(() => {
    if (!inventory || selectedIds.size === 0) return [];
    return inventory.filter(c => selectedIds.has(c.instanceId));
  }, [inventory, selectedIds]);

  const totalSelectedSellValue = useMemo(() => {
    return selectedCards.reduce((sum, c) => sum + getSellValue(c), 0);
  }, [selectedCards]);

  const handleToggleCardSelection = (instanceId, e) => {
    if (e) e.stopPropagation();
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(instanceId)) {
        next.delete(instanceId);
      } else {
        next.add(instanceId);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredSellInventory.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredSellInventory.map(c => c.instanceId)));
    }
  };

  const handleSelectDuplicates = () => {
    const idCounts = {};
    inventory.forEach(c => {
      idCounts[c.id] = (idCounts[c.id] || 0) + 1;
    });
    // Keep one copy, select extra duplicates
    const seen = new Set();
    const duplicateIds = new Set();
    inventory.forEach(c => {
      if (idCounts[c.id] > 1) {
        if (seen.has(c.id)) {
          duplicateIds.add(c.instanceId);
        } else {
          seen.add(c.id);
        }
      }
    });
    setSelectedIds(duplicateIds);
  };

  const handleQuickSellSelected = () => {
    if (selectedCards.length === 0) return;
    const count = selectedCards.length;
    const confirmMsg = `Are you sure you want to quick sell ${count} card(s) for +${totalSelectedSellValue.toLocaleString()} Coins?`;
    setConfirmMessage(confirmMsg);
  };

  const handleStartListing = (card) => {
    const targetCard = card || (selectedCards.length === 1 ? selectedCards[0] : null);
    if (!targetCard) return;
    setSelectedSellItem(targetCard);
    setSellPrice(getSellValue(targetCard) * 2);
  };

  const handleBuy = (listing, isBot) => {
    if (coins < listing.price) {
      alert(`Not enough coins! You need ${listing.price} coins.`);
      return;
    }

    // Attempt buy
    onBuyListing(listing.listingId, isBot ? botListings : playerListings, isBot, (newListings) => {
      if (isBot) setBotListings(newListings);
    });
  };

  const handleCreateListing = () => {
    if (!selectedSellItem) return;
    const minPrice = getSellValue(selectedSellItem);
    if (sellPrice < minPrice) {
      alert(`Minimum price for this card is ${minPrice} coins.`);
      return;
    }

    onCreateListing(selectedSellItem, sellPrice);
    setSelectedSellItem(null);
    setSellPrice(0);
    setActiveTab('player');
  };

  return (
    <section className="view active section-padding" id="view-market">
      <div className="container" style={{ maxWidth: '1200px' }}>
        <div className="section-header">
          <span className="section-subtitle">Offline Trading Hub</span>
          <h2 className="section-title">Black Market</h2>

          <div className="market-tabs" style={{ display: 'flex', gap: '10px', justifyContent: 'center', margin: '20px 0', flexWrap: 'wrap' }}>
            <button
              className={`cta-btn ${activeTab === 'bot' ? 'active' : ''}`}
              style={{ filter: activeTab !== 'bot' ? 'grayscale(1)' : 'none' }}
              onClick={() => setActiveTab('bot')}
            >
              Market (Bot)
            </button>
            <button
              className={`cta-btn ${activeTab === 'player' ? 'active' : ''}`}
              style={{ filter: activeTab !== 'player' ? 'grayscale(1)' : 'none' }}
              onClick={() => setActiveTab('player')}
            >
              Your Listings ({playerListings.length})
            </button>
            <button
              className={`cta-btn ${activeTab === 'sell' ? 'active' : ''}`}
              style={{ filter: activeTab !== 'sell' ? 'grayscale(1)' : 'none', background: 'linear-gradient(180deg, #10b981, #059669)' }}
              onClick={() => setActiveTab('sell')}
            >
              ⚡ Quick Sell &amp; Listing
            </button>
            {onOpenFusion && (
              <button
                className="cta-btn"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #4c1d95)', border: '1px solid #8b5cf6', boxShadow: '0 0 10px #7c3aed55' }}
                onClick={onOpenFusion}
                title="Fuse identical cards to enhance their power"
              >
                ⚗️ Fusion Lab
              </button>
            )}
          </div>{/* end market-tabs */}
        </div>{/* end section-header */}

        {/* BOT MARKET TAB */}
        {activeTab === 'bot' && (
          <div className="showcase-grid-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '24px' }}>
            {botListings.length === 0 && <p style={{ color: '#aaa', textAlign: 'center', gridColumn: '1/-1' }}>No listings available right now.</p>}

            {botListings.map(listing => {
              const isOwned = ownedIds.has(listing.id);
              return (
                <div className="market-listing-card" key={listing.listingId} style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  {!isOwned && <span style={{ background: '#e2521f', color: '#fff', fontSize: '10px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px', marginBottom: '8px' }}>NEW CARD!</span>}

                  <CardContainer card={listing} isThumbnail={true} onClick={() => onSelectCard(listing)} />

                  <div style={{ marginTop: '12px', textAlign: 'center', width: '100%' }}>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#f39c12', marginBottom: '10px' }}>{listing.price.toLocaleString()} Coins</div>
                    <button
                      className="btn-primary"
                      style={{ width: '100%', padding: '8px' }}
                      onClick={() => handleBuy(listing, true)}
                    >
                      Buy Card
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* PLAYER LISTINGS TAB */}
        {activeTab === 'player' && (
          <div className="showcase-grid-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '24px' }}>
            {playerListings.length === 0 && <p style={{ color: '#aaa', textAlign: 'center', gridColumn: '1/-1' }}>You have no active listings.</p>}

            {playerListings.map(listing => (
              <div className="market-listing-card" key={listing.listingId} style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <CardContainer card={listing} isThumbnail={true} onClick={() => onSelectCard(listing)} />

                <div style={{ marginTop: '12px', textAlign: 'center', width: '100%' }}>
                  <div style={{ fontSize: '16px', color: '#aaa', marginBottom: '4px' }}>Listed for</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#f39c12', marginBottom: '10px' }}>{listing.price.toLocaleString()} Coins</div>
                  <button
                    className="btn-secondary"
                    style={{ width: '100%', padding: '8px', background: '#c1401f', color: '#fff', border: 'none' }}
                    onClick={() => onCancelListing(listing.listingId)}
                  >
                    Cancel Listing
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SELL & QUICK SELL CARD TAB */}
        {activeTab === 'sell' && (
          <div style={{ width: '100%' }}>
            {!selectedSellItem ? (
              <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '16px', padding: '24px' }}>

                {/* Search and Filters Bar */}
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <input
                    type="text"
                    placeholder="🔍 Search cards in inventory..."
                    value={sellSearch}
                    onChange={(e) => setSellSearch(e.target.value)}
                    style={{
                      flex: '1',
                      minWidth: '220px',
                      maxWidth: '360px',
                      background: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid rgba(212, 175, 55, 0.4)',
                      borderRadius: '8px',
                      padding: '8px 14px',
                      color: '#fff',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                  />

                  {/* Rarity filter */}
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {['all', 'gold', 'diamond', 'mythic', 'silver', 'bronze'].map(r => (
                      <button
                        key={r}
                        onClick={() => setSellRarityFilter(r)}
                        style={{
                          background: sellRarityFilter === r ? 'var(--gold, #d4a84a)' : 'rgba(255,255,255,0.06)',
                          color: sellRarityFilter === r ? '#000' : '#ccc',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          textTransform: 'uppercase'
                        }}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Batch Selection Action Bar */}
                <div style={{
                  background: 'rgba(15, 23, 42, 0.85)',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  borderRadius: '12px',
                  padding: '12px 18px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                  marginBottom: '20px'
                }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button
                      onClick={handleSelectAll}
                      style={{
                        background: 'rgba(255, 255, 255, 0.08)',
                        color: '#fff',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      {selectedIds.size === filteredSellInventory.length && filteredSellInventory.length > 0 ? 'Deselect All' : 'Select All'}
                    </button>
                    <button
                      onClick={handleSelectDuplicates}
                      style={{
                        background: 'rgba(245, 158, 11, 0.15)',
                        color: '#fbbf24',
                        border: '1px solid rgba(245, 158, 11, 0.3)',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      Select Duplicates
                    </button>
                    {selectedIds.size > 0 && (
                      <button
                        onClick={() => setSelectedIds(new Set())}
                        style={{
                          background: 'transparent',
                          color: '#aaa',
                          border: 'none',
                          padding: '6px 10px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          textDecoration: 'underline'
                        }}
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {/* Sell Action Section */}
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ fontSize: '13px', color: '#aaa' }}>
                      Selected: <strong style={{ color: '#fff' }}>{selectedIds.size}</strong> card(s)
                      {selectedIds.size > 0 && (
                        <span style={{ marginLeft: '8px', color: '#10b981', fontWeight: 'bold' }}>
                          (+{totalSelectedSellValue.toLocaleString()} Coins)
                        </span>
                      )}
                    </div>

                    {/* Quick Sell Button (Direct Cash) */}
                    <button
                      className="btn-primary"
                      disabled={selectedIds.size === 0}
                      onClick={handleQuickSellSelected}
                      style={{
                        background: selectedIds.size > 0 ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(255,255,255,0.1)',
                        color: selectedIds.size > 0 ? '#fff' : '#666',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        fontSize: '13px',
                        cursor: selectedIds.size > 0 ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      ⚡ Quick Sell {selectedIds.size > 0 ? `(${selectedIds.size})` : ''}
                    </button>

                    {/* List 1 card on market button */}
                    {selectedIds.size === 1 && (
                      <button
                        className="btn-secondary"
                        onClick={() => handleStartListing()}
                        style={{
                          background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                          color: '#000',
                          border: 'none',
                          padding: '8px 14px',
                          borderRadius: '8px',
                          fontWeight: 'bold',
                          fontSize: '13px',
                          cursor: 'pointer'
                        }}
                      >
                        🏷️ List on Market
                      </button>
                    )}
                  </div>
                </div>

                {/* Inventory Grid with Checkboxes */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                  gap: '20px',
                  overflowY: 'auto',
                  padding: '4px 4px 10px',
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                }}>
                  {filteredSellInventory.length === 0 && (
                    <p style={{ color: '#aaa', textAlign: 'center', gridColumn: '1/-1', padding: '40px 0' }}>
                      {inventory.length === 0 ? 'Inventory is empty.' : 'No cards match your filter.'}
                    </p>
                  )}

                  {filteredSellInventory.map(item => {
                    const isSelected = selectedIds.has(item.instanceId);
                    const sellVal = getSellValue(item);
                    return (
                      <div
                        key={item.instanceId}
                        style={{
                          position: 'relative',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          background: isSelected ? 'rgba(16, 185, 129, 0.12)' : 'rgba(0,0,0,0.25)',
                          border: isSelected ? '2px solid #10b981' : '1px solid var(--line)',
                          boxShadow: isSelected ? '0 0 14px rgba(16, 185, 129, 0.35)' : 'none',
                          borderRadius: '12px',
                          padding: '12px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '8px',
                          transform: isSelected ? 'translateY(-2px)' : 'none'
                        }}
                        onClick={(e) => handleToggleCardSelection(item.instanceId, e)}
                        className="hover-scale"
                      >
                        {/* Checkbox badge in top-left corner */}
                        <div
                          style={{
                            position: 'absolute',
                            top: '8px',
                            left: '8px',
                            zIndex: 5,
                            width: '24px',
                            height: '24px',
                            borderRadius: '6px',
                            background: isSelected ? '#10b981' : 'rgba(0, 0, 0, 0.7)',
                            border: isSelected ? '2px solid #fff' : '2px solid rgba(255, 255, 255, 0.4)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                          onClick={(e) => handleToggleCardSelection(item.instanceId, e)}
                        >
                          {isSelected && (
                            <span style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>
                          )}
                        </div>

                        {/* Card preview */}
                        <CardContainer card={item} isThumbnail={true} />

                        {/* Card Footer Info */}
                        <div style={{ textAlign: 'center', width: '100%', fontSize: '12px', marginTop: '2px' }}>
                          <div style={{ fontWeight: 'bold', color: 'var(--parchment)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item.name}
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', padding: '0 4px' }}>
                            <span style={{ color: '#10b981', fontWeight: 'bold' }}>+{sellVal} C</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartListing(item);
                              }}
                              style={{
                                background: 'rgba(245, 158, 11, 0.15)',
                                color: '#fbbf24',
                                border: '1px solid rgba(245, 158, 11, 0.3)',
                                borderRadius: '4px',
                                padding: '2px 6px',
                                fontSize: '10px',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                              }}
                              title="List this single card with custom price"
                            >
                              List
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* CUSTOM LISTING FORM */
              <div style={{
                background: 'var(--panel)',
                border: '1px solid var(--line)',
                borderRadius: '16px',
                padding: '32px',
                display: 'flex',
                gap: '48px',
                flexWrap: 'wrap',
                justifyContent: 'center',
                alignItems: 'flex-start'
              }}>
                <div style={{ width: '220px', flexShrink: 0 }}>
                  <CardContainer card={selectedSellItem} isThumbnail={false} />
                  <button
                    style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#aaa', width: '100%', padding: '10px', borderRadius: '8px', marginTop: '14px', cursor: 'pointer', fontSize: '13px', transition: 'all 0.2s' }}
                    onClick={() => setSelectedSellItem(null)}
                  >
                    ← Choose Different Card
                  </button>
                </div>

                <div style={{ flex: '1', minWidth: '280px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '24px' }}>
                  <div>
                    <div style={{ color: '#aaa', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>You are listing</div>
                    <div style={{ color: 'var(--parchment)', fontSize: '20px', fontWeight: 'bold' }}>{selectedSellItem.name}</div>
                    <div style={{ color: '#aaa', fontSize: '13px', marginTop: '4px' }}>{selectedSellItem.ovr} OVR · {selectedSellItem.stars}★ {selectedSellItem.rarity}</div>
                  </div>

                  <div>
                    <label style={{ display: 'block', color: 'var(--parchment)', marginBottom: '10px', fontSize: '14px', fontWeight: 'bold' }}>
                      Listing Price (Coins)
                    </label>
                    <input
                      type="number"
                      value={sellPrice}
                      onChange={(e) => setSellPrice(Number(e.target.value))}
                      min={getSellValue(selectedSellItem)}
                      style={{
                        width: '100%',
                        background: 'rgba(0,0,0,0.5)',
                        border: '1px solid var(--gold, #d4a84a)',
                        color: '#f39c12',
                        fontSize: '28px',
                        padding: '14px 16px',
                        borderRadius: '10px',
                        fontWeight: 'bold',
                        boxSizing: 'border-box',
                        outline: 'none'
                      }}
                    />
                    <div style={{ fontSize: '12px', color: '#aaa', marginTop: '8px' }}>
                      Minimum allowed price: <span style={{ color: '#10b981', fontWeight: 'bold' }}>{getSellValue(selectedSellItem)} Coins</span>
                    </div>
                  </div>

                  <button
                    className="btn-primary"
                    style={{ padding: '16px', fontSize: '16px', width: '100%' }}
                    onClick={handleCreateListing}
                  >
                    Confirm Listing
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <ConfirmModal
        message={confirmMessage}
        onConfirm={() => {
          if (onQuickSell) {
            onQuickSell(Array.from(selectedIds));
          }
          setSelectedIds(new Set());
          setConfirmMessage(null);
        }}
        onCancel={() => setConfirmMessage(null)}
      />
    </section>
  );
}
