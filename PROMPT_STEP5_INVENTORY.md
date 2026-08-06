# 🥷 Step 5 Specification: Inventory System & Collection Storage

## Objective
Implement a persistent Inventory System using Browser `localStorage`. When a user pulls a card from any Gacha Pack, it must be stored in their collection and rendered dynamically in the `#inventory` section.

---

## Technical Specifications

### 1. LocalStorage Persistence
- Store drawn cards in a `userInventory` array inside `localStorage`.
- Support duplicate tracking: If a user pulls a card they already own, increment its `quantity` property (e.g., `x2`, `x3`).

### 2. Inventory UI Section (`#inventory`)
- **Collection Counter Header:** Display progress text (e.g., `"Collection: 15 / 191 Shinobi Unlocked"`).
- **Cards Grid Display:** Render all unlocked cards stored in `userInventory`.
- **Duplicate Badge:** Show a small pill badge on the card corner displaying quantity if `quantity > 1`.
- **Empty Inventory Placeholder:** If no cards have been pulled yet, show a clean message: *"Your inventory is empty! Roll some Gacha Packs to collect Shinobi cards."*

### 3. Gacha System Integration
- Update the `drawCard()` function in `script.js`:
  1. Pick card from `cards.json` based on pack drop rates.
  2. Add the card to `userInventory` (or increment quantity if duplicate).
  3. Save to `localStorage`.
  4. Automatically refresh/update the `#inventory` grid UI.

---

## Agent Action Required
1. Update `script.js` to handle `localStorage` reads/writes for user inventory.
2. Update `index.html` to create a dedicated `#inventory` grid container and collection stats bar.
3. Update `style.css` for duplicate badges and empty state styling.