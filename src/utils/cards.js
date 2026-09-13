import jutsuLibrary from '../data/jutsuLibrary.json';

export const MAX_PLUS_LEVEL = 10;
export const MAX_STARS = 5;
export const FALLBACK_CARD_IMAGE = '/images/1 shukaku.webp';

export const RARITY_LABELS = {
  mythic: 'MYTHIC RARE',
  diamond: 'DIAMOND RARE',
  gold: 'GOLD RARE',
  silver: 'SILVER RARE',
  bronze: 'BRONZE'
};

export const RARITY_CLASSES = ['mythic', 'diamond', 'gold', 'silver', 'bronze'];

const SELL_VALUES = { mythic: 1500, diamond: 800, gold: 400, silver: 150, bronze: 30 };
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
  return String(a.id) === String(b.id); // Tolerate string vs number id
}

const CANONICAL_BASE_NAMES = {
  naruto: 'Naruto Uzumaki',
  'naruto uzumaki': 'Naruto Uzumaki',
  sasuke: 'Sasuke Uchiha',
  'sasuke uchiha': 'Sasuke Uchiha',
  sakura: 'Sakura Haruno',
  'sakura haruno': 'Sakura Haruno',
  kakashi: 'Kakashi Hatake',
  'kakashi hatake': 'Kakashi Hatake',
  boruto: 'Boruto Uzumaki',
  'boruto uzumaki': 'Boruto Uzumaki',
  choji: 'Choji Akimichi',
  'choji akimichi': 'Choji Akimichi',
  hinata: 'Hinata Hyuga',
  'hinata hyuga': 'Hinata Hyuga',
  hiruzen: 'Hiruzen Sarutobi',
  'hiruzen sarutobi': 'Hiruzen Sarutobi',
  ino: 'Ino Yamanaka',
  'ino yamanaka': 'Ino Yamanaka',
  itachi: 'Itachi Uchiha',
  'itachi uchiha': 'Itachi Uchiha',
  kabuto: 'Kabuto Yakushi',
  'kabuto yakushi': 'Kabuto Yakushi',
  kiba: 'Kiba Inuzuka',
  'kiba inuzuka': 'Kiba Inuzuka',
  madara: 'Madara Uchiha',
  'madara uchiha': 'Madara Uchiha',
  minato: 'Minato Namikaze',
  'minato namikaze': 'Minato Namikaze',
  neji: 'Neji Hyuga',
  'neji hyuga': 'Neji Hyuga',
  obito: 'Obito Uchiha',
  'obito uchiha': 'Obito Uchiha',
  sarada: 'Sarada Uchiha',
  'sarada uchiha': 'Sarada Uchiha',
  shikamaru: 'Shikamaru Nara',
  'shikamaru nara': 'Shikamaru Nara',
  shino: 'Shino Aburame',
  'shino aburame': 'Shino Aburame',
  tobirama: 'Tobirama Senju',
  'tobirama senju': 'Tobirama Senju',
  hashirama: 'Hashirama Senju',
  'hashirama senju': 'Hashirama Senju',
  tsunade: 'Tsunade Senju',
  'tsunade senju': 'Tsunade Senju',
  zabuza: 'Zabuza Momochi',
  'zabuza momochi': 'Zabuza Momochi',
  'yugito nii': 'Yugito Nii',
  yugito: 'Yugito Nii',
  'hanzo of the salamander': 'Hanzo',
  hanzo: 'Hanzo'
};

const VARIANT_SUFFIX_REGEX = /\s+(double\s+sharinggan|double\s+sharingan|reanimation\s+resolved|reanimation|awakening\s+mode|awakening|karma\s+progression|karma|baryon\s+mode|baryon|sage\s+mode|sage|black\s+custom|hebi|taka|ems|rinne\s+sharinggan|rinnegan|support\s+kage|supporting\s+kage|war\s+arc\s+chief|war\s+arc|shippuden|part\s+1|great\s+war\s+ninja|6th\s+hokage|7th\s+hokage|4th\s+hokage|3rd\s+hokage|5th\s+hokage|2nd\s+hokage|byakugo)$/i;

export function getBaseCharacterName(cardName) {
  if (!cardName || typeof cardName !== 'string') return '';
  
  // 1. Ambil nama sebelum tanda kurung '(' pertama
  const parenIdx = cardName.indexOf('(');
  let base = (parenIdx !== -1 ? cardName.slice(0, parenIdx) : cardName).trim();
  
  // 2. Bersihkan suffix variasi non-parenthesis (misal: "Deidara Reanimation" -> "Deidara", "Sasuke Hebi" -> "Sasuke")
  base = base.replace(VARIANT_SUFFIX_REGEX, '').trim();

  // 3. Normalisasi ke nama kanonikal (misal: "Sasuke" / "Sasuke Uchiha" -> "Sasuke Uchiha")
  const key = base.toLowerCase();
  if (CANONICAL_BASE_NAMES[key]) {
    return CANONICAL_BASE_NAMES[key];
  }

  return base;
}

export function getRarityClass(card) {
  return (card && card.rarityClass) || 'bronze';
}

export function getStarString(stars, separator = '') {
  const full = Number(stars) || 1;
  const empty = Math.max(0, MAX_STARS - full);
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

export function sanitizeImagePath(value) {
  const src = String(value == null ? '' : value).trim();
  if (!src) return FALLBACK_CARD_IMAGE;
  const scheme = src.match(/^([a-z][a-z0-9+.-]*):/i);
  if (scheme && !/^https?$/i.test(scheme[1])) return FALLBACK_CARD_IMAGE;
  return src;
}

function sanitizeNumber(value, fallback) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

// Persisted inventory is user-writable (localStorage), so every field is
// re-validated rather than trusted as stored.
function sanitizeInventoryItem(item) {
  if (!item || typeof item !== 'object' || item.id === undefined || item.id === null) return null;
  
  // Ambil jutsu & summon asli dari semua kemungkinan key
  const actualJutsu = item.jutsu || item.jutsuName || item.specialJutsu || 'Wood Release: Deep Forest Bloom';
  const actualSummon = item.summon || item.summonName || 'None';
  const actualImg = item.image_url || item.img || item.image || item.artwork;

  return {
    ...item,
    id: item.id,
    instanceId: typeof item.instanceId === 'string' ? item.instanceId : `${item.id}-${Math.random().toString(36).slice(2, 8)}`,
    name: String(item.name == null ? 'Unknown Shinobi' : item.name),
    rarity: String(item.rarity == null ? RARITY_LABELS.bronze : item.rarity),
    rarityClass: RARITY_CLASSES.includes(item.rarityClass) ? item.rarityClass : 'bronze',
    img: sanitizeImagePath(actualImg),
    image_url: sanitizeImagePath(actualImg),
    equippedJutsu: Array.isArray(item.equippedJutsu) ? item.equippedJutsu : (item.equippedJutsu ? [item.equippedJutsu] : []),
    awakeningId: item.awakeningId || null,
    jutsu: String(actualJutsu),
    summon: String(actualSummon),
    ovr: sanitizeNumber(item.ovr, 70),
    stars: sanitizeNumber(item.stars, 1),
    atk: sanitizeNumber(item.atk, 50),
    def: sanitizeNumber(item.def, 50),
    spd: sanitizeNumber(item.spd, 50),
    chk: sanitizeNumber(item.chk, 50),
    quantity: sanitizeNumber(item.quantity, 1),
    plusLevel: sanitizeNumber(item.plusLevel, 0)
  };
}

export function sanitizeInventory(items) {
  if (!Array.isArray(items)) return [];
  return items.map(sanitizeInventoryItem).filter(Boolean);
}

export function prependBaseUrl(path) {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('data:')) {
    return path;
  }
  let cleanPath = path.replace(/^\/?public\//, '');
  if (cleanPath.startsWith('/')) {
    cleanPath = cleanPath.slice(1);
  }
  const isTest = typeof process !== 'undefined' && process.env.NODE_ENV === 'test';
  const baseUrl = isTest ? '/' : (import.meta.env.BASE_URL || '/');
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';
  return normalizedBase + cleanPath;
}

export function getCardImageSrc(card) {
  if (!card) return '';
  if (card.img === '') return prependBaseUrl(FALLBACK_CARD_IMAGE);
  const rawPath = card.image_url || card.image || card.artwork || card.img || `/images/${card.id}.png`;
  return prependBaseUrl(rawPath);
}

// Modal artwork uses HD variant of the grid thumbnail
// Tries /images/HD/ first, falls back to regular /images/ if HD doesn't exist
export function buildHdImagePath(cardOrImg) {
  if (!cardOrImg) return '';
  
  // Accept either card object or string path
  const rawPath = typeof cardOrImg === 'object' 
    ? (cardOrImg.image_url || cardOrImg.img || cardOrImg.image || '') 
    : String(cardOrImg);

  if (!rawPath) return prependBaseUrl(FALLBACK_CARD_IMAGE);

  // Try to upgrade to HD folder, keeping original extension (.webp)
  let hdPath = rawPath;
  if (hdPath.includes('images/HD/')) {
    // Already HD path
  } else if (hdPath.includes('images/')) {
    hdPath = hdPath.replace('images/', 'images/HD/');
  } else {
    hdPath = `images/HD/${hdPath}`;
  }

  const isTest = typeof process !== 'undefined' && process.env.NODE_ENV === 'test';
  const baseUrl = isTest ? '/' : (import.meta.env.BASE_URL || '/');
  let relativePath = hdPath;
  if (baseUrl !== '/' && relativePath.startsWith(baseUrl)) {
    relativePath = relativePath.slice(baseUrl.length);
  }
  return prependBaseUrl(relativePath);
}

// One-shot <img> fallback: swap the source once, then stop retrying
export function createImageFallbackHandler(fallbackSrc) {
  return (event) => {
    event.target.onerror = null;
    event.target.src = prependBaseUrl(fallbackSrc);
  };
}
export function getAttributeColorClass(val) {
  const num = Number(val) || 0;
  if (num >= 100) return 'stat-gold';
  if (num >= 95) return 'stat-red';
  if (num >= 85) return 'stat-purple';
  if (num >= 75) return 'stat-dark-green';
  if (num >= 70) return 'stat-light-green';
  return 'stat-silver';
}

export function sortByRarity(cards, order = 'desc') {
  const dir = order === 'asc' ? 1 : -1;
  return [...(cards || [])].sort((a, b) => {
    const ra = RARITY_CLASSES.indexOf(a.rarityClass || 'bronze');
    const rb = RARITY_CLASSES.indexOf(b.rarityClass || 'bronze');
    return ra === rb ? 0 : (ra - rb) * dir;
  });
}

/**
 * Mengambil detail lengkap data jutsu dari jutsuLibrary.json
 * @param {string|object} jutsuId - ID referensi jutsu (contoh: 'jutsu-chidori-01') atau objek jutsu
 * @returns {object} Data lengkap jutsu
 */
export function getJutsuDetails(jutsuId) {
  if (!jutsuId) {
    return {
      id: 'jutsu-secret-art-01',
      name: 'Secret Ninja Art',
      type: 'NINJUTSU',
      element: 'NEUTRAL',
      baseDamage: 300,
      critRate: 0.10,
      baseChakraCost: 35,
      target: 'SINGLE',
      description: 'Seni bela diri rahasia ninja.'
    };
  }

  // Jika input sudah berbentuk objek jutsu
  if (typeof jutsuId === 'object' && jutsuId !== null) {
    return {
      id: jutsuId.id || 'jutsu-custom',
      name: jutsuId.name || 'Secret Ninja Art',
      type: jutsuId.type || 'NINJUTSU',
      element: jutsuId.element || 'NEUTRAL',
      baseDamage: jutsuId.baseDamage ?? 300,
      critRate: jutsuId.critRate ?? 0.10,
      baseChakraCost: jutsuId.baseChakraCost ?? 35,
      target: jutsuId.target || 'SINGLE',
      description: jutsuId.description || 'Teknik ninjutsu shinobi.'
    };
  }

  const strId = String(jutsuId).trim();

  // 1. Cek langsung berdasarkan key jutsuId di jutsuLibrary
  if (jutsuLibrary && jutsuLibrary[strId]) {
    return {
      id: strId,
      ...jutsuLibrary[strId]
    };
  }

  // 2. Cek apakah input cocok dengan nama jutsu di database
  if (jutsuLibrary) {
    const matchedEntry = Object.entries(jutsuLibrary).find(
      ([, data]) => data.name && data.name.toLowerCase() === strId.toLowerCase()
    );
    if (matchedEntry) {
      return {
        id: matchedEntry[0],
        ...matchedEntry[1]
      };
    }
  }

  // 3. Fallback cerdas agar UI tidak pernah error
  const fallbackName = strId.startsWith('jutsu-')
    ? strId
        .replace(/^jutsu-/, '')
        .replace(/-\d+$/, '')
        .replace(/-/g, ' ')
        .replace(/\b\w/g, char => char.toUpperCase())
    : strId;

  return {
    id: strId,
    name: fallbackName || 'Secret Ninja Art',
    type: 'NINJUTSU',
    element: 'NEUTRAL',
    baseDamage: 300,
    critRate: 0.10,
    baseChakraCost: 35,
    target: 'SINGLE',
    description: `Teknik rahasia: ${fallbackName || strId}`
  };
}

/**
 * Menghitung penggunaan chakra aktual berdasarkan stat CHK kartu.
 * Stat CHK yang semakin tinggi memotong/menghemat penggunaan chakra.
 * Rumus: Math.max(5, Math.round(baseCost * (1 - (chkStat / 200))))
 * @param {number} baseCost - Base chakra cost dari jutsu
 * @param {number} chkStat - Stat CHK karakter/kartu
 * @returns {number} Chakra cost aktual setelah diskon stat CHK (minimal 5)
 */
export function calculateChakraCost(baseCost, chkStat = 50) {
  const cost = Number(baseCost) || 0;
  const chk = Number(chkStat) || 0;
  return Math.max(5, Math.round(cost * (1 - (chk / 200))));
}

