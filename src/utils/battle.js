import { getBaseCharacterName, RARITY_LABELS } from './cards.js';
import { processRawCards, resolveRarity } from './cardData.js';

export const MIN_SQUAD_SIZE = 3;
export const MAX_SQUAD_SIZE = 6;

export const BOT_TEAM_NAMES = [
  'Rogue Shinobi Brigade',
  'Akatsuki Strike Unit',
  'Anbu Black Ops Cell',
  'Shadow Clone Squadron',
  'Hidden Mist Phantoms',
  'Sound Five Vanguard',
  'Hidden Cloud Elite Guard',
  'Sand Village Strike Force',
  'Chakra Beast Hunter Squad',
  'Legendary Sannin Successors'
];

/**
 * Validates a squad before confirming for battle.
 * Requires at least MIN_SQUAD_SIZE (3) cards and at most MAX_SQUAD_SIZE (6) cards.
 */
export function validateSquad(squad) {
  if (!Array.isArray(squad) || squad.length === 0) {
    return {
      valid: false,
      message: 'Squad masih kosong! Isi minimal 3 shinobi untuk bertarung.',
      count: 0
    };
  }

  const filledCards = squad.filter(Boolean);
  if (filledCards.length < MIN_SQUAD_SIZE) {
    return {
      valid: false,
      message: `Minimal harus ada ${MIN_SQUAD_SIZE} shinobi di squad (saat ini ${filledCards.length}/${MAX_SQUAD_SIZE}).`,
      count: filledCards.length
    };
  }

  return {
    valid: true,
    message: `Squad siap bertarung (${filledCards.length}/${MAX_SQUAD_SIZE} shinobi)!`,
    count: filledCards.length
  };
}

/**
 * Computes average OVR of a squad (array of card objects).
 */
export function calculateSquadAvgOvr(squad) {
  if (!Array.isArray(squad)) return 0;
  const filled = squad.filter(Boolean);
  if (filled.length === 0) return 0;
  const sum = filled.reduce((acc, card) => acc + (Number(card.ovr) || 70), 0);
  return Math.round(sum / filled.length);
}

/**
 * Ensures cards are in the processed format with atk, def, chk, spd, img, etc.
 */
function ensureProcessedCards(cards) {
  if (!Array.isArray(cards) || cards.length === 0) return [];
  // If first card already has atk/def/chk/spd, assume already processed
  if (cards[0].atk !== undefined && cards[0].chk !== undefined) {
    return cards;
  }
  return processRawCards(cards);
}

/**
 * Auto-Generates an Enemy BOT Squad of 3-6 cards from master cards.
 * Balanced to have an avgOvr close to the player's team avgOvr (±3-5).
 * Guarantees no duplicate base characters.
 *
 * @param {Array|number} playerTeam - Player squad array OR target avgOvr number
 * @param {Array} masterCards - Array of master cards (cards.json or processed)
 * @param {Object} [options] - Options (teamSize, difficulty, botName)
 * @returns {Object} { squad: Card[], avgOvr: number, totalOvr: number, botName: string }
 */
export function generateBotSquad(playerTeam, masterCards = [], options = {}) {
  const cardsPool = ensureProcessedCards(masterCards);
  if (cardsPool.length === 0) {
    return { squad: [], avgOvr: 0, totalOvr: 0, botName: 'AI Opponent' };
  }

  // Determine target team size
  let targetSize = 3;
  if (typeof options.teamSize === 'number') {
    targetSize = Math.max(MIN_SQUAD_SIZE, Math.min(MAX_SQUAD_SIZE, options.teamSize));
  } else if (Array.isArray(playerTeam) && playerTeam.length > 0) {
    const filledCount = playerTeam.filter(Boolean).length;
    targetSize = Math.max(MIN_SQUAD_SIZE, Math.min(MAX_SQUAD_SIZE, filledCount));
  }

  // Determine target average OVR
  let targetAvg = 75;
  if (typeof playerTeam === 'number' && Number.isFinite(playerTeam)) {
    targetAvg = playerTeam;
  } else if (Array.isArray(playerTeam) && playerTeam.length > 0) {
    targetAvg = calculateSquadAvgOvr(playerTeam);
  }
  targetAvg = Math.max(60, Math.min(105, targetAvg));

  const targetTotal = targetAvg * targetSize;

  // Group pool by base character name to prevent duplicates
  const groupedByBase = new Map();
  for (const card of cardsPool) {
    const base = getBaseCharacterName(card.name).toLowerCase();
    if (!groupedByBase.has(base)) {
      groupedByBase.set(base, []);
    }
    groupedByBase.get(base).push(card);
  }

  const allBases = Array.from(groupedByBase.keys());
  // Shuffle base character keys
  for (let i = allBases.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allBases[i], allBases[j]] = [allBases[j], allBases[i]];
  }

  // Maximum plus level BOT can have depending on target tier
  // High tier (>= 90): allow plus up to +10 so gold/silver ninja can compete with mythic squads!
  // Mid tier (80-89): allow plus up to +4
  // Low tier (< 80): mostly 0 or +1
  const maxAllowedPlus = targetAvg >= 92 ? 10 : targetAvg >= 86 ? 5 : targetAvg >= 80 ? 2 : 0;

  let bestSquad = null;
  let bestDiff = Infinity;

  const iterations = 35;
  for (let iter = 0; iter < iterations; iter++) {
    const currentSquad = [];
    const usedBases = new Set();
    let currentTotal = 0;

    // Pick cards sequentially
    for (let slot = 0; slot < targetSize; slot++) {
      const remainingSlots = targetSize - slot;
      const remainingTarget = targetTotal - currentTotal;
      const idealCardOvr = Math.round(remainingTarget / remainingSlots);

      // Find available bases not yet used
      const candidates = [];
      for (const base of allBases) {
        if (usedBases.has(base)) continue;
        const variations = groupedByBase.get(base);
        for (const v of variations) {
          const vOvr = v.ovr || 75;
          // Calculate needed plus level for this card to approach idealCardOvr
          const neededPlus = Math.max(0, Math.min(maxAllowedPlus, idealCardOvr - vOvr));
          const effectiveOvr = vOvr + neededPlus;
          const diff = Math.abs(effectiveOvr - idealCardOvr);

          // Card is viable if effective OVR is within reasonable reach (±7 of ideal)
          if (diff <= 7) {
            candidates.push({ card: v, base, plusLevel: neededPlus, effectiveOvr, diff });
          }
        }
      }

      if (candidates.length === 0) {
        // Fallback: pick any unused base
        for (const base of allBases) {
          if (!usedBases.has(base)) {
            const v = groupedByBase.get(base)[0];
            const neededPlus = Math.max(0, Math.min(maxAllowedPlus, idealCardOvr - (v.ovr || 75)));
            candidates.push({ card: v, base, plusLevel: neededPlus, effectiveOvr: (v.ovr || 75) + neededPlus, diff: 0 });
            break;
          }
        }
      }

      if (candidates.length === 0) break;

      // Sort candidates by closeness to idealCardOvr and pick from top 8 randomly for high variety!
      candidates.sort((a, b) => a.diff - b.diff);
      const pickSlice = candidates.slice(0, Math.min(8, candidates.length));
      const chosen = pickSlice[Math.floor(Math.random() * pickSlice.length)];

      usedBases.add(chosen.base);
      currentSquad.push(chosen);
      currentTotal += chosen.effectiveOvr;
    }

    if (currentSquad.length === targetSize) {
      const diff = Math.abs(currentTotal - targetTotal);
      if (diff < bestDiff) {
        bestDiff = diff;
        bestSquad = currentSquad;
        if (diff <= 2) break; // Close enough
      }
    }
  }

  // If no combination succeeded, fallback to first targetSize unique cards
  if (!bestSquad || bestSquad.length < targetSize) {
    bestSquad = [];
    const fallbackBases = new Set();
    for (const card of cardsPool) {
      const base = getBaseCharacterName(card.name).toLowerCase();
      if (!fallbackBases.has(base)) {
        fallbackBases.add(base);
        const neededPlus = Math.max(0, Math.min(maxAllowedPlus, targetAvg - (card.ovr || 75)));
        bestSquad.push({ card, plusLevel: neededPlus, effectiveOvr: (card.ovr || 75) + neededPlus });
        if (bestSquad.length === targetSize) break;
      }
    }
  }

  // Map to bot squad cards with unique instanceIds and dynamically updated stats/rarity
  const botSquad = bestSquad.map((item, idx) => {
    const baseCard = item.card || item;
    const plusLevel = item.plusLevel || 0;
    const effectiveOvr = (baseCard.ovr || 75) + plusLevel;
    const effectiveAtk = (baseCard.atk || baseCard.ovr || 75) + plusLevel;
    const effectiveDef = (baseCard.def || baseCard.ovr || 75) + plusLevel;
    const effectiveChk = (baseCard.chk || baseCard.ovr || 75) + plusLevel;
    const effectiveSpd = (baseCard.spd || baseCard.ovr || 75) + plusLevel;
    const { rarityClass, stars } = resolveRarity(baseCard, effectiveOvr);

    return {
      ...baseCard,
      ovr: effectiveOvr,
      atk: effectiveAtk,
      def: effectiveDef,
      chk: effectiveChk,
      spd: effectiveSpd,
      rarityClass,
      rarity: RARITY_LABELS[rarityClass] || baseCard.rarity || 'BRONZE',
      stars,
      plusLevel,
      instanceId: `bot-card-${idx + 1}-${baseCard.id}-${Math.random().toString(36).slice(2, 7)}`,
      isBot: true
    };
  });

  const totalOvr = botSquad.reduce((sum, c) => sum + (c.ovr || 70), 0);
  const avgOvr = botSquad.length > 0 ? Math.round(totalOvr / botSquad.length) : 0;
  const botName = options.botName || BOT_TEAM_NAMES[Math.floor(Math.random() * BOT_TEAM_NAMES.length)];

  return {
    squad: botSquad,
    avgOvr,
    totalOvr,
    botName
  };
}

/**
 * Simulates a single round clash between a player card and a bot card.
 */
export function simulateClashRound(playerCard, botCard, playerSynergy = {}, roundNumber = 1) {
  if (!playerCard && !botCard) return null;

  if (!playerCard) {
    return {
      round: roundNumber,
      winner: 'bot',
      playerCard: null,
      botCard,
      playerDmg: 0,
      botDmg: 100,
      log: `Round ${roundNumber}: Player slot is empty! ${botCard.name} claims the round uncontested.`
    };
  }

  if (!botCard) {
    return {
      round: roundNumber,
      winner: 'player',
      playerCard,
      botCard: null,
      playerDmg: 100,
      botDmg: 0,
      log: `Round ${roundNumber}: BOT slot is empty! ${playerCard.name} claims the round uncontested.`
    };
  }

  // Base stats + player synergy bonus
  const pAtk = (playerCard.atk || playerCard.ovr || 70) + (playerSynergy.atk || 0);
  const pDef = (playerCard.def || playerCard.ovr || 70) + (playerSynergy.def || 0);
  const pChk = (playerCard.chk || playerCard.ovr || 70) + (playerSynergy.chk || 0);
  const pSpd = playerCard.spd || playerCard.ovr || 70;

  const bAtk = botCard.atk || botCard.ovr || 70;
  const bDef = botCard.def || botCard.ovr || 70;
  const bChk = botCard.chk || botCard.ovr || 70;
  const bSpd = botCard.spd || botCard.ovr || 70;

  // Speed determines first strike & initiative bonus
  const playerFirst = pSpd >= bSpd;

  // Jutsu triggering check (based on CHK vs roll)
  const playerJutsuProc = Math.random() * 100 < Math.min(85, (pChk / 110) * 80 + 15);
  const botJutsuProc = Math.random() * 100 < Math.min(85, (bChk / 110) * 80 + 15);

  const playerPower = (pAtk * 1.2) + (playerJutsuProc ? pChk * 0.8 : 0);
  const botDefense = (bDef * 1.1);
  const playerDmg = Math.max(15, Math.round(playerPower - botDefense * 0.5 + (Math.random() * 10 - 5)));

  const botPower = (bAtk * 1.2) + (botJutsuProc ? bChk * 0.8 : 0);
  const playerDefense = (pDef * 1.1);
  const botDmg = Math.max(15, Math.round(botPower - playerDefense * 0.5 + (Math.random() * 10 - 5)));

  let winner = 'draw';
  if (playerDmg > botDmg) {
    winner = 'player';
  } else if (botDmg > playerDmg) {
    winner = 'bot';
  }

  const jutsuNote = playerJutsuProc
    ? `⚡ ${playerCard.name} activated [${playerCard.jutsu || 'Special Art'}]!`
    : '';
  const botJutsuNote = botJutsuProc
    ? `🔥 ${botCard.name} countered with [${botCard.jutsu || 'Secret Jutsu'}]!`
    : '';

  const outcomeText = winner === 'player'
    ? `${playerCard.name} overwhelmed ${botCard.name} (${playerDmg} vs ${botDmg} DMG)!`
    : winner === 'bot'
      ? `${botCard.name} struck down ${playerCard.name} (${botDmg} vs ${playerDmg} DMG)!`
      : `Clash stalemated between ${playerCard.name} and ${botCard.name}!`;

  return {
    round: roundNumber,
    winner,
    playerCard,
    botCard,
    playerDmg,
    botDmg,
    playerJutsuProc,
    botJutsuProc,
    playerFirst,
    log: [jutsuNote, botJutsuNote, outcomeText].filter(Boolean).join(' ')
  };
}

/**
 * Standard post-battle reward configuration
 */
export const BATTLE_REWARDS = {
  victory: { coins: 1500, exp: 250, label: 'VICTORY' },
  defeat: { coins: 300, exp: 50, label: 'DEFEAT' },
  draw: { coins: 600, exp: 100, label: 'DRAW' }
};

/**
 * Calculates reward coins & EXP based on battle outcome.
 * - Victory: +1500 Coins, +250 EXP
 * - Defeat: +300 Coins, +50 EXP
 * - Draw: +600 Coins, +100 EXP
 *
 * @param {'player'|'bot'|'draw'|'victory'|'defeat'} outcome
 * @returns {{ coins: number, exp: number, outcome: string }}
 */
export function calculateBattleRewards(outcome) {
  const norm = String(outcome || '').toLowerCase();
  if (norm === 'player' || norm === 'victory' || norm === 'win') {
    return { coins: 1500, exp: 250, outcome: 'victory' };
  }
  if (norm === 'bot' || norm === 'defeat' || norm === 'loss') {
    return { coins: 300, exp: 50, outcome: 'defeat' };
  }
  return { coins: 600, exp: 100, outcome: 'draw' };
}

/**
 * Calculates player level and EXP progression.
 * Formula: Each level requires `currentLevel * 500` EXP.
 * If EXP reaches or exceeds threshold, level increases and remaining EXP carries over.
 *
 * @param {number} currentLevel
 * @param {number} currentExp
 * @param {number} expGained
 * @returns {{ newLevel: number, newExp: number, levelsGained: number, leveledUp: boolean, nextLevelExp: number }}
 */
export function calculateLevelUp(currentLevel, currentExp, expGained) {
  let level = Math.max(1, Math.floor(Number(currentLevel) || 1));
  let exp = Math.max(0, Math.floor(Number(currentExp) || 0)) + Math.max(0, Math.floor(Number(expGained) || 0));
  let levelsGained = 0;

  while (true) {
    const requiredExp = level * 500;
    if (exp >= requiredExp) {
      exp -= requiredExp;
      level += 1;
      levelsGained += 1;
    } else {
      break;
    }
  }

  return {
    newLevel: level,
    newExp: exp,
    levelsGained,
    leveledUp: levelsGained > 0,
    nextLevelExp: level * 500
  };
}

/**
 * Returns formatted EXP progress information for UI displays and progress bars.
 *
 * @param {number} level
 * @param {number} exp
 * @returns {{ level: number, exp: number, requiredExp: number, progressPct: number }}
 */
export function getExpProgress(level, exp) {
  const safeLevel = Math.max(1, Math.floor(Number(level) || 1));
  const safeExp = Math.max(0, Math.floor(Number(exp) || 0));
  const requiredExp = safeLevel * 500;
  const progressPct = Math.min(100, Math.max(0, Math.round((safeExp / requiredExp) * 100)));

  return {
    level: safeLevel,
    exp: safeExp,
    requiredExp,
    progressPct
  };
}

