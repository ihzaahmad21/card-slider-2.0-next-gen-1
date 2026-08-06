# 🥷 Step 3 Specification: Interactive JavaScript Mechanics (Gacha Rate & Filter)

## Objective
Implement `script.js` to bring interactive functionalities to the HTML/CSS canvas prototype. This includes filtering cards in the Showcase, managing user coin balance, and executing the Gacha Pack Roll logic with specific star drop rates.

---

## Technical Specifications

### 1. Coin & State Management
- Initial user balance: `1,500 Coins`.
- Update the Coins pill badge in the navbar dynamically when coins are spent.

### 2. Showcase Filter Mechanics
- Implement event listeners on filter buttons (`ALL`, `GOLD`, `SILVER`, `BRONZE`).
- Show/hide cards in the `#showcase` grid based on their `data-rarity` attributes.

### 3. Gacha Pack Probability Logic (Exact Rate System)
Implement a function `drawCard(packType)` triggered by the "Open Pack" buttons:

- **Bronze Pack (Cost: 100 Coins):**
  - Deduct 100 Coins.
  - Drops **1-Star to 3-Star** cards.
  - Drop rates: `1★ (50%)`, `2★ (40%)`, `3★ (10% - Low Chance)`.

- **Silver Pack (Cost: 500 Coins):**
  - Deduct 500 Coins.
  - Drops **3-Star to 4-Star** cards.
  - Drop rates: `3★ (85%)`, `4★ (15% - Low Chance)`.

- **Gold Pack (Cost: 1000 Coins):**
  - Deduct 1000 Coins.
  - Drops **4-Star to 5-Star** cards.
  - Drop rates: `4★ (80%)`, `5★ (20% - Low Chance)`.

### 4. Gacha Result Animation / Modal Mockup
- Display a smooth overlay/modal showing the pulled card result with its corresponding star rating, OVR stats, and rarity glow.
- Validate if user has enough coins before opening a pack (show warning if coins < cost).

---

## Agent Action Required
1. Create `script.js` containing all state management, filtering logic, and Gacha probability calculations.
2. Link `script.js` in `index.html`.
3. Add `data-rarity` attributes to card HTML elements in `index.html` to support instant filtering.