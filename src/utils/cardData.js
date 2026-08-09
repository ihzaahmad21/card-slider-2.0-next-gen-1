import { clamp } from './cards.js';

const STAR_THRESHOLDS = {
  'GOLD RARE': { rarityClass: 'gold', tiers: [{ minOvr: 95, stars: 5 }, { minOvr: 88, stars: 4 }], fallbackStars: 3 },
  'SILVER RARE': { rarityClass: 'silver', tiers: [{ minOvr: 88, stars: 4 }, { minOvr: 80, stars: 3 }], fallbackStars: 2 },
  BRONZE: { rarityClass: 'bronze', tiers: [{ minOvr: 75, stars: 3 }, { minOvr: 69, stars: 2 }], fallbackStars: 1 }
};

const JUTSU_RULES = [
  { keywords: ['naruto', 'baryon'], value: 'Rasengan / Baryon Tail' },
  { keywords: ['naruto', 'sage'], value: 'Sage Art: Rasenshuriken' },
  { keywords: ['naruto', 'six paths'], value: 'Truth-Seeking Orbs' },
  { keywords: ['naruto', 'bijuu'], value: 'Tailed Beast Bomb' },
  { keywords: ['sasuke', 'rinne'], value: "Indra's Arrow / Chidori" },
  { keywords: ['sasuke'], value: 'Fire Release / Sharingan Genjutsu' },
  { keywords: ['kakashi'], value: 'Raikiri / Kamui' },
  { keywords: ['itachi'], value: 'Tsukuyomi / Amaterasu' },
  { keywords: ['madara'], value: 'Tengai Shinsei / Susanoo' },
  { keywords: ['gaara'], value: 'Sand Tsunami / Shield' },
  { keywords: ['guy'], value: 'Night Guy / Morning Peacock' },
  { keywords: ['hashirama'], value: 'Wood Style: Sage Art' },
  { keywords: ['minato'], value: 'Flying Raijin / Rasengan' }
];

const SUMMON_RULES = [
  { keywords: ['naruto'], value: 'Nine-Tails Kurama' },
  { keywords: ['sasuke'], value: 'Susanoo Armor' },
  { keywords: ['kakashi'], value: 'Ninken Hounds' },
  { keywords: ['itachi'], value: 'Crow Clone' },
  { keywords: ['gaara'], value: 'Shukaku Sand' },
  { keywords: ['jiraiya'], value: 'Toad Gamabunta' },
  { keywords: ['minato'], value: 'Toad Gamabunta' },
  { keywords: ['tsunade'], value: 'Katsuyu Slug' },
  { keywords: ['sakura'], value: 'Katsuyu Slug' },
  { keywords: ['orochimaru'], value: 'Giant Snake Manda' }
];

function matchByName(name, rules, fallback) {
  const n = (name || '').toLowerCase();
  const match = rules.find(rule => rule.keywords.every(keyword => n.includes(keyword)));
  return match ? match.value : fallback;
}

export function getJutsuForCharacter(name) {
  return matchByName(name, JUTSU_RULES, 'Secret Ninja Art');
}

export function getSummonForCharacter(name) {
  return matchByName(name, SUMMON_RULES, 'None');
}

function normalizeImagePath(rawImg) {
  let img = (rawImg || '').replace(/^\/?public\//, '');
  if (!img.startsWith('/') && !img.startsWith('http')) {
    img = '/' + img;
  }
  return img;
}

function resolveRarity(card) {
  const spec = STAR_THRESHOLDS[card.rarity] || STAR_THRESHOLDS.BRONZE;
  const stars = card.stars
    || (spec.tiers.find(tier => card.ovr >= tier.minOvr) || {}).stars
    || spec.fallbackStars;
  return { rarityClass: spec.rarityClass, stars };
}

// Preserves all JSON values (OVR, Name, Rarity, Jutsu, Summon, Stats, Image)
export function processRawCards(rawCards) {
  return rawCards.map(card => {
    const { rarityClass, stars } = resolveRarity(card);

    return {
      id: card.id,
      name: card.name,
      ovr: card.ovr,
      rarity: card.rarity,
      rarityClass,
      stars,
      img: normalizeImagePath(card.image_url || card.img),
      jutsu: card.jutsu || getJutsuForCharacter(card.name),
      summon: card.summon || getSummonForCharacter(card.name),
      atk: card.atk !== undefined ? card.atk : clamp(card.ovr + ((card.id * 7) % 5) - 2, 50, 99),
      def: card.def !== undefined ? card.def : clamp(card.ovr - 3 + ((card.id * 3) % 4), 50, 99),
      chk: card.chk !== undefined ? card.chk : clamp(card.ovr + 2 - ((card.id * 11) % 5), 50, 99)
    };
  });
}
