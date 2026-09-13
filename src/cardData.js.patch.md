# Patch untuk cardData.js

## 1. Tambahkan import di paling atas file
```js
import { getCharacterMeta } from './characterMeta.js';
```

## 2. Di dalam `processRawCards()`, tambahkan 4 field baru ke object return

Cari bagian ini:
```js
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
      jutsu: card.jutsu || getJutsuForCharacter(card),
      summon: card.summon || getSummonForCharacter(card.name),
      atk: card.atk !== undefined ? card.atk : clamp(card.ovr + ((card.id * 7) % 5) - 2, 50, 99),
      def: card.def !== undefined ? card.def : clamp(card.ovr - 3 + ((card.id * 3) % 4), 50, 99),
      chk: card.chk !== undefined ? card.chk : clamp(card.ovr + 2 - ((card.id * 11) % 5), 50, 99)
    };
  });
}
```

Ganti jadi (cuma nambah 4 baris terakhir sebelum penutup):
```js
export function processRawCards(rawCards) {
  return rawCards.map(card => {
    const { rarityClass, stars } = resolveRarity(card);
    const meta = getCharacterMeta(card.id);

    return {
      id: card.id,
      name: card.name,
      ovr: card.ovr,
      rarity: card.rarity,
      rarityClass,
      stars,
      img: normalizeImagePath(card.image_url || card.img),
      jutsu: card.jutsu || getJutsuForCharacter(card),
      summon: card.summon || getSummonForCharacter(card.name),
      atk: card.atk !== undefined ? card.atk : clamp(card.ovr + ((card.id * 7) % 5) - 2, 50, 99),
      def: card.def !== undefined ? card.def : clamp(card.ovr - 3 + ((card.id * 3) % 4), 50, 99),
      chk: card.chk !== undefined ? card.chk : clamp(card.ovr + 2 - ((card.id * 11) % 5), 50, 99),
      tags: meta.tags,       // ['jinchuriki', 'kage', ...]
      team: meta.team,       // ['Akatsuki', 'Team 7', ...]
      village: meta.village, // 'Konohagakure' | null
      clan: meta.clan        // 'Uchiha' | null
    };
  });
}
```

Taruh file `characterMeta.js` di folder yang sama dengan `cardData.js` (biasanya `src/utils/`).
