import { describe, it, expect } from 'vitest';
import { getPlayerRank, SHINOBI_RANKS, AVATAR_PRESETS } from '../src/components/UserProfileModal.jsx';
import { STORAGE_KEYS } from '../src/utils/storage.js';

describe('UserProfileModal & Rank System Tests', () => {
  it('should return Genin rank for level 1-7', () => {
    const rank1 = getPlayerRank(1);
    expect(rank1.title).toBe('Genin');
    expect(rank1.tier).toBe('genin');
    expect(rank1.kanji).toBe('下忍');

    const rank7 = getPlayerRank(7);
    expect(rank7.title).toBe('Genin');
  });

  it('should return Chunin rank for level 8-13', () => {
    const rank8 = getPlayerRank(8);
    expect(rank8.title).toBe('Chunin');
    expect(rank8.tier).toBe('chunin');
    expect(rank8.kanji).toBe('中忍');

    const rank13 = getPlayerRank(13);
    expect(rank13.title).toBe('Chunin');
  });

  it('should return Special Jonin rank for level 14-19', () => {
    const rank14 = getPlayerRank(14);
    expect(rank14.title).toBe('Special Jonin');
    expect(rank14.tier).toBe('jonin');
    expect(rank14.kanji).toBe('特上');
  });

  it('should return ANBU rank for level 20-29', () => {
    const rank20 = getPlayerRank(20);
    expect(rank20.title).toBe('ANBU Black Ops');
    expect(rank20.tier).toBe('anbu');
    expect(rank20.kanji).toBe('暗部');
  });

  it('should return S-Rank Ninja for level 30-39', () => {
    const rank30 = getPlayerRank(30);
    expect(rank30.title).toBe('S-Rank Ninja');
    expect(rank30.tier).toBe('s-rank');
  });

  it('should return Kage for level 40-49 and Hokage for 50+', () => {
    const rank40 = getPlayerRank(40);
    expect(rank40.title).toBe('Kage');

    const rank50 = getPlayerRank(50);
    expect(rank50.title).toBe('Hokage');
    expect(rank50.kanji).toBe('火影');

    const rank100 = getPlayerRank(100);
    expect(rank100.title).toBe('Hokage');
  });

  it('should fallback cleanly for 0, negative, or invalid levels', () => {
    const rank0 = getPlayerRank(0);
    expect(rank0.title).toBe('Genin');

    const rankNeg = getPlayerRank(-5);
    expect(rankNeg.title).toBe('Genin');

    const rankNaN = getPlayerRank('abc');
    expect(rankNaN.title).toBe('Genin');
  });

  it('should contain a complete list of avatar presets with labels and elements', () => {
    expect(AVATAR_PRESETS.length).toBeGreaterThanOrEqual(10);
    const kageAvatar = AVATAR_PRESETS.find(p => p.id === 'kage');
    expect(kageAvatar).toBeDefined();
    expect(kageAvatar.icon).toBe('影');
    expect(kageAvatar.element).toBeDefined();
  });

  it('should have storage keys for battleStats and avatarIcon', () => {
    expect(STORAGE_KEYS.battleStats).toBe('shinobiTCG.battleStats');
    expect(STORAGE_KEYS.avatarIcon).toBe('shinobiTCG.avatarIcon');
  });
});
