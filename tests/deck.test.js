import { expect, test } from 'vitest';
import {
  toggleCardInDeck,
  sanitizeDeck,
  sanitizeAllPresets,
  calculateDeckStats,
  normalizeDeckPresets,
  createDefaultPresets
} from '../src/utils/deck.js';
import { getBaseCharacterName } from '../src/utils/cards.js';
import { makeCard, makeInventoryItem } from './fixtures.js';

test('toggleCardInDeck adds and removes correctly', () => {
  let deck = [];
  deck = toggleCardInDeck(deck, 'inst-1');
  expect(deck).toContain('inst-1');

  deck = toggleCardInDeck(deck, 'inst-1');
  expect(deck).not.toContain('inst-1');
});

test('toggleCardInDeck respects DECK_SIZE max 6', () => {
  let deck = ['inst-1', 'inst-2', 'inst-3', 'inst-4', 'inst-5', 'inst-6'];
  deck = toggleCardInDeck(deck, 'inst-7');
  expect(deck).not.toContain('inst-7');
  expect(deck.length).toBe(6);
});

test('sanitizeDeck removes instances not in inventory', () => {
  const deck = ['inst-1', 'inst-2', 'inst-stale'];
  const inventory = [
    makeInventoryItem(makeCard(1, 'Naruto', 'bronze', 1, 50), 'inst-1'),
    makeInventoryItem(makeCard(2, 'Sasuke', 'bronze', 1, 50), 'inst-2')
  ];
  
  const cleanDeck = sanitizeDeck(deck, inventory);
  expect(cleanDeck).toContain('inst-1');
  expect(cleanDeck).toContain('inst-2');
  expect(cleanDeck).not.toContain('inst-stale');
});

test('normalizeDeckPresets seamlessly migrates legacy array to Preset 1', () => {
  const legacyDeck = ['inst-1', 'inst-2'];
  const presets = normalizeDeckPresets(legacyDeck);

  expect(presets).toHaveLength(3);
  expect(presets[0].id).toBe('preset-1');
  expect(presets[0].deck).toEqual(['inst-1', 'inst-2']);
  expect(presets[1].deck).toEqual([]);
  expect(presets[2].deck).toEqual([]);
});

test('sanitizeAllPresets removes stale card ids across all 3 presets', () => {
  const presets = [
    { id: 'preset-1', name: 'Preset 1', deck: ['inst-1', 'inst-stale'] },
    { id: 'preset-2', name: 'Preset 2', deck: ['inst-2', 'inst-stale'] },
    { id: 'preset-3', name: 'Preset 3', deck: ['inst-stale'] }
  ];
  const inventory = [
    makeInventoryItem(makeCard(1, 'Naruto', 'bronze', 1, 50), 'inst-1'),
    makeInventoryItem(makeCard(2, 'Sasuke', 'bronze', 1, 50), 'inst-2')
  ];

  const cleaned = sanitizeAllPresets(presets, inventory);
  expect(cleaned[0].deck).toEqual(['inst-1']);
  expect(cleaned[1].deck).toEqual(['inst-2']);
  expect(cleaned[2].deck).toEqual([]);
});

test('calculateDeckStats computes correct totals', () => {
  const inventory = [
    makeInventoryItem(makeCard(1, 'A', 'bronze', 1, 50), 'inst-1'),
    makeInventoryItem(makeCard(2, 'B', 'bronze', 1, 100), 'inst-2')
  ];
  const deck = ['inst-1', 'inst-2'];
  
  const stats = calculateDeckStats(deck, inventory);
  expect(stats.totalOvr).toBe(150);
  expect(stats.avgOvr).toBe(75);
});

test('getBaseCharacterName correctly resolves base names across all character variations', () => {
  // Naruto variations
  expect(getBaseCharacterName('Naruto Uzumaki (Six Paths Mode)')).toBe('Naruto Uzumaki');
  expect(getBaseCharacterName('Naruto Baryon Mode')).toBe('Naruto Uzumaki');
  expect(getBaseCharacterName('Naruto Uzumaki (KCM Link)')).toBe('Naruto Uzumaki');
  
  // Sasuke variations
  expect(getBaseCharacterName('Sasuke (Part 1)')).toBe('Sasuke Uchiha');
  expect(getBaseCharacterName('Sasuke Hebi')).toBe('Sasuke Uchiha');
  expect(getBaseCharacterName('Sasuke Rinne Sharinggan')).toBe('Sasuke Uchiha');
  expect(getBaseCharacterName('Sasuke Uchiha (EMS / War Arc)')).toBe('Sasuke Uchiha');
  
  // Suffix variations without parenthesis
  expect(getBaseCharacterName('Deidara Reanimation')).toBe('Deidara');
  expect(getBaseCharacterName('Deidara')).toBe('Deidara');
  expect(getBaseCharacterName('Sarada Awakening Mode')).toBe('Sarada Uchiha');
  expect(getBaseCharacterName('Sarada Uchiha')).toBe('Sarada Uchiha');
  expect(getBaseCharacterName('Boruto Karma Progression')).toBe('Boruto Uzumaki');
  expect(getBaseCharacterName('Boruto')).toBe('Boruto Uzumaki');
  expect(getBaseCharacterName('Madara Reanimation Resolved')).toBe('Madara Uchiha');
  expect(getBaseCharacterName('Madara Uchiha (Six Paths)')).toBe('Madara Uchiha');
  expect(getBaseCharacterName('Kakashi Double Sharinggan')).toBe('Kakashi Hatake');
  expect(getBaseCharacterName('Kakashi Hatake (Jonin)')).toBe('Kakashi Hatake');
  expect(getBaseCharacterName('Itachi Reanimation')).toBe('Itachi Uchiha');
  expect(getBaseCharacterName('Itachi Uchiha (Akatsuki)')).toBe('Itachi Uchiha');
  expect(getBaseCharacterName('Sakura (Byakugo)')).toBe('Sakura Haruno');
  expect(getBaseCharacterName('Sakura (Part 1)')).toBe('Sakura Haruno');
});
