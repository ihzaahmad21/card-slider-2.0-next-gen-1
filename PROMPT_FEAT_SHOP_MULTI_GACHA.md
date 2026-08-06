# 🥷 Feature Specification: Shop Gacha Integration, Multi-Pull System, & Quick Keep/Sell

## Objective
Integrate the Gacha Pack opening system directly into the Shop section with a Multi-Pull quantity selector (`x1` to `x10`). Add instant "Keep Card" vs "Quick Sell" action buttons to the Gacha result popup, and populate Jutsu/Summoning data across all character records.

---

## Technical Specifications

### 1. Gacha Multi-Pull System in Shop (`#shop`)
- **Pack Multipliers:** Add quantity controls `[-] Count [+]` to each Pack Card (Bronze, Silver, Gold).
- **Quantity Limits:** Min `1`, Max `10` pulls per transaction.
- **Dynamic Cost Calculation:** Display total cost dynamically (e.g., `5x Gold Packs = 5,000 Coins`).
- **Validation:** Check if `userCoins >= (packCost * quantity)` before starting the roll animation.

### 2. Gacha Result Pop-up: Instant "Keep" vs "Quick Sell"
When cards are pulled, show a dedicated result modal with two primary action buttons:
- **`[ KEEP CARD(S) ]` Button:**
  - Saves the pulled card(s) into `userInventory` in `localStorage`.
  - Shows success toast: *"Card(s) added to Inventory!"*.
- **`[ QUICK SELL ]` Button:**
  - Immediately converts the pulled card(s) into Coins based on their sell value.
  - Adds Coins directly to `userCoins`.
  - Shows success toast: *"Quick sold for +X Coins!"*.

### 3. Comprehensive Jutsu & Summoning Data Mapping
- Update `script.js` / `cards.json` to assign fallback Jutsu names and Summoning attributes dynamically based on character names if explicit values are missing:
  - Bijuu / Jinchuriki: Jutsu = *"Tailed Beast Bomb / Secret Shinobi Art"*, Summon = *"Corresponding Bijuu"*.
  - Uchiha: Jutsu = *"Fire Release / Sharingan Genjutsu / Amaterasu"*.
  - Uzumaki: Jutsu = *"Rasengan / Sage Art / Shadow Clone"*.
  - General Shinobi: Jutsu = *"Secret Ninja Art"*, Summon = *"None"*.

---

## Agent Action Required
1. Update `index.html` to place Gacha Pack cards inside `#shop` with quantity selector controls (`x1` - `x10`).
2. Update `script.js` to handle Multi-Pull array processing, Quick Sell vs Keep logic, and dynamic Jutsu mapping.
3. Update `style.css` for multi-pull controls, batch result card sliders, and modal action buttons.