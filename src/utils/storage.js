const PREFIX = 'shinobiTCG.';

export const STORAGE_KEYS = {
  coins: `${PREFIX}userCoins`,
  rateBoosters: `${PREFIX}rateBoosters`,
  inventory: `${PREFIX}userInventory`
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
