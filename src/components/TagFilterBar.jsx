import React, { useMemo, useState } from 'react';
import {
  RARITY_OPTIONS,
  CATEGORY_OPTIONS,
  ELEMENT_OPTIONS,
  collectFilterVocabulary,
  toggleArrayValue
} from '../utils/cardFilters.js';

// Filter bar yang dipakai bersama di Inventory, ShowcaseModal, dan CodexView.
// Props:
//   cards         : array kartu master (buat generate opsi team/village/clan otomatis)
//   filterState   : object { rarity, searchTerm, categories, teams, village, clan }
//   onChange      : (nextFilterState) => void
export default function TagFilterBar({ cards, filterState, onChange }) {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const vocab = useMemo(() => collectFilterVocabulary(cards), [cards]);

  const update = (patch) => onChange({ ...filterState, ...patch });

  return (
    <div className="tag-filter-bar">
      {/* Rarity pills — tetap gaya lama */}
      <div className="filter-container">
        {RARITY_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            data-filter={value}
            className={`filter-btn ${filterState.rarity === value ? 'active' : ''}`}
            onClick={() => update({ rarity: value })}
          >
            {label}
          </button>
        ))}

        <button
          className={`filter-btn ${advancedOpen ? 'active' : ''}`}
          onClick={() => setAdvancedOpen(prev => !prev)}
          style={{ marginLeft: '8px' }}
        >
          {advancedOpen ? '▲ Filter Lanjutan' : '▼ Filter Lanjutan'}
        </button>
      </div>

      {advancedOpen && (
        <div
          className="tag-filter-advanced"
          style={{
            marginTop: '14px',
            padding: '14px',
            background: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid rgba(212, 175, 55, 0.25)',
            borderRadius: '10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          {/* Chakra Nature Affinity filter */}
          <div>
            <div style={{ fontSize: '11px', color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
              Chakra Nature Affinity
            </div>
            <div className="filter-container" style={{ justifyContent: 'flex-start' }}>
              {ELEMENT_OPTIONS.map(({ value, label }) => {
                const active = (filterState.element || 'all') === value;
                return (
                  <button
                    key={value}
                    className={`filter-btn ${active ? 'active' : ''}`}
                    onClick={() => update({ element: value })}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category tags (multi-select) */}
          <div>
            <div style={{ fontSize: '11px', color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
              Kategori
            </div>
            <div className="filter-container" style={{ justifyContent: 'flex-start' }}>
              {CATEGORY_OPTIONS.map(({ value, label }) => {
                const active = filterState.categories.includes(value);
                return (
                  <button
                    key={value}
                    className={`filter-btn ${active ? 'active' : ''}`}
                    onClick={() => update({ categories: toggleArrayValue(filterState.categories, value) })}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Team tags (multi-select, dinamis dari data) */}
          {vocab.teams.length > 0 && (
            <div>
              <div style={{ fontSize: '11px', color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
                Tim / Organisasi
              </div>
              <div className="filter-container" style={{ justifyContent: 'flex-start' }}>
                {vocab.teams.map(team => {
                  const active = filterState.teams.includes(team);
                  return (
                    <button
                      key={team}
                      className={`filter-btn ${active ? 'active' : ''}`}
                      onClick={() => update({ teams: toggleArrayValue(filterState.teams, team) })}
                    >
                      {team}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Village + Clan dropdowns (single-select) */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 180px' }}>
              <div style={{ fontSize: '11px', color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
                Asal Desa
              </div>
              <select
                value={filterState.village}
                onChange={(e) => update({ village: e.target.value })}
                style={selectStyle}
              >
                <option value="all">Semua Desa</option>
                {vocab.villages.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>

            <div style={{ flex: '1 1 180px' }}>
              <div style={{ fontSize: '11px', color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
                Clan
              </div>
              <select
                value={filterState.clan}
                onChange={(e) => update({ clan: e.target.value })}
                style={selectStyle}
              >
                <option value="all">Semua Clan</option>
                {vocab.clans.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const selectStyle = {
  width: '100%',
  background: 'rgba(0, 0, 0, 0.4)',
  border: '1px solid rgba(212, 175, 55, 0.4)',
  borderRadius: '8px',
  padding: '8px 10px',
  color: '#fff',
  fontSize: '13px',
  outline: 'none',
  boxSizing: 'border-box'
};
