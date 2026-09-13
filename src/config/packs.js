const isTest = typeof process !== 'undefined' && process.env.NODE_ENV === 'test';
const BASE_URL = isTest ? '/' : (import.meta.env.BASE_URL || '/');

export const PACK_CONFIG = {
  bronze: {
    label: 'Bronze',
    cost: 100,
    rarityFilter: 'bronze',
    starRates: [{ star: 1, threshold: 50 }, { star: 2, threshold: 90 }, { star: 3, threshold: 100 }],
    tierBadge: 'Common Tier',
    image: `${BASE_URL}images/case/bronze.webp`,
    description: 'Contains Genin & Chunin Shinobi cards with up to 3-Star potential.',
    dropRates: 'Drops 1-3★ (3★ Drop Rate: 10%)',
    pityGuarantee: 200
  },
  silver: {
    label: 'Silver',
    cost: 500,
    rarityFilter: 'silver',
    starRates: [{ star: 3, threshold: 85 }, { star: 4, threshold: 100 }],
    tierBadge: 'Elite Tier',
    image: `${BASE_URL}images/case/silver.webp`,
    description: 'Contains Jonin Shinobi cards.',
    dropRates: 'Drops 3-4★',
    pityGuarantee: 100
  },
  gold: {
    label: 'Gold',
    cost: 1000,
    rarityFilter: 'gold',
    rarityRates: [
      { rarity: 'gold', rate: 80, threshold: 80 },
      { rarity: 'diamond', rate: 20, threshold: 100 }
    ],
    starRates: [{ star: 4, threshold: 70 }, { star: 5, threshold: 100 }],
    tierBadge: 'Legendary Tier',
    image: `${BASE_URL}images/case/gold.webp`,
    description: 'Contains Kage & Legendary Shinobi cards with Gold and Diamond potential.',
    dropRates: 'Gold (80%) • Diamond (20%)',
    pityGuarantee: 50
  },
  premium: {
    label: 'Premium',
    cost: 10000,
    rarityFilter: 'premium',
    rarityRates: [
      { rarity: 'diamond', rate: 80, threshold: 80 },
      { rarity: 'mythic', rate: 20, threshold: 100 }
    ],
    starRates: [{ star: 5, threshold: 100 }],
    tierBadge: 'Mythic Tier',
    image: `${BASE_URL}images/case/premium.webp`,
    description: 'Contains God-tier Shinobi cards. Guaranteed Diamond or Mythic rarity!',
    dropRates: 'Diamond (80%) • Mythic (20%)',
    pityGuarantee: 30
  }
};

export const PACK_TYPES = Object.keys(PACK_CONFIG);
