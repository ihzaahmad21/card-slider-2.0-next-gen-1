# Plan — Celebration FX untuk Tier Diamond & Mythic

> **Status (per 29 Aug):** Fitur A & B ✅ SELESAI & build lolos. Plus 1 bug fix ✅. C–G selesai ✅. Build lolos. Lihat log di bawah.

Banyak ide yang muncul pas kerjain ini — semuanya grounded di kode yang ada:

- **A. Jackpot reveal FX (Diamond/Mythic)** — `GachaResultModal` cuma kasih warna beda di `reveal-tier-tag`. Mythic/diamond yang ke-pull bisa dapet animasi khusus (screen flash, bigger modal, particle burst) biar berasa "jackpot".
- **B. Pity/featured banner khusus Mythic** — Gold pack (`packs.js`) punya `pityGuarantee: 50` buat 5★, tapi Diamond/Mythic nyemplung di pool yang sama secara acak. Bisa tambah counter pity terpisah atau rate-boost khusus super-rare.
- **C. Rank-up celebration pas upgrade** — Pas +level naikin OVR lewat 93/98, `resolveRarity` (`App.jsx:309`) otomatis naikin kelas ke diamond/mythic. Sekarang itu diam aja — bisa dikasih toast/animasi "RANK UP!".
- **D. Codex progress bar per-tier** — `CodexView` udah hitung `stats.mythic/diamond/...` tapi JSX cuma render `stats.total`. Tinggal tambahin bar progres per rarity.
- **E. Holographic frame buat Mythic** — Sekarang static gradient. `Storm4Modal.css` udah punya keyframe `chakraPulse*`, bisa dipake buat shimmer/scanline di thumbnail kartu.
- **F. Sort by rarity** — `RARITY_CLASSES` (`cards.js:11`) sudah keurut dari tertinggi. Tinggal bikin helper sort buat Inventory/Showcase/Codex.
- **G. (Cleanup) Retire legacy script.js** — masih ada implementasi rarity vanilla-JS terpisah yang bakal divergen. Bisa dihapus/seragamkan.

> Saran: kerjain **C (rank-up)** + **A (jackpot FX)** dulu — dampak "wah" gede, risiko rendah, dan nyambung langsung sama tier baru ini.

---

## Dua fitur inti

1. **(A) Jackpot Reveal** saat Diamond/Mythic ke-pull.
2. **(B) Rank-Up** saat upgrade naikin kartu ke Diamond/Mythic.

**Tujuan:** bikin tier baru terasa "prestisius" tanpa ubah logic gacha/upgrade yang sudah jalan.

---

## A. Jackpot Reveal FX — `src/components/GachaResultModal.jsx` + `.css`

### A.1 Detection (`GachaResultModal.jsx`, setelah line 16)
```js
const hasJackpot = results.some(c => c.rarityClass === 'diamond' || c.rarityClass === 'mythic');
const jackpotTier = results.some(c => c.rarityClass === 'mythic') ? 'mythic'
                   : results.some(c => c.rarityClass === 'diamond') ? 'diamond' : null;
```
Tambah flag per-kartu di map (line 33-35) agar tiap kartu jackpot dapet glow sendiri:
```js
const isJackpot = rarityClass === 'diamond' || rarityClass === 'mythic';
```

### A.2 Markup
- Stage container (line 21):
  ```jsx
  className={`gacha-reveal-stage ${pullTypeClass} ${hasJackpot ? 'jackpot jackpot-' + jackpotTier : ''}`}
  ```
- Banner di bawah `<div className="gacha-reveal-title">` (line 23):
  ```jsx
  {hasJackpot && (
    <div className={`jackpot-banner jackpot-${jackpotTier}`}>
      ★ JACKPOT! {jackpotTier === 'mythic' ? 'MYTHIC' : 'DIAMOND'} OBTAINED ★
    </div>
  )}
  ```
- Card item (line 40-44): tambah `isJackpot ? 'jackpot-card' : ''` ke array className (mirip pola `awakening-card` di line 42).

### A.3 CSS (`GachaResultModal.css`)
- `.gacha-reveal-stage.jackpot` — overlay glow: `box-shadow: inset 0 0 120px rgba(236,72,153,.35)` (mythic) / cyan untuk diamond; animasi `jackpotFlash` (fade-in radial).
- `.jackpot-banner` — teks besar, `background: var(--mythic-gradient)` / `var(--diamond-gradient)`, `animation: jackpotPulse 1.2s infinite alternate`, text-shadow kuat, centered di atas grid.
- `.gacha-card-item.jackpot-card` — `animation: jackpotFloat 1.6s ease-in-out infinite`, `filter: drop-shadow(0 0 18px ...)`, `transform: scale(1.04)`.
- Keyframes baru: `@keyframes jackpotPulse`, `@keyframes jackpotFlash`, `@keyframes jackpotFloat` (taruh di bawah `@keyframes cardRevealSpin`).

---

## B. Rank-Up Celebration — `src/App.jsx` (`handleUpgradeCard`)

### B.1 Detection (`App.jsx`, di dalam `.map` sebelum line 309)
```js
const oldRarityClass = item.rarityClass;
```
Setelah `resolveRarity` (line 309), simpan old-nya. Di luar `.map`, bandingkan:
```js
const rankUpTier =
  updatedMainCard && ['diamond','mythic'].includes(updatedMainCard.rarityClass)
  && updatedMainCard.rarityClass !== oldRarityClassOfMain
    ? updatedMainCard.rarityClass : null;
```
(ambil `oldRarityClassOfMain` dari iterasi — simpan ke var di scope handler saat `itemKey === mainKey`).

### B.2 Action
- Ganti toast line 340 jadi kondisional:
  ```js
  showToast(rankUpTier
    ? `★ RANK UP! ${mainCard.name} naik ke ${RARITY_LABELS[rankUpTier]}!`
    : `${mainCard.name} successfully upgraded to +${mainLevel + 1}!`);
  ```
- (Opsional, low-risk) tambah state `const [rankUp, setRankUp] = useState(null)` + render overlay kecil di return `App.jsx` (mirip pattern modal `gachaResults`):
  ```jsx
  {rankUp && (
    <div className={`rankup-overlay rankup-${rankUp.tier}`} onClick={() => setRankUp(null)}>
      <div className="rankup-card">★ RANK UP! ★<br/>{rankUp.name} → {RARITY_LABELS[rankUp.tier]}</div>
    </div>
  )}
  ```
  Set `setRankUp({ name: mainCard.name, tier: rankUpTier })` saat rank-up, auto-dismiss via `setTimeout(() => setRankUp(null), 2600)`.

### B.3 CSS (`App.css` atau `style.css`)
- `.rankup-overlay` — full-screen dim + center, `animation: jackpotFlash .4s`.
- `.rankup-card` — reuse style `.jackpot-banner` (gradient + pulse) dengan ukuran lebih besar.

---

## Files yang diubah

| File | Bagian |
|------|--------|
| `src/components/GachaResultModal.jsx` | detection + banner + per-card class |
| `src/components/GachaResultModal.css` | `.jackpot-*`, keyframes |
| `src/App.jsx` | `handleUpgradeCard` (line ~300-341) + state overlay (optional) |
| `src/App.css` (atau `style.css`) | `.rankup-*` + reuse keyframes |

---

## Catatan / Risiko
- **Low risk:** tidak ubah `resolveRarity`, pool gacha, atau threshold — murni presentasional.
- `showToast` (`App.jsx:126`) adalah toast generik; varian Rank-Up cukup lewat teks + (opsional) overlay terpisah. Jangan modifikasi komponen Toast kalau tidak perlu.
- Cross ke Diamond butuh OVR ≥93, Mythic ≥98. Dengan +1 per stat per level (max +10, OVR max 110), kartu Gold (OVR 88) butuh ~+5 level ke Diamond, ~+10 ke Mythic — jadi Rank-Up bisa ke-trigger nyata saat Upgrade.
- Pola `awakening-card` (`GachaResultModal.jsx:42`) sudah membuktikan class per-kartu di grid aman digunakan.

---

## Verifikasi
1. `npm run build` → harus lolos (seperti sekarang).
2. Manual: buka Gold Pack berulang sampai dapat Diamond/Mythic → cek banner + glow.
3. Manual: Upgrade kartu Gold tinggi sampai lewati OVR 93/98 → cek toast/overlay "RANK UP!".
4. Pastikan Silver/Bronze pack & upgrade biasa tetap normal (tidak ke-trigger jackpot/rank-up).

---

## ✅ DONE — Log Pekerjaan

### A. Jackpot Reveal FX — SELESAI
- `src/components/GachaResultModal.jsx`: detection `hasJackpot`/`jackpotTier` (setelah line 16), flag per-kartu `isJackpot` di map, banner `★ JACKPOT! ★`, class `jackpot-card` di grid.
- `src/components/GachaResultModal.css`: `.gacha-reveal-stage.jackpot{-mythic,-diamond}`, `.jackpot-banner`, `.gacha-card-item.jackpot-card`, keyframes `jackpotFlash`/`jackpotPulse`/`jackpotFloat`.
- Build: lolos.

### B. Rank-Up Celebration — SELESAI
- `src/App.jsx`: detection rank-up (hitung `newOvr` → `resolveRarity` di luar `setInventory`), toast kondisional, state `rankUp` + overlay auto-dismiss 2.6s.
- `src/App.css`: `.rankup-overlay` / `.rankup-card` (gradient mythic/diamond, reuse keyframe `jackpotFlash`/`jackpotPulse`).
- Build: lolos.

### 🐞 BUG FIX — Material lebih kuat menghabiskan kartu MAX
- **Gejala:** punya 2 copy karakter sama (+10 MAX & +1). Select +1 → dropdown material default memilih +10 → upgrade menghabiskan +10 sbg tumbal, +1 jadi +2. Kartu terkuat kebuang.
- **Fix 1 (`Storm4Modal.jsx`, `availableMaterials`):** filter kartu yg `plusLevel > currentPlusLevel` agar kartu lebih kuat tak ditawarkan sbg material.
- **Fix 2 (`App.jsx`, `handleUpgradeCard`):** guard `(materialCard.plusLevel) > (mainCard.plusLevel)` → toast `Cannot use a stronger card as upgrade material!` + return.
- Build: lolos.

---

## 📋 TODO MALAM (belum dikerjakan)
- **C. Rank-up celebration pas upgrade** — *sudah ke-cover sebagian oleh B (toast/overlay).* Sisa opsional: varian suara/partikel.
- **D. Codex progress bar per-tier** — `CodexView` sudah hitung `stats.mythic/diamond/...`, tambah bar progres per rarity di JSX.
- **E. Holographic frame buat Mythic** — reuse keyframe `chakraPulse*` (`Storm4Modal.css`) buat shimmer/scanline thumbnail.
- **F. Sort by rarity** — helper sort dari `RARITY_CLASSES` (`cards.js:13`) untuk Inventory/Showcase/Codex.
- **G. (Cleanup) Retire legacy script.js** — hapus implementasi rarity vanilla-JS terpisah.

---

## ✅ SELESAI (29 Aug) — Log Pekerjaan Malam

### C. Rank-up celebration — SELESAI (tercover oleh B)
- Toast kondisional `★ RANK UP! ...` + overlay `.rankup-overlay` sudah berfungsi. Sisa opsional (suara/partikel) direlatifkan ke ide-ide baru di bawah.

### D. Codex progress bar per-tier — SELESAI
- `src/views/CodexView.jsx`: tambah konstanta `RARITY_TIERS` (label, color, gradient per rarity) + import `RARITY_CLASSES` dari `cards.js`.
- Render per-tier progress bar (Mythic → Bronze) di antara Total Progress dan search bar, dengan persentase dan jumlah owned/total per rarity.

### E. Holographic frame buat Mythic — SELESAI
- `src/App.css`: tambah `::before` (diagonal gradient sweep) + `::after` (scanline overlay) untuk `.card-container.mythic-tier`.
- Keyframes baru: `holographicShimmer` (5.5s linear infinite) + `holographicScanline` (3.2s linear infinite).

### F. Sort by rarity — SELESAI
- `src/utils/cards.js`: export helper `sortByRarity(cards, order = 'desc')`.
- `src/components/Inventory.jsx`: tambah opsi `rarity` di `SORT_OPTIONS` + comparator di sort logic (default desc = Mythic-first).
- `src/components/ShowcaseModal.jsx`: tambah tombol "Rarity ★" di samping Power sort toggle, dengan sort logic ascending Mythic-first.

### G. Retire legacy script.js — SELESAI
- Hapus `script.js` di root. Tidak direferensi di `index.html`, `main.jsx`, atau file sumber manapun.

Build: lolos ✅

### 🐞 BUG FIX — Gambar Ginkaku/Kinkaku tampil Shukaku
- **Gejala:** Kartu Ginkaku, Kinkaku, Kankuro, dan Temari menampilkan gambar shukaku (fallback `1 shukaku.webp`).
- **Akarnya:** `image_url` di `cards.json` pakai underscore tunggal (`ginkaku_reanimation_...`) tapi file gambar di `public/images/` pakai underscore ganda (`ginkaku__reanimation__...`).
- **Fix:** Koreksi 4 path di `src/data/cards.json`: Ginkaku (id239), Kankuro (id243), Kinkaku (id245), Temari (id250) — ganti single underscore → double underscore agar match dengan nama file asli.
- **Verifikasi:** Semua 240 kartu sekarang punya image file yang valid. Build lolos ✅.

---

## 💡 Ide Lanjutan (post-plan)

Berikut sekumpulan ide yang muncul pas eksplorasi kode, semua grounded di infrastruktur yang sudah ada:

- **Audio feedback untuk jackpot/rank-up** — `src/utils/audioManager.js` + `AudioControls.jsx` sudah ada. Tambahkan efek suara khusus saat Diamond/Mythic keluar atau rank-up terjadi.
- **Particle burst FX** — `EmberParticles.jsx` sudah ada di codebase. Bisa dipicu saat jackpot reveal atau rank-up untuk efek visual lebih "wow".
- **Card back variants per rarity** — Sekarang semua kartu pakai card back yang sama. Bisa bikin desain belakang kartu yang berbeda per rarity tier (diamond/mythic beda pola).
- **Rarity sort di CodexView** — CodexView belum punya fitur sorting sama sekali. Bisa tambahkan sort by rarity/OVR/name di sana, konsisten sama Inventory & ShowcaseModal.
- **Upgrade path visualization di Storm4Modal** — Tampilkan visual progress bar atau milestone "naik ke Diamond saat OVR 93, Mythic saat OVR 98" di panel upgrade modal, biar user tahu targetnya.
- **Subtle rarity grid indicator** — Di grid inventory/codex, tambahkan border accent kecil atau glow sesuai rarity, jadi lebih gampang bedain tanpa harus baca teks.
- **Rarity progress di QuickStats** — `QuickStats.jsx` dan `statsCalculator.js` sudah hitung `rareCounts`. Bisa tambahkan sparkbar per-kind di dashboard ringkasan.
- **Achievement system untuk collecting rarities** — Track kapan pengguna pertama kali mengumpulkan satu kartu dari setiap rarity tier, tampilkan badge/notifikasi.
