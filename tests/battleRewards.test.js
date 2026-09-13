import { describe, it, expect } from 'vitest';
import { calculateBattleRewards, calculateLevelUp, getExpProgress } from '../src/utils/battle.js';

describe('Post-Battle Reward Calculator', () => {
  it('should award 1500 coins and 250 EXP on victory', () => {
    const result = calculateBattleRewards('player');
    expect(result.coins).toBe(1500);
    expect(result.exp).toBe(250);
    expect(result.outcome).toBe('victory');

    const resultAlias = calculateBattleRewards('victory');
    expect(resultAlias.coins).toBe(1500);
    expect(resultAlias.exp).toBe(250);
  });

  it('should award 300 coins and 50 EXP on defeat', () => {
    const result = calculateBattleRewards('bot');
    expect(result.coins).toBe(300);
    expect(result.exp).toBe(50);
    expect(result.outcome).toBe('defeat');

    const resultAlias = calculateBattleRewards('defeat');
    expect(resultAlias.coins).toBe(300);
    expect(resultAlias.exp).toBe(50);
  });

  it('should award draw rewards correctly', () => {
    const result = calculateBattleRewards('draw');
    expect(result.coins).toBe(600);
    expect(result.exp).toBe(100);
    expect(result.outcome).toBe('draw');
  });
});

describe('Player Leveling Math', () => {
  it('should calculate required exp correctly (currentLevel * 500)', () => {
    // Level 1: 1 * 500 = 500 EXP needed
    const progress = getExpProgress(1, 250);
    expect(progress.requiredExp).toBe(500);
    expect(progress.progressPct).toBe(50);
  });

  it('should not level up if exp does not reach threshold', () => {
    // Level 1, 0 exp, +250 exp => Level 1, 250 exp
    const res = calculateLevelUp(1, 0, 250);
    expect(res.newLevel).toBe(1);
    expect(res.newExp).toBe(250);
    expect(res.leveledUp).toBe(false);
    expect(res.levelsGained).toBe(0);
  });

  it('should level up and reset/carry over remainder when reaching exact threshold', () => {
    // Level 1, 250 exp, +250 exp => 500 exp => Level 2, 0 exp
    const res = calculateLevelUp(1, 250, 250);
    expect(res.newLevel).toBe(2);
    expect(res.newExp).toBe(0);
    expect(res.leveledUp).toBe(true);
    expect(res.levelsGained).toBe(1);
    expect(res.nextLevelExp).toBe(1000); // 2 * 500
  });

  it('should level up and carry over leftover exp correctly', () => {
    // Level 1, 350 exp, +250 exp => 600 exp => Level 2, 100 exp
    const res = calculateLevelUp(1, 350, 250);
    expect(res.newLevel).toBe(2);
    expect(res.newExp).toBe(100);
    expect(res.leveledUp).toBe(true);
    expect(res.levelsGained).toBe(1);
  });

  it('should handle multi-level up if large EXP is gained', () => {
    // Level 1 (500 needed), Level 2 (1000 needed). Total needed for Level 3 is 1500.
    // Level 1, 0 exp, +1600 exp:
    // Level 1 -> 2 (uses 500, 1100 left)
    // Level 2 -> 3 (uses 1000, 100 left)
    // Level 3, 100 exp.
    const res = calculateLevelUp(1, 0, 1600);
    expect(res.newLevel).toBe(3);
    expect(res.newExp).toBe(100);
    expect(res.leveledUp).toBe(true);
    expect(res.levelsGained).toBe(2);
  });
});
