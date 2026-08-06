# 🥷 Step 6 Specification: Card Upgrade System & Shop Mechanics

## Objective
Implement Card Upgrading and Shop mechanics in `script.js` to complete the core TCG game loop on the vanilla HTML/CSS prototype before final React migration.

---

## Technical Specifications

### 1. Card Upgrade System (`#inventory` / Card Detail Modal)
- Allow players to upgrade unlocked cards using Coins or Duplicate copies.
- **Upgrade Mechanics:**
  - Increase Star Rating (up to Max 5 Stars: `★ ★ ★ ★ ★`).
  - Stat Boost: Each star upgrade increases the card's base OVR by `+3` and scales its ATK/DEF/CHK stat bars.
  - Deduct upgrade cost in Coins (e.g., Level 1 to 2 = 200 Coins, Level 2 to 3 = 400 Coins, etc.).
- Update card entry in `localStorage` and refresh the UI.

### 2. Shop System (`#shop`)
- **Sell Duplicate Cards:**
  - Allow players to sell extra copies of cards they own for Coins:
    - Bronze Duplicate: `+30 Coins`
    - Silver Duplicate: `+150 Coins`
    - Gold Duplicate: `+400 Coins`
- **Coin Refill / Shop Packs:** Mockup buttons to purchase coin bundles or special rate boosters.

---

## Agent Action Required
1. Update `script.js` with functions for `upgradeCard(cardId)` and `sellCard(cardId)`.
2. Update `index.html` to add an Upgrade Button on Card Modals and build out the `#shop` section layout.
3. Update `style.css` for upgrade visual indicators and shop item styling.