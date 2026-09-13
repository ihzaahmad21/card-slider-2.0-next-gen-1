import { describe, it, expect } from 'vitest';
import { PACK_CONFIG } from '../src/config/packs.js';
import { rollSingleCard, isTopTierPull } from '../src/utils/gacha.js';

const mockCards = [
  { id: 1, name: 'Bronze Shinobi', rarityClass: 'bronze', stars: 1, ovr: 65 },
  { id: 2, name: 'Silver Shinobi', rarityClass: 'silver', stars: 3, ovr: 78 },
  { id: 3, name: 'Gold Shinobi A', rarityClass: 'gold', stars: 4, ovr: 88 },
  { id: 4, name: 'Gold Shinobi B', rarityClass: 'gold', stars: 5, ovr: 91 },
  { id: 5, name: 'Diamond Shinobi A', rarityClass: 'diamond', stars: 5, ovr: 94 },
  { id: 6, name: 'Diamond Shinobi B', rarityClass: 'diamond', stars: 5, ovr: 96 },
  { id: 7, name: 'Mythic Shinobi A', rarityClass: 'mythic', stars: 5, ovr: 99 },
  { id: 8, name: 'Mythic Shinobi B', rarityClass: 'mythic', stars: 5, ovr: 100 }
];

describe('Gacha Pack Configuration', () => {
  it('Gold pack is correctly configured', () => {
    const gold = PACK_CONFIG.gold;
    expect(gold).toBeDefined();
    expect(gold.cost).toBe(1000);
    expect(gold.description).toBe('Contains Kage & Legendary Shinobi cards with Gold and Diamond potential.');
    expect(gold.rarityRates).toEqual([
      { rarity: 'gold', rate: 80, threshold: 80 },
      { rarity: 'diamond', rate: 20, threshold: 100 }
    ]);
  });

  it('Premium pack is correctly configured', () => {
    const premium = PACK_CONFIG.premium;
    expect(premium).toBeDefined();
    expect(premium.cost).toBe(10000);
    expect(premium.image).toBe('/images/case/premium.webp');
    expect(premium.description).toBe('Contains God-tier Shinobi cards. Guaranteed Diamond or Mythic rarity!');
    expect(premium.rarityRates).toEqual([
      { rarity: 'diamond', rate: 80, threshold: 80 },
      { rarity: 'mythic', rate: 20, threshold: 100 }
    ]);
  });
});

describe('Gold Pack Rolling Logic', () => {
  it('rolls ONLY Gold or Diamond cards', () => {
    for (let i = 0; i < 200; i++) {
      const card = rollSingleCard('gold', mockCards, false, false);
      expect(['gold', 'diamond']).toContain(card.rarityClass);
    }
  });

  it('guarantees Diamond card when isPity is true', () => {
    for (let i = 0; i < 20; i++) {
      const card = rollSingleCard('gold', mockCards, true, false);
      expect(card.rarityClass).toBe('diamond');
    }
  });

  it('detects top-tier pull correctly for pity reset', () => {
    const goldCard = mockCards.find(c => c.rarityClass === 'gold');
    const diamondCard = mockCards.find(c => c.rarityClass === 'diamond');
    expect(isTopTierPull('gold', goldCard)).toBe(false);
    expect(isTopTierPull('gold', diamondCard)).toBe(true);
  });
});

describe('Premium Pack Rolling Logic', () => {
  it('rolls ONLY Diamond or Mythic cards', () => {
    for (let i = 0; i < 200; i++) {
      const card = rollSingleCard('premium', mockCards, false, false);
      expect(['diamond', 'mythic']).toContain(card.rarityClass);
    }
  });

  it('guarantees Mythic card when isPity is true', () => {
    for (let i = 0; i < 20; i++) {
      const card = rollSingleCard('premium', mockCards, true, false);
      expect(card.rarityClass).toBe('mythic');
    }
  });

  it('detects top-tier pull correctly for pity reset', () => {
    const diamondCard = mockCards.find(c => c.rarityClass === 'diamond');
    const mythicCard = mockCards.find(c => c.rarityClass === 'mythic');
    expect(isTopTierPull('premium', diamondCard)).toBe(false);
    expect(isTopTierPull('premium', mythicCard)).toBe(true);
  });
});
