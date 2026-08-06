# 🥷 Master React Migration & Feature Specification

## Objective
Convert the fully-functional Vanilla HTML/CSS/JS prototype into a modern, modular React application (`src/App.jsx` and modular components). Implement the new Storm 4 Parchment Card View Modal and optimize Showcase rendering using Conditional Rendering.

---

## 🛠️ Component Architecture & State Structure

### 1. Global State Management (`App.jsx`)
- `coins`: Number state (Default: `1500` or loaded from `localStorage`).
- `cards`: Array of 190+ Shinobi cards loaded from `/cards.json`.
- `inventory`: Array of user-owned cards in `localStorage` with `quantity` and `starLevel`.
- `selectedCard`: Object state holding card data for the Storm 4 Modal (or `null` if closed).
- `isShowcaseOpen`: Boolean state for conditional rendering of the Showcase Grid modal.
- `toast`: Object `{ message: string, type: string }` for floating notifications.

---

## 🎨 New Features & Enhancements

### 1. Storm 4 Parchment Card Detail Modal (`<Storm4Modal />`)
- Triggered whenever a card tile in Inventory or Showcase is clicked (`setSelectedCard(card)`).
- **Styling & Layout:**
  - Background image set to local asset parchment texture (`assets/storm4_bg.jpg` or relative path).
  - High vertical ratio (`9:16`) container with rounded corners and outer glow.
  - Storm 4 logo banner positioned at top center.
  - Full-body character image rendered centered over the parchment with drop-shadow.
  - Dark floating glassmorphic panel at bottom displaying: Name, OVR Badge, Star Rating (`★`), Jutsu details, and ATK/DEF/CHK bars.
  - Interactive Action Buttons: `[ UPGRADE CARD ]`, `[ SELL CARD ]`, and `[ CLOSE / X ]`.
- Close triggers: Clicking the close button, pressing `ESC`, or clicking outside the backdrop (`e.target === e.currentTarget`).

### 2. Showcase Memory Optimization / Conditional Rendering (`<ShowcaseModal />`)
- Instead of keeping 190+ card DOM elements permanently mounted, wrap the Showcase Grid inside a conditional modal/drawer.
- Mount elements ONLY when `isShowcaseOpen === true`.
- When closed, unmount the entire Showcase component from the React DOM tree to free up browser RAM completely.
- Keep the `12 Cards / Load More` pagination logic inside the modal.

### 3. Gacha Multi-Pull Shop (`<GachaShop />`)
- Integrated in the Shop section with `[-] Count [+]` multiplier controls ($x1 - x10$).
- Modal result popup featuring instant **`[ KEEP CARD(S) ]`** vs **`[ QUICK SELL ]`** action buttons.

### 4. Hero Auto-Rotating Carousel (`<Hero />`)
- Auto-rotates top Gold Rare cards every 4 seconds with smooth CSS fade transitions.
- Pauses timer on hover (`mouseenter` / `mouseleave`).

---

## 🤖 Agent Action Required
1. Copy all CSS rules from `style.css` into `src/App.css` (ensuring background parchment & toast styles are present).
2. Refactor `index.html` and `script.js` into modular React JSX components:
   - `src/components/Navbar.jsx`
   - `src/components/Hero.jsx`
   - `src/components/GachaShop.jsx`
   - `src/components/Inventory.jsx`
   - `src/components/ShowcaseModal.jsx`
   - `src/components/Storm4Modal.jsx`
   - `src/components/ToastContainer.jsx`
3. Connect all state handlers (`coins`, `inventory`, `selectedCard`, `localStorage`) in `src/App.jsx`.