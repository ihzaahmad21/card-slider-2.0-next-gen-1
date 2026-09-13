import { PACK_CONFIG } from '../config/packs.js';

/**
 * Rolls a single card from the available card pool based on the pack configuration.
 *
 * @param {string} packType - 'bronze' | 'silver' | 'gold' | 'premium'
 * @param {Array} cards - All processed master cards
 * @param {boolean} isPity - Whether this pull triggers guaranteed top-tier pity
 * @param {boolean} isBoosted - Whether rate booster is active (+15% odds for top-tier)
 * @returns {Object|null} The rolled card instance
 */
export function rollSingleCard(packType, cards = [], isPity = false, isBoosted = false) {
  const config = PACK_CONFIG[packType];
  if (!config || cards.length === 0) return null;

  // Custom rarity-rate packs (Gold & Premium)
  if (config.rarityRates && config.rarityRates.length > 0) {
    const topRarity = config.rarityRates[config.rarityRates.length - 1].rarity;
    let targetRarity;

    if (isPity) {
      targetRarity = topRarity;
    } else {
      const roll = Math.random() * 100;
      let threshold = config.rarityRates[0].threshold; // Default: 80%

      // Rate Booster: Shift threshold down to expand top-tier drop window
      if (isBoosted) {
        threshold = Math.max(0, threshold - 15);
      }

      if (roll < threshold) {
        targetRarity = config.rarityRates[0].rarity;
      } else {
        targetRarity = topRarity;
      }
    }

    // Strict filter by target rarity
    let pool = cards.filter(c => c.rarityClass === targetRarity);

    // Fallback within pack's allowed rarities if pool is unexpectedly empty
    if (pool.length === 0) {
      const allowed = config.rarityRates.map(r => r.rarity);
      pool = cards.filter(c => allowed.includes(c.rarityClass));
    }
    if (pool.length === 0) {
      pool = cards;
    }

    return pool[Math.floor(Math.random() * pool.length)];
  }

  // Star-based roll (Bronze & Silver legacy)
  const highestStar = config.starRates[config.starRates.length - 1].star;
  let rolledStar = highestStar;

  if (isPity) {
    rolledStar = highestStar;
  } else {
    const roll = Math.random() * 100;
    for (const rate of config.starRates) {
      let threshold = rate.threshold;
      if (isBoosted && threshold < 100) {
        threshold = Math.max(0, threshold - 15);
      }

      if (roll < threshold) {
        rolledStar = rate.star;
        break;
      }
    }
  }

  let pool = cards.filter(c => c.rarityClass === config.rarityFilter);
  const starPool = pool.filter(c => c.stars === rolledStar);
  if (starPool.length > 0) pool = starPool;

  if (pool.length === 0) {
    pool = cards.filter(c => c.rarityClass === packType);
  }
  if (pool.length === 0) {
    pool = cards;
  }

  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Checks if a rolled card is the top-tier rarity or star for its pack.
 *
 * @param {string} packType - 'bronze' | 'silver' | 'gold' | 'premium'
 * @param {Object} card - The rolled card
 * @returns {boolean} True if card qualifies for pity reset
 */
export function isTopTierPull(packType, card) {
  if (!card) return false;
  const config = PACK_CONFIG[packType];
  if (!config) return false;

  if (config.rarityRates && config.rarityRates.length > 0) {
    const topRarity = config.rarityRates[config.rarityRates.length - 1].rarity;
    return card.rarityClass === topRarity;
  }

  if (config.starRates && config.starRates.length > 0) {
    const highestStar = config.starRates[config.starRates.length - 1].star;
    return card.stars === highestStar;
  }

  return false;
}
