# 🥷 Refactor Specification: Unify Navigation to Pop-up Modals (Inventory & Shop)

## Objective
Convert the standalone Inventory and Shop page views into overlay Pop-up Modals (matching the current `ShowcaseModal.jsx` pattern). Maintain a persistent Main Page (Hero Showcase) while accessing all sub-features via Modal overlays.

---

## Technical Specifications

### 1. State Management in `App.jsx`
- Replace page routing/view-switching states with modal toggle states:
  - `isShowcaseOpen` (boolean)
  - `isInventoryOpen` (boolean)
  - `isShopOpen` (boolean)
  - `selectedCard` (for Storm4Modal detail view)

### 2. Component Refactoring

- **Navbar (`Navbar.jsx`):**
  - Navbar links ("Showcase", "Inventory", "Shop") should now trigger their respective modal toggle functions passed down from `App.jsx`.

- **Inventory Modal (`InventoryModal.jsx`):**
  - Wrap existing inventory content inside a modal backdrop overlay (`.modal-backdrop`).
  - Add a styled Close `(X)` button in the top right corner.
  - Clicking any card within the Inventory Modal should set `selectedCard` to open the `Storm4Modal` detail view over the inventory.

- **Shop / Gacha Modal (`ShopModal.jsx`):**
  - Wrap the Gacha pack purchasing UI inside a modal backdrop overlay.
  - Include a styled Close `(X)` button in the top right corner.
  - Seamlessly handle opening the `GachaResultModal` upon pack opening.

### 3. Modal Styling Consistency
- Ensure all main modals (`ShowcaseModal`, `InventoryModal`, `ShopModal`) share the same backdrop styling (`backdrop-filter: blur(8px); background: rgba(0, 0, 0, 0.85);`) and smooth entry keyframe animations.