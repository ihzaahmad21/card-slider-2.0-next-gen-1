// Calculate user collection statistics
export const calculateStats = (inventory, allCards) => {
  if (!inventory || !allCards) {
    return {
      totalCards: 0,
      uniqueCards: 0,
      completionPercentage: 0,
      rareCounts: { mythic: 0, diamond: 0, gold: 0, silver: 0, bronze: 0 },
      totalValue: 0,
      duplicates: 0
    };
  }

  // inventory is an array of card instances
  const uniqueCards = new Set(inventory.map(card => card.id)).size;
  const totalPossibleCards = allCards.length;
  const completionPercentage = totalPossibleCards > 0
    ? Math.round((uniqueCards / totalPossibleCards) * 100)
    : 0;

  const totalCards = inventory.length;
  const duplicates = totalCards - uniqueCards;

  const rareCounts = { mythic: 0, diamond: 0, gold: 0, silver: 0, bronze: 0 };
  let totalValue = 0;

  inventory.forEach(card => {
    const rarityClass = card.rarityClass || 'bronze';
    if (rareCounts[rarityClass] !== undefined) {
      rareCounts[rarityClass]++;
    }
    totalValue += card.ovr || 0;
  });

  return {
    totalCards,
    uniqueCards,
    completionPercentage,
    rareCounts,
    totalValue,
    duplicates
  };
};

// Get rarity color
export const getRarityColor = (rarity) => {
  switch (rarity) {
    case 'gold': return '#f59e0b';
    case 'silver': return '#94a3b8';
    case 'bronze': return '#b45309';
    case 'diamond': return '#38bdf8';
    case 'mythic': return '#ec4899';
    default: return '#cabb98';
  }
};

// Format large numbers (1000 -> 1K, 1000000 -> 1M)
export const formatNumber = (num) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};