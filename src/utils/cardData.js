import { clamp, RARITY_LABELS, getJutsuDetails, calculateChakraCost } from './cards.js';
import { getCharacterMeta } from './characterMeta.js';

export { getJutsuDetails, calculateChakraCost };


const STAR_TIERS_BY_CLASS = {
  mythic: { rarityClass: 'mythic', tiers: [{ minOvr: 0, stars: 5 }], fallbackStars: 5 },
  diamond: { rarityClass: 'diamond', tiers: [{ minOvr: 0, stars: 5 }], fallbackStars: 5 },
  gold: { rarityClass: 'gold', tiers: [{ minOvr: 95, stars: 5 }, { minOvr: 88, stars: 4 }], fallbackStars: 4 },
  silver: { rarityClass: 'silver', tiers: [{ minOvr: 88, stars: 4 }, { minOvr: 80, stars: 3 }], fallbackStars: 2 },
  bronze: { rarityClass: 'bronze', tiers: [{ minOvr: 75, stars: 3 }, { minOvr: 69, stars: 2 }], fallbackStars: 1 }
};

export function getJutsuForCharacter(card) {
  if (card && typeof card === 'object') {
    if (Array.isArray(card.equippedJutsu) && card.equippedJutsu.length > 0) {
      return card.equippedJutsu.map(id => getJutsuDetails(id).name).join(' / ');
    }
    if (card.jutsu) {
      return String(card.jutsu);
    }
  }
  return 'Secret Ninja Art';
}

export function getSummonsForCharacter(name) {
  const n = (name || '').toLowerCase();

  return [];
}
// Database Detail Summon & Source Image
const SUMMON_DETAILS = {
  kurama: { name: 'Nine-Tails Kurama', image: 'images/summon/kurama.webp', icon: 'images/summon/icon/kurama.webp', desc: 'The powerful nine-tailed beast.' },
  'Ninken Hounds': { name: 'Ninken Hounds', image: 'images/ninken.webp', desc: 'Kakashi tracking ninja hounds.' },
  crow: { name: 'Crow Clone', image: 'images/summon/itachi crow.webp', icon: 'images/summon/icon/itachi crow.webp', desc: 'Itachi illusionary crow dispersal.' },
  gamabunta: { name: 'Gamabunta', image: 'images/summon/gamabunta.webp', icon: 'images/summon/icon/gamabunta.webp', desc: "Chief toad of Mount Myoboku, Jiraiya and Naruto's powerful summon." },
  gamakichi: { name: 'Gamakichi', image: 'images/summon/gamakichi.webp', icon: 'images/summon/icon/gamakichi.webp', desc: "Gamabunta's son, a loyal and skilled young toad summon." },

  // Susanoo variants
  'Susanoo First': { name: 'Susanoo (First Form)', image: 'images/summon/sasuke first susanoo.webp', icon: 'images/summon/icon/sasuke first susanoo.webp', desc: 'The skeletal warrior formed by the Sharingan.' },
  'Susanoo Second': { name: 'Susanoo (Second Form)', image: 'images/summon/sasuke second susanoo.webp', icon: 'images/summon/icon/sasuke second susanoo.webp', desc: 'The fully armored humanoid summon of an Uchiha.' },
  'Perfect Susanoo': { name: 'Perfect Susanoo', image: 'images/summon/sasuke perfect susanoo.webp', icon: 'images/summon/icon/sasuke perfect susanoo.webp', desc: 'The complete, winged warrior form of the Susanoo.' },
  'Indra Susanoo': { name: 'Indra Susanoo', image: 'images/summon/sasuke indra susanoo.webp', icon: 'images/summon/icon/sasuke indra susanoo.webp', desc: 'The transcendent Susanoo of the Rinnegan.' },
  'Itachi First Susanoo': { name: 'Susanoo (First Form)', image: 'images/summon/itachi first susanoo.webp', icon: 'images/summon/icon/itachi first susanoo.webp', desc: "Itachi's skeletal Susanoo, wielding the Totsuka Blade." },
  'Itachi Perfect Susanoo': { name: 'Perfect Susanoo', image: 'images/summon/itachi perfect susanoo.webp', icon: 'images/summon/icon/itachi perfect susanoo.webp', desc: "Itachi's fully realized Susanoo, radiant and complete." },
  'Madara Perfect Susanoo': { name: 'Perfect Susanoo', image: 'images/summon/madara perfect susanoo.webp', icon: 'images/summon/icon/madara perfect susanoo.webp', desc: "Madara's Perfect Susanoo, a titan of overwhelming power." },
  'Shisui Perfect Susanoo': { name: 'Perfect Susanoo', image: 'images/summon/shisui perfect susanoo.webp', icon: 'images/summon/icon/shisui perfect susanoo.webp', desc: "Shisui's Perfect Susanoo, guardian of the will of fire." },
  'Kakashi Perfect Susanoo': { name: 'Perfect Susanoo', image: 'images/summon/kakashi perfect susanoo.webp', icon: 'images/summon/icon/kakashi perfect susanoo.webp', desc: "Kakashi's borrowed Perfect Susanoo, wielding Kamui's power." },

  katsuyu: { name: 'Katsuyu', image: 'images/summon/katsuyu.webp', icon: 'images/summon/icon/katsuyu.webp', desc: 'Medical slug summoned by Tsunade/Sakura.' },
  manda: { name: 'Manda', image: 'images/summon/manda.webp', icon: 'images/summon/icon/manda.webp', desc: 'Orochimaru giant boss snake.' },
  gyuki: { name: 'Eight-Tails Gyuki', image: 'images/summon/gyuki.webp', icon: 'images/summon/icon/gyuki.webp', desc: 'The octopus-bull beast.' },
  gedomazo: { name: 'Gedo Mazo', image: 'images/summon/gedo mazo.webp', icon: 'images/summon/icon/gedo mazo.webp', desc: 'Demonic statue of the Outer Path.' },
  juubi: { name: 'Ten-Tails', image: 'images/summon/juubi.webp', icon: 'images/summon/icon/juubi.webp', desc: 'The progenitor of all chakra.' },
  matatabi: { name: 'Two-Tails Matatabi', image: 'images/summon/matatabi.webp', icon: 'images/summon/icon/matatabi.webp', desc: 'The flaming blue phantom cat.' },
  isobu: { name: 'Three-Tails Isobu', image: 'images/summon/isobu.webp', icon: 'images/summon/icon/isobu.webp', desc: 'The armored turtle beast.' },
  songoku: { name: 'Four-Tails Son Goku', image: 'images/summon/son goku.webp', icon: 'images/summon/icon/son goku.webp', desc: 'The lava-wielding monkey king.' },
  kokuo: { name: 'Five-Tails Kokuo', image: 'images/summon/kokuo.webp', icon: 'images/summon/icon/kokuo.webp', desc: 'The horse-dolphin hybrid beast.' },
  saiken: { name: 'Six-Tails Saiken', image: 'images/summon/saiken.webp', icon: 'images/summon/icon/saiken.webp', desc: 'The corrosive slug beast.' },
  chomei: { name: 'Seven-Tails Chomei', image: 'images/summon/chomei.webp', icon: 'images/summon/icon/chomei.webp', desc: 'The armored beetle beast.' },
  shukaku: { name: 'One-Tail Shukaku', image: 'images/summon/shukaku.webp', icon: 'images/summon/icon/shukaku.webp', desc: 'The sand tanuki beast.' }
};

export function getSummonDetails(summonName) {
  const details = SUMMON_DETAILS[summonName] || {
    name: summonName,
    image: 'images/default_summon.webp',
    desc: 'Summoned entity.'
  };
  return {
    ...details,
    icon: details.icon || details.image
  };
}

function normalizeImagePath(rawImg) {
  let img = (rawImg || '').replace(/^\/?public\//, '');
  if (!img.startsWith('/') && !img.startsWith('http')) {
    img = '/' + img;
  }
  return img;
}

export function resolveRarity(card, ovr) {
  const currentOvr = ovr !== undefined ? ovr : (card?.ovr || 75);

  let rarityClass = 'bronze';
  if (currentOvr >= 98) {
    rarityClass = 'mythic';
  } else if (currentOvr >= 93) {
    rarityClass = 'diamond';
  } else if (currentOvr >= 88) {
    rarityClass = 'gold';
  } else if (currentOvr >= 75) {
    rarityClass = 'silver';
  }

  const spec = STAR_TIERS_BY_CLASS[rarityClass] || STAR_TIERS_BY_CLASS.bronze;
  const matchedTier = spec.tiers.find(tier => currentOvr >= tier.minOvr);
  const stars = (matchedTier ? matchedTier.stars : null)
    || spec.fallbackStars;

  return { rarityClass, stars };
}

// Preserves all JSON values (Name, Rarity, Jutsu, Summon, Image) and computes OVR from 4 stats
export function processRawCards(rawCards) {
  return rawCards.map(card => {
    const rawOvr = card.ovr || 75;
    // Buat 2 variasi pergeseran kecil (-2 sampai +2) berdasarkan ID kartu
    const delta1 = ((card.id * 3) % 5) - 2; // Hasil: -2, -1, 0, 1, atau 2
    const delta2 = ((card.id * 7) % 5) - 2; // Hasil: -2, -1, 0, 1, atau 2

    // Pasangkan + dan - agar total pergeserannya selalu NOL (Sangat Balance)
    const atk = card.atk !== undefined ? card.atk : clamp(rawOvr + delta1, 50, 110);
    const def = card.def !== undefined ? card.def : clamp(rawOvr - delta1, 50, 110);
    const spd = card.spd !== undefined ? card.spd : clamp(rawOvr + delta2, 50, 110);
    const chk = card.chk !== undefined ? card.chk : clamp(rawOvr - delta2, 50, 110);

    // OVR Otomatis Pas dengan rawOvr
    const computedOvr = Math.round((atk + def + spd + chk) / 4);
    const { rarityClass, stars } = resolveRarity(card, computedOvr);
    const meta = getCharacterMeta(card.id);
    const summons = Array.isArray(card.summons)
      ? card.summons
      : (meta.summons !== undefined ? meta.summons : getSummonsForCharacter(card.name));

    const equippedJutsu = Array.isArray(card.equippedJutsu)
      ? card.equippedJutsu
      : (card.equippedJutsu ? [card.equippedJutsu] : []);
    const resolvedJutsuStr = card.jutsu || (equippedJutsu.length > 0
      ? equippedJutsu.map(jId => getJutsuDetails(jId).name).join(' / ')
      : getJutsuForCharacter(card));

    return {
      id: card.id,
      name: card.name,
      ovr: computedOvr,
      rarity: RARITY_LABELS[rarityClass] || card.rarity || 'BRONZE',
      rarityClass,
      stars,
      img: normalizeImagePath(card.image_url || card.img),
      equippedJutsu,
      awakeningId: card.awakeningId || null,
      jutsu: resolvedJutsuStr,
      summon: summons[0] || null,
      summons: summons,
      atk,
      def,
      chk,
      spd,
      tags: meta.tags,       // ['jinchuriki', 'kage', ...]
      team: meta.team,       // ['Akatsuki', 'Team 7', ...]
      village: meta.village, // 'Konohagakure' | null
      clan: meta.clan,       // 'Uchiha' | null
      element: meta.element || 'neutral'
    };
  });
}
