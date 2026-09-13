import React, { useState, useMemo } from 'react';
import { getBaseCharacterName, getCardImageSrc, RARITY_LABELS } from '../utils/cards.js';
import { CATEGORY_LABELS } from '../utils/characterMeta.js';
import { getSummonDetails } from '../utils/cardData.js';
import './CharacterLoreView.css';

export default function CharacterLoreView({ cards = [], inventory = [], onSelectCard, onSwitchToCodex }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVillage, setSelectedVillage] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');
  const [activeCharacterName, setActiveCharacterName] = useState(null);

  // Set of owned card IDs in inventory
  const ownedCardIds = useMemo(() => {
    return new Set(inventory.map(item => item.id));
  }, [inventory]);

  // Group all master cards by Base Character Name
  const characterProfiles = useMemo(() => {
    const map = new Map();

    cards.forEach(card => {
      const baseName = getBaseCharacterName(card.name);
      if (!map.has(baseName)) {
        map.set(baseName, {
          name: baseName,
          cards: [],
          villages: new Set(),
          clans: new Set(),
          teams: new Set(),
          tags: new Set(),
          jutsus: new Set(),
          summons: new Set()
        });
      }

      const profile = map.get(baseName);
      profile.cards.push(card);

      if (card.village) profile.villages.add(card.village);
      if (card.clan) profile.clans.add(card.clan);
      if (Array.isArray(card.team)) {
        card.team.forEach(t => t && profile.teams.add(t));
      } else if (typeof card.team === 'string' && card.team) {
        profile.teams.add(card.team);
      }

      if (Array.isArray(card.tags)) {
        card.tags.forEach(t => t && profile.tags.add(t));
      }

      if (card.jutsu && card.jutsu !== 'Secret Ninja Art') {
        profile.jutsus.add(card.jutsu);
      }

      if (Array.isArray(card.summons)) {
        card.summons.forEach(s => s && profile.summons.add(s));
      } else if (card.summon) {
        profile.summons.add(card.summon);
      }
    });

    const result = Array.from(map.values()).map(char => {
      // Sort variations by OVR descending
      const sortedCards = [...char.cards].sort((a, b) => (b.ovr || 0) - (a.ovr || 0));
      const topCard = sortedCards[0];
      const ownedCount = sortedCards.filter(c => ownedCardIds.has(c.id)).length;
      const primaryVillage = Array.from(char.villages)[0] || 'Unknown';
      const primaryClan = Array.from(char.clans)[0] || 'Unknown';

      return {
        name: char.name,
        topCard,
        variations: sortedCards,
        village: primaryVillage,
        villages: Array.from(char.villages),
        clan: primaryClan,
        clans: Array.from(char.clans),
        teams: Array.from(char.teams),
        tags: Array.from(char.tags),
        jutsus: Array.from(char.jutsus),
        summons: Array.from(char.summons),
        ownedCount,
        totalVariations: sortedCards.length,
        maxOvr: topCard?.ovr || 70
      };
    });

    // Sort character profiles alphabetically by name
    return result.sort((a, b) => a.name.localeCompare(b.name));
  }, [cards, ownedCardIds]);

  // Unique list of villages for filter
  const allVillages = useMemo(() => {
    const set = new Set();
    characterProfiles.forEach(char => {
      char.villages.forEach(v => set.add(v));
    });
    return Array.from(set).sort();
  }, [characterProfiles]);

  // Unique list of tags for filter
  const allTags = useMemo(() => {
    const set = new Set();
    characterProfiles.forEach(char => {
      char.tags.forEach(t => set.add(t));
    });
    return Array.from(set).sort();
  }, [characterProfiles]);

  // Filtered characters
  const filteredCharacters = useMemo(() => {
    return characterProfiles.filter(char => {
      // Search filter
      if (searchTerm.trim()) {
        const q = searchTerm.trim().toLowerCase();
        const matchesName = char.name.toLowerCase().includes(q);
        const matchesClan = char.clans.some(c => c.toLowerCase().includes(q));
        const matchesVillage = char.villages.some(v => v.toLowerCase().includes(q));
        const matchesTeam = char.teams.some(t => t.toLowerCase().includes(q));
        const matchesJutsu = char.jutsus.some(j => j.toLowerCase().includes(q));
        const matchesTag = char.tags.some(t => (CATEGORY_LABELS[t] || t).toLowerCase().includes(q));
        const matchesVariations = char.variations.some(v => v.name.toLowerCase().includes(q));

        if (!matchesName && !matchesClan && !matchesVillage && !matchesTeam && !matchesJutsu && !matchesTag && !matchesVariations) {
          return false;
        }
      }

      // Village filter
      if (selectedVillage !== 'all') {
        if (!char.villages.includes(selectedVillage)) {
          return false;
        }
      }

      // Tag filter
      if (selectedTag !== 'all') {
        if (!char.tags.includes(selectedTag)) {
          return false;
        }
      }

      return true;
    });
  }, [characterProfiles, searchTerm, selectedVillage, selectedTag]);

  // Active selected character for detail dossier
  const activeCharacter = useMemo(() => {
    if (!activeCharacterName) return null;
    return characterProfiles.find(c => c.name === activeCharacterName) || null;
  }, [characterProfiles, activeCharacterName]);

  return (
    <section className="view active character-lore-view" id="view-lore">
      <div className="lore-container">
        
        {/* Header Banner */}
        <div className="lore-header">
          <span className="lore-subtitle">Encyclopedia & Shinobi Archives</span>
          <h2 className="lore-title">Character Codex</h2>
          <p className="lore-desc">
            Explore the legendary shinobi database, vital records, mastered jutsu, summoned entities, and all unlocked card variations.
          </p>

          {onSwitchToCodex && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '14px' }}>
              <button
                type="button"
                onClick={onSwitchToCodex}
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
                🃏 Card Codex
              </button>
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
                📜 Character Lore Wiki
              </button>
            </div>
          )}
        </div>

        {/* Search & Filter Bar */}
        <div className="lore-filter-panel">
          <div className="lore-search-box">
            <span className="lore-search-icon">🔍</span>
            <input
              type="text"
              className="lore-search-input"
              placeholder="Search by shinobi name, clan, village, jutsu, team..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                className="lore-search-clear"
                onClick={() => setSearchTerm('')}
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          <div className="lore-filter-row">
            {/* Village Filter */}
            <div className="lore-select-group">
              <span className="lore-select-label">Village:</span>
              <select
                className="lore-select"
                value={selectedVillage}
                onChange={(e) => setSelectedVillage(e.target.value)}
              >
                <option value="all">All Villages ({allVillages.length})</option>
                {allVillages.map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>

            {/* Category / Tag Filter */}
            <div className="lore-select-group">
              <span className="lore-select-label">Category:</span>
              <select
                className="lore-select"
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
              >
                <option value="all">All Categories</option>
                {allTags.map(t => (
                  <option key={t} value={t}>{CATEGORY_LABELS[t] || t}</option>
                ))}
              </select>
            </div>

            <div className="lore-count-badge">
              {filteredCharacters.length} Shinobi Found
            </div>
          </div>
        </div>

        {/* Character Grid */}
        <div className="lore-character-grid">
          {filteredCharacters.length === 0 ? (
            <div className="lore-empty-state">
              No shinobi profiles found matching your search and filters.
            </div>
          ) : (
            filteredCharacters.map(char => {
              const isSelected = activeCharacterName === char.name;
              const hasOwnedAll = char.ownedCount === char.totalVariations;

              return (
                <div
                  key={char.name}
                  className={`lore-character-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => setActiveCharacterName(char.name)}
                >
                  <div className="lore-card-header">
                    <div className="lore-avatar-wrap">
                      <img
                        src={getCardImageSrc(char.topCard)}
                        alt={char.name}
                        className="lore-avatar"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'images/1 shukaku.webp';
                        }}
                      />
                      <div className="lore-top-ovr">{char.maxOvr}</div>
                    </div>

                    <div className="lore-char-meta">
                      <h3 className="lore-char-name">{char.name}</h3>
                      <div className="lore-char-sub">
                        {char.village !== 'Unknown' && (
                          <span className="lore-badge-village">{char.village}</span>
                        )}
                        {char.clan !== 'Unknown' && (
                          <span className="lore-badge-clan">{char.clan} Clan</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Tags / Affiliations */}
                  <div className="lore-pill-list">
                    {char.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="lore-pill tag">
                        {CATEGORY_LABELS[tag] || tag}
                      </span>
                    ))}
                    {char.teams.slice(0, 1).map(team => (
                      <span key={team} className="lore-pill team">
                        {team}
                      </span>
                    ))}
                  </div>

                  {/* Variations Progress */}
                  <div className="lore-progress-footer">
                    <div className="lore-prog-text">
                      <span>Card Variations</span>
                      <span className={hasOwnedAll ? 'complete' : ''}>
                        {char.ownedCount} / {char.totalVariations} Owned
                      </span>
                    </div>
                    <div className="lore-prog-bar">
                      <div
                        className="lore-prog-fill"
                        style={{ width: `${(char.ownedCount / char.totalVariations) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Detailed Character Lore Modal / Dossier */}
        {activeCharacter && (
          <div className="lore-modal-backdrop" onClick={() => setActiveCharacterName(null)}>
            <div className="lore-dossier" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="lore-close-btn"
                onClick={() => setActiveCharacterName(null)}
                title="Close dossier"
              >
                ✕
              </button>

              <div className="lore-dossier-layout">
                {/* Left Side: Avatar & Vital Info */}
                <div className="lore-dossier-sidebar">
                  <div className="lore-dossier-art-frame">
                    <img
                      src={getCardImageSrc(activeCharacter.topCard)}
                      alt={activeCharacter.name}
                      className="lore-dossier-art"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'images/1 shukaku.webp';
                      }}
                    />
                    <div className="lore-dossier-ovr-tag">
                      Peak OVR: <strong>{activeCharacter.maxOvr}</strong>
                    </div>
                  </div>

                  <h2 className="lore-dossier-title">{activeCharacter.name}</h2>

                  <div className="lore-vital-list">
                    <div className="lore-vital-item">
                      <span className="vital-label">Village / Affiliation</span>
                      <span className="vital-value">{activeCharacter.villages.join(', ') || 'Unknown'}</span>
                    </div>
                    <div className="lore-vital-item">
                      <span className="vital-label">Clan</span>
                      <span className="vital-value">{activeCharacter.clans.join(', ') || 'Unknown'}</span>
                    </div>
                    {activeCharacter.teams.length > 0 && (
                      <div className="lore-vital-item">
                        <span className="vital-label">Teams / Groups</span>
                        <span className="vital-value">{activeCharacter.teams.join(', ')}</span>
                      </div>
                    )}
                    {activeCharacter.tags.length > 0 && (
                      <div className="lore-vital-item">
                        <span className="vital-label">Categories</span>
                        <div className="lore-vital-pills">
                          {activeCharacter.tags.map(t => (
                            <span key={t} className="lore-pill tag">
                              {CATEGORY_LABELS[t] || t}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Side: Jutsu, Summons & Card Variations */}
                <div className="lore-dossier-content">
                  
                  {/* Mastered Jutsu Section */}
                  <div className="lore-section">
                    <h3 className="lore-section-title">
                      <span>📜 Mastered Jutsu & Signature Arts</span>
                    </h3>
                    <div className="lore-jutsu-grid">
                      {activeCharacter.jutsus.length > 0 ? (
                        activeCharacter.jutsus.map((jutsu, idx) => (
                          <div key={idx} className="lore-jutsu-item">
                            <span className="jutsu-icon">✦</span>
                            <span className="jutsu-name">{jutsu}</span>
                          </div>
                        ))
                      ) : (
                        <div className="lore-none">No signature jutsu documented.</div>
                      )}
                    </div>
                  </div>

                  {/* Contract Summons Section */}
                  {activeCharacter.summons.length > 0 && (
                    <div className="lore-section">
                      <h3 className="lore-section-title">
                        <span>⛩️ Contract Summons</span>
                      </h3>
                      <div className="lore-summon-list">
                        {activeCharacter.summons.map((summonKey, idx) => {
                          const sDetail = getSummonDetails(summonKey);
                          return (
                            <div key={idx} className="lore-summon-card">
                              <span className="summon-icon">🐲</span>
                              <div>
                                <div className="summon-name">{sDetail.name || summonKey}</div>
                                {sDetail.desc && <div className="summon-desc">{sDetail.desc}</div>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Card Variations Showcase */}
                  <div className="lore-section">
                    <div className="lore-section-header-row">
                      <h3 className="lore-section-title">
                        <span>🃏 All Card Variations ({activeCharacter.variations.length})</span>
                      </h3>
                      <span className="lore-variations-hint">Click a card to inspect stats</span>
                    </div>

                    <div className="lore-variations-grid">
                      {activeCharacter.variations.map(variation => {
                        const isOwned = ownedCardIds.has(variation.id);
                        const rarityLabel = RARITY_LABELS[variation.rarityClass] || 'BRONZE';

                        return (
                          <div
                            key={variation.id}
                            className={`lore-var-card ${!isOwned ? 'uncollected' : ''}`}
                            onClick={() => onSelectCard && onSelectCard(variation)}
                            title={isOwned ? `Inspect ${variation.name}` : `Uncollected card: ${variation.name}`}
                          >
                            <div className="lore-var-thumb-wrap">
                              <img
                                src={getCardImageSrc(variation)}
                                alt={variation.name}
                                className="lore-var-thumb"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = 'images/1 shukaku.webp';
                                }}
                              />
                              <div className="lore-var-ovr">{variation.ovr}</div>
                              {!isOwned && <div className="lore-lock-badge">🔒 Locked</div>}
                            </div>

                            <div className="lore-var-info">
                              <div className="lore-var-name">{variation.name}</div>
                              <div className="lore-var-sub">
                                <span className={`rarity-${variation.rarityClass}`}>{rarityLabel}</span>
                                <span>{'★'.repeat(variation.stars || 1)}</span>
                              </div>
                              <div className="lore-var-jutsu">{variation.jutsu}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
