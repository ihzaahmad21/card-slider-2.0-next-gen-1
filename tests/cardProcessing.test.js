import { describe, it, expect } from 'vitest';
import {
  PACK_CONFIG,
  buildInventoryInstance,
  clamp,
  getJutsuForCharacter,
  getSummonForCharacter,
  processRawCards
} from '../src/App.jsx';

describe('clamp', () => {
  it('returns the value when inside the range', () => {
    expect(clamp(70, 50, 99)).toBe(70);
  });

  it('clamps to the bounds', () => {
    expect(clamp(10, 50, 99)).toBe(50);
    expect(clamp(150, 50, 99)).toBe(99);
    expect(clamp(50, 50, 99)).toBe(50);
    expect(clamp(99, 50, 99)).toBe(99);
  });
});

describe('PACK_CONFIG', () => {
  it('exposes cost, rarity filter and cumulative star thresholds per pack', () => {
    expect(Object.keys(PACK_CONFIG)).toEqual(['bronze', 'silver', 'gold']);
    expect(PACK_CONFIG.bronze.cost).toBe(100);
    expect(PACK_CONFIG.silver.cost).toBe(500);
    expect(PACK_CONFIG.gold.cost).toBe(1000);
    expect(PACK_CONFIG.bronze.rarityFilter).toBe('BRONZE');
    expect(PACK_CONFIG.silver.rarityFilter).toBe('SILVER RARE');
    expect(PACK_CONFIG.gold.rarityFilter).toBe('GOLD RARE');
  });

  it('ends every star rate table at a 100 threshold', () => {
    for (const config of Object.values(PACK_CONFIG)) {
      const thresholds = config.starRates.map(r => r.threshold);
      expect(thresholds.at(-1)).toBe(100);
      expect([...thresholds].sort((a, b) => a - b)).toEqual(thresholds);
    }
  });
});

describe('buildInventoryInstance', () => {
  it('copies the card and adds inventory bookkeeping fields', () => {
    const card = { id: 7, name: 'Kakashi', ovr: 91 };
    const instance = buildInventoryInstance(card);

    expect(instance).toMatchObject({ id: 7, name: 'Kakashi', ovr: 91, quantity: 1, plusLevel: 0 });
    expect(instance.instanceId.startsWith('7-')).toBe(true);
  });

  it('honours an explicit plus level and leaves the source card untouched', () => {
    const card = { id: 3, name: 'Itachi' };
    const instance = buildInventoryInstance(card, 4);

    expect(instance.plusLevel).toBe(4);
    expect(card).toEqual({ id: 3, name: 'Itachi' });
  });

  it('generates unique instance ids for repeated pulls of the same card', () => {
    const card = { id: 3, name: 'Itachi' };
    const ids = new Set(Array.from({ length: 50 }, () => buildInventoryInstance(card).instanceId));

    expect(ids.size).toBe(50);
  });
});

describe('getJutsuForCharacter', () => {
  it.each([
    ['Naruto Baryon Mode', 'Rasengan / Baryon Tail'],
    ['Naruto Sage Mode', 'Sage Art: Rasenshuriken'],
    ['Naruto Six Paths', 'Truth-Seeking Orbs'],
    ['Naruto Bijuu Mode', 'Tailed Beast Bomb'],
    ['Sasuke Rinnegan', "Indra's Arrow / Chidori"],
    ['Sasuke Uchiha', 'Fire Release / Sharingan Genjutsu'],
    ['Kakashi Hatake', 'Raikiri / Kamui'],
    ['Itachi Uchiha', 'Tsukuyomi / Amaterasu'],
    ['Madara Uchiha', 'Tengai Shinsei / Susanoo'],
    ['Gaara', 'Sand Tsunami / Shield'],
    ['Might Guy', 'Night Guy / Morning Peacock'],
    ['Hashirama Senju', 'Wood Style: Sage Art'],
    ['Minato Namikaze', 'Flying Raijin / Rasengan']
  ])('maps %s to its signature jutsu', (name, expected) => {
    expect(getJutsuForCharacter(name)).toBe(expected);
  });

  it('is case insensitive', () => {
    expect(getJutsuForCharacter('KAKASHI HATAKE')).toBe('Raikiri / Kamui');
  });

  it('falls back for unknown or missing names', () => {
    expect(getJutsuForCharacter('Konohamaru')).toBe('Secret Ninja Art');
    expect(getJutsuForCharacter(undefined)).toBe('Secret Ninja Art');
    expect(getJutsuForCharacter('')).toBe('Secret Ninja Art');
  });
});

describe('getSummonForCharacter', () => {
  it.each([
    ['Naruto Uzumaki', 'Nine-Tails Kurama'],
    ['Sasuke Uchiha', 'Susanoo Armor'],
    ['Kakashi Hatake', 'Ninken Hounds'],
    ['Itachi Uchiha', 'Crow Clone'],
    ['Gaara of the Sand', 'Shukaku Sand'],
    ['Jiraiya', 'Toad Gamabunta'],
    ['Minato Namikaze', 'Toad Gamabunta'],
    ['Tsunade', 'Katsuyu Slug'],
    ['Sakura Haruno', 'Katsuyu Slug'],
    ['Orochimaru', 'Giant Snake Manda']
  ])('maps %s to its summon', (name, expected) => {
    expect(getSummonForCharacter(name)).toBe(expected);
  });

  it('falls back to None for unknown or missing names', () => {
    expect(getSummonForCharacter('Shikamaru')).toBe('None');
    expect(getSummonForCharacter(undefined)).toBe('None');
  });
});

describe('processRawCards', () => {
  const raw = (overrides = {}) => ({
    id: 1,
    name: 'Test Ninja',
    ovr: 80,
    rarity: 'BRONZE',
    image_url: 'images/test.webp',
    ...overrides
  });

  it('preserves the authored id, name, ovr and rarity string', () => {
    const [card] = processRawCards([raw({ id: 42, name: 'Sai', ovr: 77, rarity: 'SILVER RARE' })]);

    expect(card).toMatchObject({ id: 42, name: 'Sai', ovr: 77, rarity: 'SILVER RARE' });
  });

  it('normalises image paths to root-relative urls', () => {
    const [fromPublic] = processRawCards([raw({ image_url: 'public/images/a.webp' })]);
    const [fromLeadingSlashPublic] = processRawCards([raw({ image_url: '/public/images/a.webp' })]);
    const [fromRelative] = processRawCards([raw({ image_url: 'images/a.webp' })]);
    const [fromAbsolute] = processRawCards([raw({ image_url: '/images/a.webp' })]);
    const [fromRemote] = processRawCards([raw({ image_url: 'https://cdn.test/a.webp' })]);

    expect(fromPublic.img).toBe('/images/a.webp');
    expect(fromLeadingSlashPublic.img).toBe('/images/a.webp');
    expect(fromRelative.img).toBe('/images/a.webp');
    expect(fromAbsolute.img).toBe('/images/a.webp');
    expect(fromRemote.img).toBe('https://cdn.test/a.webp');
  });

  it('supports the legacy img field and missing images', () => {
    const [legacy] = processRawCards([{ id: 1, name: 'A', ovr: 70, rarity: 'BRONZE', img: 'images/legacy.webp' }]);
    const [missing] = processRawCards([{ id: 2, name: 'B', ovr: 70, rarity: 'BRONZE' }]);

    expect(legacy.img).toBe('/images/legacy.webp');
    expect(missing.img).toBe('/');
  });

  it.each([
    ['GOLD RARE', 'gold'],
    ['SILVER RARE', 'silver'],
    ['BRONZE', 'bronze'],
    ['SOMETHING ELSE', 'bronze']
  ])('derives rarityClass %s -> %s', (rarity, rarityClass) => {
    const [card] = processRawCards([raw({ rarity })]);
    expect(card.rarityClass).toBe(rarityClass);
  });

  it.each([
    [95, 5],
    [96, 5],
    [88, 4],
    [94, 4],
    [87, 3]
  ])('derives gold stars from ovr %i -> %i', (ovr, stars) => {
    const [card] = processRawCards([raw({ rarity: 'GOLD RARE', ovr })]);
    expect(card.stars).toBe(stars);
  });

  it.each([
    [88, 4],
    [80, 3],
    [87, 3],
    [79, 2]
  ])('derives silver stars from ovr %i -> %i', (ovr, stars) => {
    const [card] = processRawCards([raw({ rarity: 'SILVER RARE', ovr })]);
    expect(card.stars).toBe(stars);
  });

  it.each([
    [68, 1],
    [69, 2],
    [74, 2],
    [75, 3]
  ])('derives bronze stars from ovr %i -> %i', (ovr, stars) => {
    const [card] = processRawCards([raw({ rarity: 'BRONZE', ovr })]);
    expect(card.stars).toBe(stars);
  });

  it('keeps an explicit star rating instead of deriving one', () => {
    const [card] = processRawCards([raw({ rarity: 'GOLD RARE', ovr: 99, stars: 2 })]);
    expect(card.stars).toBe(2);
  });

  it('derives clamped stats from ovr and id when stats are absent', () => {
    const [card] = processRawCards([raw({ id: 4, ovr: 80 })]);

    expect(card.atk).toBe(80 + ((4 * 7) % 5) - 2);
    expect(card.def).toBe(80 - 3 + ((4 * 3) % 4));
    expect(card.chk).toBe(80 + 2 - ((4 * 11) % 5));
  });

  it('clamps derived stats into the 50-99 range', () => {
    const [low] = processRawCards([raw({ id: 1, ovr: 10 })]);
    const [high] = processRawCards([raw({ id: 1, ovr: 200 })]);

    for (const stat of ['atk', 'def', 'chk']) {
      expect(low[stat]).toBe(50);
      expect(high[stat]).toBe(99);
    }
  });

  it('prefers explicit stats, including zero values', () => {
    const [card] = processRawCards([raw({ atk: 0, def: 12, chk: 34 })]);

    expect(card.atk).toBe(0);
    expect(card.def).toBe(12);
    expect(card.chk).toBe(34);
  });

  it('fills jutsu and summon from the character lookups when absent', () => {
    const [derived] = processRawCards([raw({ name: 'Kakashi Hatake' })]);
    const [explicit] = processRawCards([raw({ name: 'Kakashi Hatake', jutsu: 'Custom', summon: 'Custom Summon' })]);

    expect(derived.jutsu).toBe('Raikiri / Kamui');
    expect(derived.summon).toBe('Ninken Hounds');
    expect(explicit.jutsu).toBe('Custom');
    expect(explicit.summon).toBe('Custom Summon');
  });

  it('maps every entry and returns an empty list for empty input', () => {
    expect(processRawCards([])).toEqual([]);
    expect(processRawCards([raw({ id: 1 }), raw({ id: 2 })])).toHaveLength(2);
  });
});
