# 🥷 Master Specification: Modal Architecture Refactor & FO3-Style Card Refinement (+1 to +10)

## Objective
Refactor navigation so Inventory and Shop act as overlay Pop-up Modals, remove redundant Navbar links, and implement a FIFA Online 3 (FO3) inspired Card Refinement / Upgrade system where duplicates are used as materials with dynamic success rates and failure risks.

---

## Part 1: Modal Architecture Refactor

1. **Navbar Updates (`Navbar.jsx`):**
   - Remove the `Gacha System` menu link from the Navbar.
   - Keep only: `Home`, `Showcase`, `Inventory`, and `Shop`.
   - Update links to trigger modal overlay states in `App.jsx` (`isInventoryOpen`, `isShopOpen`, `isShowcaseOpen`).

2. **Hero Section (`Hero.jsx`):**
   - Connect the main `GACHA NOW ➔` button directly to open the `Shop Modal`.

3. **Inventory & Shop Modals:**
   - Convert `Inventory` and `Shop` views into full backdrop-blurred Pop-up Modals matching `ShowcaseModal.jsx`.

---

## Part 2: FO3-Style Card Refinement Engine (+1 to +10)

### 1. Data Structure (`cards.json` / User State)
- Each card entry in inventory tracks its refinement level (`plusLevel`: 0 to 10).
- Multiple duplicates of the same card can exist with different `plusLevel` values (e.g., one `Boruto +2` and two `Boruto +1`).

### 2. Upgrade Recipe & Success Rate Algorithm
In `Storm4Modal.jsx` (Upgrade Action View):
- Allow player to select **1 Main Card** to upgrade (target target = `current plusLevel + 1`) and **1 Duplicate Material Card** from inventory.
- Regardless of material card level, successful upgrades ALWAYS increment main card level by +1 (e.g., `+9` main + `+9` material = `+10` main, NOT `+18`).

- **Mathematical Success Rate Formula:**
  ```javascript
  function getSuccessRate(mainLevel, materialLevel) {
    let baseRate = 100 - (mainLevel * 10); // Base rate decreases as main level increases
    let materialBonus = (materialLevel - 1) * 8; // Higher level materials give higher success rate
    let totalRate = Math.min(baseRate + materialBonus, 90); // Cap max chance at 90%
    return Math.max(totalRate, 5); // Hard cap min chance at 5%
  }
3. Upgrade Outcome Handler (Risk & Reward)
On Success:

Main card plusLevel increases by 1.

Base OVR & Stats (ATK, DEF, CHK) increase randomly (+2 to +4 OVR per level).

Bypass 99 OVR Cap: Cards can exceed 99 OVR when plusLevel > 0 (e.g., 105 OVR).

Material card is consumed and destroyed.

On Failure:

Material card is always consumed and destroyed.

Main card retains its current level (or optionally downgrades by 1 level if plusLevel >= 5).

Part 3: UI & Visual Badges
Refinement Badge Display:

Display the +Level designation next to character names across all views (e.g., KAWAKI KARMA +3).

Style +10 MAX cards with an intense glowing aura/badge.

Upgrade UI inside Storm4Modal.jsx:

Add a dropdown/selector to choose available duplicate cards as materials.

Show dynamic Success Rate Percentage (e.g., Success Rate: 45%) before clicking "UPGRADE".

Show requirement cost (Coins + 1 Duplicate).