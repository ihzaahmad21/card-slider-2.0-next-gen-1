// achievementEngine.js
// Evaluation engine for achievements based on current game state.

import { ACHIEVEMENTS } from '../config/achievements.js';

export { ACHIEVEMENTS };

/**
 * Checks all achievements against current game state and returns newly unlocked ones.
 * @param {Array<string>} unlockedIds - IDs of achievements already unlocked
 * @param {Object} gameState - Current game state snapshot { battleStats, inventory, playerProfile, coins }
 * @returns {Array<Object>} Newly unlocked achievement objects
 */
export function checkAchievements(unlockedIds = [], gameState = {}) {
  const newlyUnlocked = [];
  const currentUnlockedSet = new Set(unlockedIds || []);

  for (const ach of ACHIEVEMENTS) {
    if (currentUnlockedSet.has(ach.id)) continue;

    try {
      if (typeof ach.check === 'function' && ach.check(gameState)) {
        newlyUnlocked.push(ach);
      }
    } catch (err) {
      console.warn(`[ShinobiTCG] Achievement check error for "${ach.id}":`, err);
    }
  }

  return newlyUnlocked;
}
