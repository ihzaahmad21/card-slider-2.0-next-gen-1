export const PACK_CONFIG = {
  bronze: {
    label: 'Bronze',
    cost: 100,
    rarityFilter: 'BRONZE',
    starRates: [{ star: 1, threshold: 50 }, { star: 2, threshold: 90 }, { star: 3, threshold: 100 }],
    tierBadge: 'Common Tier',
    image: '/images/case/bronze.png',
    description: 'Contains Genin & Chunin Shinobi cards with up to 3-Star potential.',
    dropRates: 'Drops 1-3★ (3★ Drop Rate: 10%)'
  },
  silver: {
    label: 'Silver',
    cost: 500,
    rarityFilter: 'SILVER RARE',
    starRates: [{ star: 3, threshold: 85 }, { star: 4, threshold: 100 }],
    tierBadge: 'Elite Tier',
    image: '/images/case/silver.png',
    description: 'Contains Jonin & ANBU Shinobi cards with up to 4-Star potential.',
    dropRates: 'Drops 3-4★ (4★ Drop Rate: 15%)'
  },
  gold: {
    label: 'Gold',
    cost: 1000,
    rarityFilter: 'GOLD RARE',
    starRates: [{ star: 4, threshold: 80 }, { star: 5, threshold: 100 }],
    tierBadge: 'Legendary Tier',
    image: '/images/case/gold.png',
    description: 'Guarantees Legendary Kage & Mythic Shinobi cards up to 5-Star OVR.',
    dropRates: 'Drops 4-5★ (5★ Drop Rate: 20%)'
  }
};

export const PACK_TYPES = Object.keys(PACK_CONFIG);
