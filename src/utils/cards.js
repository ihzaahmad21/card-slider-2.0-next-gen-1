export const MAX_PLUS_LEVEL = 10;
export const MAX_STARS = 5;
export const FALLBACK_CARD_IMAGE = '/images/naruto__part_1__by_masonengine_daim8u2.png';

export const RARITY_LABELS = {
  gold: 'GOLD RARE',
  silver: 'SILVER RARE',
  bronze: 'BRONZE'
};

const SELL_VALUES = { gold: 400, silver: 150, bronze: 30 };
const UPGRADE_COST_PER_LEVEL = 200;

export function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

// Unique key of an inventory instance, falling back to the master card id
export function getCardKey(card) {
  if (!card) return null;
  return card.instanceId || card.id;
}

export function isSameCardInstance(a, b) {
  if (!a || !b) return false;
  if (a.instanceId && b.instanceId) return a.instanceId === b.instanceId;
  return a.id === b.id;
}

export function getRarityClass(card) {
  return (card && card.rarityClass) || 'bronze';
}

export function getStarString(stars, separator = '') {
  const full = clamp(Number(stars) || 1, 0, MAX_STARS);
  const empty = MAX_STARS - full;
  return ('★' + separator).repeat(full) + ('☆' + separator).repeat(empty);
}

export function getSellValue(card) {
  return SELL_VALUES[getRarityClass(card)] ?? SELL_VALUES.bronze;
}

export function getUpgradeCost(plusLevel = 0) {
  return UPGRADE_COST_PER_LEVEL * ((Number(plusLevel) || 0) + 1);
}

export function buildInventoryInstance(card, plusLevel = 0) {
  return {
    ...card,
    quantity: 1,
    plusLevel,
    instanceId: `${card.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  };
}

// Modal artwork uses the full HD .png variant of the grid .webp thumbnail
export function buildHdImagePath(img) {
  return (img || '').replace('/images/', '/images/HD/').replace('.webp', '.png');
}

// One-shot <img> fallback: swap the source once, then stop retrying
export function createImageFallbackHandler(fallbackSrc) {
  return (event) => {
    event.target.onerror = null;
    event.target.src = fallbackSrc;
  };
}
