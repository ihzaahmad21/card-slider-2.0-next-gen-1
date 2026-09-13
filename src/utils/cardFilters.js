// cardFilters.js
// Logic filter kartu yang dipakai bersama oleh Inventory, ShowcaseModal, dan CodexView.
// Tujuannya biar rule filter (rarity, search, category tag, team, village, clan)
// gak perlu ditulis ulang di 3 tempat berbeda.

import { getCharacterMeta } from './characterMeta.js';

export const RARITY_OPTIONS = [
  { value: 'all', label: 'ALL' },
  { value: 'gold', label: 'GOLD' },
  { value: 'diamond', label: 'DIAMOND' },
  { value: 'mythic', label: 'MYTHIC' },
  { value: 'silver', label: 'SILVER' },
  { value: 'bronze', label: 'BRONZE' }
];

export const CATEGORY_OPTIONS = [
  { value: 'jinchuriki', label: 'Jinchuriki' },
  { value: 'kage', label: 'Kage' },
  { value: 'genin', label: 'Genin' },
  { value: 'warArc', label: 'War Arc' },
  { value: 'godLevel', label: 'God Level' },
  { value: 'edoTensei', label: 'Edo Tensei' },
  { value: 'awakening', label: 'Awakening' }
];

export const ELEMENT_OPTIONS = [
  { value: 'all', label: 'ALL' },
  { value: 'fire', label: '🔥 Fire' },
  { value: 'wind', label: '🌪️ Wind' },
  { value: 'lightning', label: '⚡ Lightning' },
  { value: 'earth', label: '🪨 Earth' },
  { value: 'water', label: '💧 Water' },
  { value: 'yin', label: '☯️ Yin-Yang' },
  { value: 'neutral', label: '⚪ Neutral' }
];

// Default filter state — spread ini di useState tiap view
export function createDefaultCardFilterState() {
  return {
    rarity: 'all',
    searchTerm: '',
    categories: [],  // multi-select, mis. ['jinchuriki', 'kage']
    teams: [],       // multi-select, mis. ['Akatsuki']
    village: 'all',
    clan: 'all',
    element: 'all'
  };
}

// Toggle satu value di dalam array multi-select (categories / teams)
export function toggleArrayValue(arr, value) {
  return arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value];
}

// Kumpulkan daftar unique team & village yang benar-benar ada di dataset,
// dipakai buat generate opsi dropdown/pill secara dinamis.
export function collectFilterVocabulary(cards) {
  const teamSet = new Set();
  const villageSet = new Set();
  const clanSet = new Set();

  (cards || []).forEach(card => {
    (card.team || []).forEach(t => teamSet.add(t));
    if (card.village) villageSet.add(card.village);
    if (card.clan) clanSet.add(card.clan);
  });

  return {
    teams: Array.from(teamSet).sort(),
    villages: Array.from(villageSet).sort(),
    clans: Array.from(clanSet).sort()
  };
}

// Fungsi utama: cek apakah satu kartu lolos filter yang sedang aktif
export function matchesCardFilters(card, filterState) {
  const { rarity, searchTerm, categories, teams, village, clan, element } = filterState;

  if (rarity !== 'all' && card.rarityClass !== rarity) return false;

  if (element && element !== 'all') {
    const cardElement = card.element || (card.id ? getCharacterMeta(card.id)?.element : null) || 'neutral';
    if (cardElement !== element) return false;
  }

  if (searchTerm && searchTerm.trim()) {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      card.name?.toLowerCase().includes(q) ||
      card.jutsu?.toLowerCase().includes(q);
    if (!matchesSearch) return false;
  }

  if (categories && categories.length > 0) {
    const cardTags = card.tags || [];
    const hasAllCategories = categories.every(cat => cardTags.includes(cat));
    if (!hasAllCategories) return false;
  }

  if (teams && teams.length > 0) {
    const cardTeams = card.team || [];
    const hasAnyTeam = teams.some(t => cardTeams.includes(t));
    if (!hasAnyTeam) return false;
  }

  if (village !== 'all' && card.village !== village) return false;

  if (clan !== 'all' && card.clan !== clan) return false;

  return true;
}

// Terapkan seluruh filter ke satu array kartu
export function filterCards(cards, filterState) {
  if (!cards) return [];
  return cards.filter(card => matchesCardFilters(card, filterState));
}
