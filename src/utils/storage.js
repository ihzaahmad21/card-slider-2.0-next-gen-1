const PREFIX = 'shinobiTCG.';

export const STORAGE_KEYS = {
  coins: `${PREFIX}userCoins`,
  level: `${PREFIX}playerLevel`,
  exp: `${PREFIX}playerExp`,
  rateBoosters: `${PREFIX}rateBoosters`,
  inventory: `${PREFIX}userInventory`,
  deck: `${PREFIX}deck`,
  marketListings: `${PREFIX}marketListings`,
  activePlayerTeam: `${PREFIX}activePlayerTeam`,
  botEnemyTeam: `${PREFIX}botEnemyTeam`,
  battleStats: `${PREFIX}battleStats`,
  avatarIcon: `${PREFIX}avatarIcon`,
  achievements: `${PREFIX}achievements`,
  pity: (packType) => `${PREFIX}pity.${packType}`,
  matchHistory: 'shinobi_match_history'
};

export function readStoredNumber(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    if (saved === null) return fallback;
    const parsed = Number(saved);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export function readStoredJson(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

export function writeStoredValues(entries) {
  try {
    Object.entries(entries).forEach(([key, value]) => {
      localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
    });
  } catch (err) {
    console.warn('[ShinobiTCG] LocalStorage sync warning:', err);
  }
}
