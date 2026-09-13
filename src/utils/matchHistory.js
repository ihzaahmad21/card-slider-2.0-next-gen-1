import cardsData from '../data/cards.json';
import { getCardImageSrc, getJutsuDetails } from './cards.js';

const STORAGE_KEY = 'shinobi_match_history';

// Index master cards for instant thumbnail resolution
// Use string keys for id to handle number/string mismatch (localStorage JSON.parse may change types)
const cardsById = new Map((cardsData || []).map(c => [String(c.id), c]));
const cardsByName = new Map((cardsData || []).map(c => [(c.name || '').toLowerCase(), c]));

/**
 * Robustly resolve the image URL for any shinobi object,
 * ensuring Vite base URL is always respected and no 404s occur.
 */
export function resolveShinobiThumbnail(shinobi) {
  if (!shinobi) return '';

  // 1. ALWAYS try master cards.json lookup by ID first (most reliable, avoids stale stored URLs)
  if (shinobi.id !== undefined && shinobi.id !== null) {
    const masterById = cardsById.get(String(shinobi.id));
    if (masterById) return getCardImageSrc(masterById);
  }

  // 2. Lookup by exact character name from master cards.json
  const cleanName = (shinobi.name || '').toLowerCase().trim();
  if (cleanName && cardsByName.has(cleanName)) {
    return getCardImageSrc(cardsByName.get(cleanName));
  }

  // 3. Last resort: use stored image path — but ONLY if it's a raw relative path
  //    (not already base-URL-resolved, which would cause double-prepend)
  const candidate = shinobi.image_url || shinobi.img || shinobi.image || shinobi.artwork;
  if (candidate && typeof candidate === 'string' && candidate.trim() !== '') {
    if (candidate.startsWith('http') || candidate.startsWith('data:')) {
      return candidate; // external URL, use as-is
    }
    // Only use raw relative paths — skip if it already contains the Vite base URL prefix
    const base = (typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL) || '/';
    const alreadyResolved = base !== '/' && candidate.startsWith(base);
    if (!alreadyResolved) {
      return getCardImageSrc({ image_url: candidate });
    }
    // Already resolved path — strip the base prefix first, then re-resolve
    const stripped = candidate.slice(base.length);
    return getCardImageSrc({ image_url: stripped });
  }

  // 4. Ultimate fallback
  return getCardImageSrc(shinobi);
}

/**
 * Robustly resolve the specific jutsu name for any shinobi object,
 * avoiding generic strings like "Secret Art" or "Secret Jutsu".
 */
export function resolveShinobiJutsu(shinobi) {
  if (!shinobi) return 'Secret Ninja Art';

  // 1. If shinobi already has a specific jutsu name (not generic fallback)
  if (shinobi.jutsu && typeof shinobi.jutsu === 'string') {
    const trimmed = shinobi.jutsu.trim();
    if (trimmed && trimmed !== 'Secret Ninja Art' && trimmed !== 'Secret Jutsu' && trimmed !== 'Secret Art') {
      return trimmed;
    }
  }

  // 2. Check equippedJutsu on the shinobi object
  if (Array.isArray(shinobi.equippedJutsu) && shinobi.equippedJutsu.length > 0) {
    const names = shinobi.equippedJutsu
      .map(id => getJutsuDetails(id)?.name)
      .filter(Boolean);
    if (names.length > 0) return names.join(' / ');
  }

  // 3. Lookup master card by ID
  if (shinobi.id && cardsById.has(shinobi.id)) {
    const master = cardsById.get(shinobi.id);
    if (master.jutsu && typeof master.jutsu === 'string') {
      return master.jutsu;
    }
    if (Array.isArray(master.equippedJutsu) && master.equippedJutsu.length > 0) {
      const names = master.equippedJutsu
        .map(id => getJutsuDetails(id)?.name)
        .filter(Boolean);
      if (names.length > 0) return names.join(' / ');
    }
  }

  // 4. Lookup master card by Name
  const cleanName = (shinobi.name || '').toLowerCase();
  if (cleanName && cardsByName.has(cleanName)) {
    const master = cardsByName.get(cleanName);
    if (master.jutsu && typeof master.jutsu === 'string') {
      return master.jutsu;
    }
    if (Array.isArray(master.equippedJutsu) && master.equippedJutsu.length > 0) {
      const names = master.equippedJutsu
        .map(id => getJutsuDetails(id)?.name)
        .filter(Boolean);
      if (names.length > 0) return names.join(' / ');
    }
  }

  return shinobi.jutsu || 'Secret Ninja Art';
}

/**
 * Format timestamp to string like "11 Sep, 04:50"
 */
export function formatMatchDate(timestamp = Date.now()) {
  const d = new Date(timestamp);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = d.getDate();
  const month = months[d.getMonth()];
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day} ${month}, ${hours}:${minutes}`;
}

/**
 * Ensure every match record has a consistent, complete array of slot matchups.
 * Preserves real battle damage & jutsu for recorded matches, and generates
 * realistic values (~90-180) for legacy records.
 */
export function ensureRecordRounds(record) {
  if (!record) return [];

  // Check if existing rounds data is valid with explicit winners
  if (Array.isArray(record.rounds) && record.rounds.length > 0) {
    const hasValidWinners = record.rounds.every(r => r && (r.winner === 'player' || r.winner === 'bot' || r.winner === 'draw'));
    if (hasValidWinners) {
      return record.rounds.map((r, idx) => ({
        ...r,
        slot: r.slot || r.round || idx + 1,
        round: r.round || r.slot || idx + 1,
        playerDmg: Number(r.playerDmg) || 0,
        botDmg: Number(r.botDmg) || 0,
        playerCard: r.playerCard ? {
          ...r.playerCard,
          img: resolveShinobiThumbnail(r.playerCard),
          image_url: resolveShinobiThumbnail(r.playerCard),
          jutsu: resolveShinobiJutsu(r.playerCard)
        } : null,
        botCard: r.botCard ? {
          ...r.botCard,
          img: resolveShinobiThumbnail(r.botCard),
          image_url: resolveShinobiThumbnail(r.botCard),
          jutsu: resolveShinobiJutsu(r.botCard)
        } : null
      }));
    }
  }

  // Legacy reconstruction: parse target wins from score e.g. "4 - 2"
  const [pWinsStr, bWinsStr] = (record.score || '0 - 0').split('-').map(s => s.trim());
  let targetPWins = parseInt(pWinsStr, 10);
  let targetBWins = parseInt(bWinsStr, 10);
  if (isNaN(targetPWins)) targetPWins = record.result === 'VICTORY' ? 3 : record.result === 'DEFEAT' ? 1 : 2;
  if (isNaN(targetBWins)) targetBWins = record.result === 'VICTORY' ? 1 : record.result === 'DEFEAT' ? 3 : 2;

  const pSquad = Array.isArray(record.playerSquad) ? record.playerSquad : [];
  const eSquad = Array.isArray(record.enemySquad) ? record.enemySquad : [];
  const totalSlots = Math.max(pSquad.length, eSquad.length, targetPWins + targetBWins, 3);

  // Calculate advantage difference per slot
  const slotDiffs = [];
  for (let i = 0; i < totalSlots; i++) {
    const pCard = pSquad[i] || null;
    const eCard = eSquad[i] || null;
    const pOvr = Number(pCard?.ovr) || (pCard ? 70 : 0);
    const eOvr = Number(eCard?.ovr) || (eCard ? 70 : 0);
    const diff = pOvr - eOvr;
    slotDiffs.push({ slot: i + 1, index: i, diff, pCard, eCard, pOvr, eOvr });
  }

  // Sort by difference descending: highest advantage to player first
  const sorted = [...slotDiffs].sort((a, b) => b.diff - a.diff);

  const slotWinnerMap = new Map();
  let assignedPWins = 0;
  let assignedBWins = 0;

  // Top advantage slots awarded to player
  for (let i = 0; i < sorted.length && assignedPWins < targetPWins; i++) {
    slotWinnerMap.set(sorted[i].index, 'player');
    assignedPWins++;
  }

  // Bottom advantage slots awarded to enemy bot (reverse order)
  for (let i = sorted.length - 1; i >= 0 && assignedBWins < targetBWins; i--) {
    if (!slotWinnerMap.has(sorted[i].index)) {
      slotWinnerMap.set(sorted[i].index, 'bot');
      assignedBWins++;
    }
  }

  // Generate consistent rounds array with realistic arena damage (~90-175)
  return slotDiffs.map(item => {
    const winner = slotWinnerMap.get(item.index) || 'draw';
    const basePDmg = Math.round((item.pOvr * 1.15) + 25);
    const baseBDmg = Math.round((item.eOvr * 1.15) + 25);

    const pDmg = winner === 'player'
      ? basePDmg + Math.round(item.pOvr * 0.35)
      : winner === 'bot'
        ? Math.max(45, basePDmg - Math.round(item.eOvr * 0.4))
        : basePDmg;

    const bDmg = winner === 'bot'
      ? baseBDmg + Math.round(item.eOvr * 0.35)
      : winner === 'player'
        ? Math.max(45, baseBDmg - Math.round(item.pOvr * 0.4))
        : baseBDmg;

    const pName = item.pCard?.name || 'Your Shinobi';
    const eName = item.eCard?.name || 'Enemy Shinobi';

    const pCardResolved = item.pCard ? {
      ...item.pCard,
      img: resolveShinobiThumbnail(item.pCard),
      image_url: resolveShinobiThumbnail(item.pCard),
      jutsu: resolveShinobiJutsu(item.pCard)
    } : null;

    const bCardResolved = item.eCard ? {
      ...item.eCard,
      img: resolveShinobiThumbnail(item.eCard),
      image_url: resolveShinobiThumbnail(item.eCard),
      jutsu: resolveShinobiJutsu(item.eCard)
    } : null;

    return {
      round: item.slot,
      slot: item.slot,
      winner,
      playerDmg: pDmg,
      botDmg: bDmg,
      playerJutsuProc: winner === 'player',
      botJutsuProc: winner === 'bot',
      playerCard: pCardResolved,
      botCard: bCardResolved,
      log: winner === 'player'
        ? `${pName} overwhelmed ${eName} (${pDmg} vs ${bDmg} DMG)!`
        : winner === 'bot'
          ? `${eName} struck down ${pName} (${bDmg} vs ${pDmg} DMG)!`
          : `Evenly matched clash between ${pName} and ${eName} (${pDmg} vs ${bDmg} DMG)!`
    };
  });
}

/**
 * Retrieve match history list from LocalStorage (newest first).
 * Automatically repairs any missing/broken card assets and guarantees complete rounds/matchup data.
 */
export function getMatchHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    let needsResave = false;
    const repaired = parsed.map(record => {
      let recordChanged = false;
      const fixSquad = (squad) => {
        if (!Array.isArray(squad)) return [];
        return squad.map(shinobi => {
          const validImg = resolveShinobiThumbnail(shinobi);
          const validJutsu = resolveShinobiJutsu(shinobi);
          if (
            !shinobi.img ||
            !shinobi.image_url ||
            shinobi.img !== validImg ||
            shinobi.image_url !== validImg ||
            !shinobi.jutsu ||
            shinobi.jutsu === 'Secret Ninja Art' ||
            shinobi.jutsu === 'Secret Jutsu' ||
            shinobi.jutsu === 'Secret Art'
          ) {
            recordChanged = true;
            return {
              ...shinobi,
              image_url: validImg,
              img: validImg,
              image: validImg,
              jutsu: validJutsu
            };
          }
          return shinobi;
        });
      };

      const newPlayerSquad = fixSquad(record.playerSquad);
      const newEnemySquad = fixSquad(record.enemySquad);

      // Check if existing rounds have corrupted data, missing winners, or bugged damage (> 350)
      const hasCorruptRounds = !Array.isArray(record.rounds)
        || record.rounds.length === 0
        || !record.rounds.every(r => r && (r.winner === 'player' || r.winner === 'bot' || r.winner === 'draw'))
        || record.rounds.some(r => Number(r.playerDmg) > 350 || Number(r.botDmg) > 350);

      let newRounds = record.rounds;
      if (hasCorruptRounds) {
        newRounds = ensureRecordRounds({
          ...record,
          playerSquad: newPlayerSquad,
          enemySquad: newEnemySquad
        });
        recordChanged = true;
      } else {
        // Normalize image URLs and jutsu names on valid rounds
        newRounds = record.rounds.map((r, idx) => ({
          ...r,
          slot: r.slot || r.round || idx + 1,
          round: r.round || r.slot || idx + 1,
          playerCard: r.playerCard ? {
            ...r.playerCard,
            img: resolveShinobiThumbnail(r.playerCard),
            image_url: resolveShinobiThumbnail(r.playerCard),
            image: resolveShinobiThumbnail(r.playerCard),
            jutsu: resolveShinobiJutsu(r.playerCard)
          } : null,
          botCard: r.botCard ? {
            ...r.botCard,
            img: resolveShinobiThumbnail(r.botCard),
            image_url: resolveShinobiThumbnail(r.botCard),
            image: resolveShinobiThumbnail(r.botCard),
            jutsu: resolveShinobiJutsu(r.botCard)
          } : null
        }));
      }

      if (recordChanged) {
        needsResave = true;
        return {
          ...record,
          playerSquad: newPlayerSquad,
          enemySquad: newEnemySquad,
          rounds: newRounds
        };
      }
      return {
        ...record,
        rounds: newRounds
      };
    });

    if (needsResave) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(repaired));
      } catch (e) {
        console.warn('[MatchHistory] Resave warning:', e);
      }
    }

    return repaired;
  } catch (err) {
    console.warn('[MatchHistory] Failed to read history:', err);
    return [];
  }
}

/**
 * Save new match record to LocalStorage with fully resolved image paths and jutsu names.
 */
export function saveMatchToHistory(matchData) {
  try {
    const current = getMatchHistory();

    // Map squads with verified image paths and resolved jutsu names
    const sanitizeSquad = (squad) => {
      if (!Array.isArray(squad)) return [];
      return squad.map(c => {
        const validImg = resolveShinobiThumbnail(c);
        return {
          id: c.id,
          name: c.name || 'Unknown Shinobi',
          img: validImg,
          image_url: validImg,
          image: validImg,
          ovr: Number(c.ovr) || 70,
          rarityClass: c.rarityClass || 'bronze',
          rarity: c.rarity || 'BRONZE',
          jutsu: resolveShinobiJutsu(c)
        };
      });
    };

    // Sanitize round-by-round combat results
    const sanitizeRounds = (rounds) => {
      if (!Array.isArray(rounds)) return [];
      return rounds.map((r, idx) => {
        const pCard = r.playerCard ? {
          id: r.playerCard.id,
          name: r.playerCard.name || 'Unknown Shinobi',
          img: resolveShinobiThumbnail(r.playerCard),
          image_url: resolveShinobiThumbnail(r.playerCard),
          image: resolveShinobiThumbnail(r.playerCard),
          ovr: Number(r.playerCard.ovr) || 70,
          rarityClass: r.playerCard.rarityClass || 'bronze',
          jutsu: resolveShinobiJutsu(r.playerCard)
        } : null;

        const bCard = r.botCard ? {
          id: r.botCard.id,
          name: r.botCard.name || 'Enemy Shinobi',
          img: resolveShinobiThumbnail(r.botCard),
          image_url: resolveShinobiThumbnail(r.botCard),
          image: resolveShinobiThumbnail(r.botCard),
          ovr: Number(r.botCard.ovr) || 70,
          rarityClass: r.botCard.rarityClass || 'bronze',
          jutsu: resolveShinobiJutsu(r.botCard)
        } : null;

        return {
          round: r.round || r.slot || idx + 1,
          slot: r.slot || r.round || idx + 1,
          winner: r.winner || 'draw',
          playerDmg: Number(r.playerDmg) || 0,
          botDmg: Number(r.botDmg) || 0,
          playerJutsuProc: Boolean(r.playerJutsuProc),
          botJutsuProc: Boolean(r.botJutsuProc),
          log: r.log || '',
          playerCard: pCard,
          botCard: bCard
        };
      });
    };

    const newRecord = {
      id: Date.now(),
      result: matchData.result || 'VICTORY', // "VICTORY" | "DEFEAT" | "DRAW"
      score: matchData.score || '0 - 0',
      playerSquad: sanitizeSquad(matchData.playerSquad),
      enemySquad: sanitizeSquad(matchData.enemySquad),
      enemyName: matchData.enemyName || 'Rogue Shinobi',
      rounds: sanitizeRounds(matchData.rounds),
      rewards: {
        coins: Number(matchData.rewards?.coins) || 0,
        exp: Number(matchData.rewards?.exp) || 0
      },
      date: formatMatchDate()
    };

    // Save up to 60 matches
    const updated = [newRecord, ...current].slice(0, 60);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('shinobi_match_history_updated', { detail: updated }));
    return updated;
  } catch (err) {
    console.warn('[MatchHistory] Failed to save match record:', err);
    return [];
  }
}

/**
 * Clear all match history records
 */
export function clearMatchHistory() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('shinobi_match_history_updated', { detail: [] }));
    return [];
  } catch (err) {
    console.warn('[MatchHistory] Failed to clear history:', err);
    return [];
  }
}
