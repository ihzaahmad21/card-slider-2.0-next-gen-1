# 🥷 Step 2 Specification: Main Showcase Grid & Card Variations

## Objective
Enhance `index.html` and `style.css` to populate the `#showcase` section with realistic card components across all three rarity tiers (Bronze, Silver, Gold). Lock down the grid layout and card detail components (Jutsu, Stats Bars, Star Ratings).

---

## Technical Requirements & Guidelines

### 1. Showcase Section Layout (`#showcase`)
- **Title & Description:** Clean header with filter pill buttons (`ALL`, `GOLD (4-5★)`, `SILVER (3-4★)`, `BRONZE (1-3★)`).
- **Responsive Grid:** `grid-template-columns: repeat(auto-fill, minmax(220px, 1fr))` with `gap: 24px`.

### 2. Card Variations to Implement in HTML:

#### A. Gold Rare Card (e.g., Naruto Baryon Mode / Sasuke Rinnegan)
- **Border:** `#f59e0b` with gold glow.
- **Header:** Name + `95 OVR` badge.
- **Stats:** High ATK/DEF/CHK bars filled with gold/cyan gradient.
- **Details:** Jutsu Name (`Rasengan / Baryon Tail`), Summoning (`Nine-Tails Kurama`).
- **Footer:** `★ ★ ★ ★ ★` (5 Stars) | `GOLD RARE`.

#### B. Silver Rare Card (e.g., Kakashi Hatake / Itachi)
- **Border:** `#94a3b8` with silver glow.
- **Header:** Name + `88 OVR` badge.
- **Stats:** Mid-high ATK/DEF/CHK bars filled with silver/blue gradient.
- **Details:** Jutsu Name (`Raikiri / Kamui`), Summoning (`Ninken Hounds`).
- **Footer:** `★ ★ ★ ★ ☆` (4 Stars) | `SILVER RARE`.

#### C. Bronze Card (e.g., Akatsuchi / Genin Shinobi)
- **Border:** `#b45309` with bronze glow.
- **Header:** Name + `75 OVR` badge.
- **Stats:** Standard ATK/DEF/CHK bars filled with bronze/orange gradient.
- **Details:** Jutsu Name (`Earth Release: Golem`), Summoning (`None`).
- **Footer:** `★ ★ ★ ☆ ☆` (3 Stars) | `BRONZE`.

### 3. Rate Probability Spec Note (For Future Gacha Logic)
- **Bronze Pack (100 Coins):** Drops 1-3 Stars (3★ Drop Rate: 10%).
- **Silver Pack (500 Coins):** Drops 3-4 Stars (4★ Drop Rate: 15%).
- **Gold Pack (1000 Coins):** Drops 4-5 Stars (5★ Drop Rate: 20%).

---

## Agent Action Required
1. Update `index.html` to fill `#showcase` with at least 6 sample card HTML elements representing Gold, Silver, and Bronze tiers.
2. Update `style.css` to refine card hover effects, stats bar styling, and filter button states.