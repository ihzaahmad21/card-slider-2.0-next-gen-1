# 🥷 UI/UX Bug Fix Specification: Modal Enhancements & Toast Notification

## Objective
Fix UI/UX issues in the card detail modal (`#inventory` / detail panel) and improve toast notifications in `script.js`, `style.css`, and `index.html`.

---

## Technical Specifications

### 1. Change "Sell Duplicate" to Universal "Sell Card" Mechanics
- **Label Update:** Change button label from `"Sell Duplicate"` to `"Sell Card"`.
- **Selling Rules:**
  - Players can sell ANY card copy regardless of whether it's a duplicate or single copy (`Owned Copies >= 1`).
  - **Single Copy Sale:** If a player sells a card with `Owned Copies === 1`, deduct the copy, add Coins according to rarity value, and remove the card from the active inventory grid. Close the modal after sale.
  - **Duplicate Copy Sale:** If `Owned Copies > 1`, decrement `quantity` by 1 and add Coins.
- **Rarity Sell Values:**
  - Bronze Card: `+30 Coins`
  - Silver Card: `+150 Coins`
  - Gold Card: `+400 Coins`

### 2. Top-Right Floating Toast Notifications
- Remove bottom modal alert badges that block buttons.
- Create a global `#toast-container` fixed at the top-right of the screen (`position: fixed; top: 20px; right: 20px; z-index: 9999`).
- Show quick floating toast messages (e.g., *"Sold Fuu for +150 Coins!"* or *"Upgraded to 5-Star!"*) that slide in from the right and automatically fade out after 2.5 seconds.

### 3. Click-Outside Modal Dismissal (Backdrop Dismiss)
- Add a click event listener on the modal backdrop element (`.modal-overlay`).
- When a user clicks outside the inner modal content card (on the dark background space), trigger the modal close function immediately.

---

## Agent Action Required
1. Update `script.js` to handle universal card selling, click-outside modal dismissal, and top-right toast system.
2. Update `style.css` for the top-right toast notification container and smooth slide-in animations.
3. Update `index.html` if additional modal backdrop wrapper elements are needed.