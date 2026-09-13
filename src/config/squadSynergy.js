// squadSynergy.js
// Config buat fitur "Squad Synergy Bonus" di Deck Builder.
//
// Tiap entry mendefinisikan:
//   - team: nama tim (harus persis sama dengan value di card.team, lihat characterMeta.js)
//   - coreIds: array id kartu yang WAJIB ada semua di deck biar synergy aktif
//              (pakai id spesifik, bukan cuma "tim sama", karena satu karakter
//              bisa punya banyak versi kartu — synergy cuma nyala buat versi tertentu)
//   - bonus: { atk, def, chk } — ditambahkan ke SEMUA kartu di deck kalau syarat lolos
//   - label: teks yang muncul di UI pas synergy aktif (mis. "Team 7 Assembled!")
//
// Silakan tambah/ubah entry ini bebas — tidak perlu ubah kode lain,
// UI Deck Builder akan otomatis baca dari sini.

export const SQUAD_SYNERGIES = [
  {
    team: 'Team 7',
    coreIds: [114, 152, 141], // placeholder contoh — ganti sesuai id yang kamu mau jadi "versi resmi" Team 7
    bonus: { atk: 5, def: 5, chk: 5 },
    label: 'Team 7 Assembled!'
  },
  {
    team: 'Akatsuki',
    coreIds: [34, 91, 146, 93], // Deidara, Kisame, Sasori, Konan (contoh — sesuaikan)
    bonus: { atk: 8, def: 4, chk: 4 },
    label: 'Akatsuki United!'
  },
  {
    team: 'Sannin',
    coreIds: [65, 127, 181], // Jiraiya, Orochimaru, Tsunade
    bonus: { atk: 6, def: 6, chk: 6 },
    label: 'Legendary Sannin!'
  }
  // Tambah squad lain di sini...
];

export function getActiveSynergies(deckCardIds) {
  const ownedIdSet = new Set(deckCardIds);
  return SQUAD_SYNERGIES.filter(squad =>
    squad.coreIds.every(id => ownedIdSet.has(id))
  );
}

// Total bonus gabungan (kalau lebih dari 1 synergy aktif sekaligus, ditotal)
export function getTotalSynergyBonus(deckCardIds) {
  const active = getActiveSynergies(deckCardIds);
  return active.reduce(
    (total, squad) => ({
      atk: total.atk + squad.bonus.atk,
      def: total.def + squad.bonus.def,
      chk: total.chk + squad.bonus.chk
    }),
    { atk: 0, def: 0, chk: 0 }
  );
}
