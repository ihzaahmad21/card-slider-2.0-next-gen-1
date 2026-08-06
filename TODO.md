# Step 4 Database Integration — TODO

- [x] Read PROMPT_STEP4_DATABASE.md spec, script.js, index.html, cards.json
- [x] Verify dataset integrity (count, rarity distribution, image paths)
- [x] Confirm CSS/HTML hooks for Showcase + Gacha systems

## Implementation
- [x] Refine `processRawCards()` star logic (OVR-aware stars within declared rarity)
- [x] Add `LOAD_MORE_INCREMENT` constant + use it in Load More / pagination reset
- [x] Update hero "Ninja Cards" counter to reflect real dataset length (index.html id hook)
- [x] Ensure Showcase grid renders from loaded cards.json dataset
- [x] Ensure Gacha draw filters by exact rarity string from cards.json

## Verification
- [x] `node --check script.js` passes
- [x] Star distribution per tier verified (GOLD 23×4★/16×5★, SILVER 38×3★/10×4★, BRONZE 10×1★/8×2★/85×3★)
- [x] Gacha pools populated (bronze=103, silver=48, gold=39)
- [x] Manual: serve index.html over HTTP (e.g. `python -m http.server 8080`) and verify Showcase (190 cards, filters, Load More) + Gacha packs

# Step 5 Inventory System — TODO

## Implementation
- [ ] `index.html`: Add `#inventory` section (collection counter header, cards grid, empty-state placeholder)
- [ ] `script.js`: Add `localStorage` read/write for `userInventory`
- [ ] `script.js`: Duplicate tracking (increment `quantity` if card already owned)
- [ ] `script.js`: Add `renderInventory()` + `updateCollectionStats()` functions
- [ ] `script.js`: Hook `drawCard()` to persist pulls + refresh inventory UI
- [ ] `style.css`: Add inventory section styles, duplicate badge pill, empty-state styling

## Verification
- [ ] `node --check script.js` passes
- [ ] Draw test — verify card persists after page reload
- [ ] Duplicate test — verify quantity badge increments on duplicate pull
- [ ] Empty state test — verify placeholder shows before any pulls

