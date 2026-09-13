// achievements.js
// Configuration-driven achievement milestones for Shinobi TCG.
// To add new achievements, simply append a new object to this array.

export const ACHIEVEMENTS = [
  {
    id: 'first_blood',
    label: 'First Blood',
    desc: 'Win your first battle in the Battle Arena.',
    icon: '⚔️',
    reward: 100,
    category: 'battle',
    check: (state) => (state.battleStats?.wins || 0) >= 1
  },
  {
    id: 'win_streak_3',
    label: 'On Fire',
    desc: 'Achieve a winning streak of 3 matches.',
    icon: '🔥',
    reward: 200,
    category: 'battle',
    check: (state) => (state.battleStats?.currentWinStreak || 0) >= 3
  },
  {
    id: 'win_streak_10',
    label: 'Unstoppable Legend',
    desc: 'Achieve a winning streak of 10 matches.',
    icon: '👑',
    reward: 1000,
    category: 'battle',
    check: (state) => (state.battleStats?.currentWinStreak || 0) >= 10
  },
  {
    id: 'battle_hardened',
    label: 'Battle Hardened',
    desc: 'Win a total of 25 matches.',
    icon: '🛡️',
    reward: 400,
    category: 'battle',
    check: (state) => (state.battleStats?.wins || 0) >= 25
  },
  {
    id: 'novice_collector',
    label: 'Ninja Academy Cadet',
    desc: 'Collect at least 10 cards in your inventory.',
    icon: '📜',
    reward: 150,
    category: 'collection',
    check: (state) => (state.inventory?.length || 0) >= 10
  },
  {
    id: 'gold_rush',
    label: 'Golden Shinobi',
    desc: 'Collect 15 or more cards of GOLD rarity or higher.',
    icon: '✨',
    reward: 350,
    category: 'collection',
    check: (state) => {
      const highRarity = ['gold', 'diamond', 'mythic'];
      const count = (state.inventory || []).filter(c => highRarity.includes(c.rarityClass)).length;
      return count >= 15;
    }
  },
  {
    id: 'mythic_encounter',
    label: 'Transcendent Power',
    desc: 'Acquire at least 1 MYTHIC rarity card.',
    icon: '💎',
    reward: 500,
    category: 'collection',
    check: (state) => (state.inventory || []).some(c => c.rarityClass === 'mythic')
  },
  {
    id: 'jinchuriki_gathering',
    label: 'Tailed Beast Vessels',
    desc: 'Collect at least 5 different Jinchuriki cards.',
    icon: '🦊',
    reward: 400,
    category: 'squad',
    check: (state) => {
      const jinchurikiCards = (state.inventory || []).filter(c => (c.tags || []).includes('jinchuriki'));
      const uniqueIds = new Set(jinchurikiCards.map(c => c.id));
      return uniqueIds.size >= 5;
    }
  },
  {
    id: 'kage_council',
    label: 'Five Kage Summit',
    desc: 'Collect at least 5 different Kage cards.',
    icon: '🏛️',
    reward: 400,
    category: 'squad',
    check: (state) => {
      const kageCards = (state.inventory || []).filter(c => (c.tags || []).includes('kage'));
      const uniqueIds = new Set(kageCards.map(c => c.id));
      return uniqueIds.size >= 5;
    }
  },
  {
    id: 'uchiha_clan',
    label: 'Curse of Hatred',
    desc: 'Collect at least 5 cards belonging to the Uchiha clan.',
    icon: '👁️',
    reward: 350,
    category: 'squad',
    check: (state) => {
      const uchihaCards = (state.inventory || []).filter(c => c.clan === 'Uchiha');
      const uniqueIds = new Set(uchihaCards.map(c => c.id));
      return uniqueIds.size >= 5;
    }
  },
  {
    id: 'chakra_limit_break',
    label: 'Limit Break',
    desc: 'Upgrade any card to +3 level or higher.',
    icon: '⚡',
    reward: 250,
    category: 'upgrade',
    check: (state) => (state.inventory || []).some(c => (c.plusLevel || 0) >= 3)
  },
  {
    id: 'master_shinobi',
    label: 'Master Shinobi',
    desc: 'Reach Player Level 10.',
    icon: '🎖️',
    reward: 500,
    category: 'rank',
    check: (state) => (state.playerProfile?.level || 1) >= 10
  }
];
