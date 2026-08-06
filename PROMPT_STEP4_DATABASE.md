# 🥷 Step 4 Specification: Inject Real Dataset (191 Shinobi Cards)

## Objective
Connect `script.js` to fetch and load the full 191 Shinobi card dataset from `cards.json`. Replace all dummy card data in the Showcase and Gacha systems with real character records, OVR stats, and local image paths.

---

## Technical Specifications

### 1. Data Source Setup
- Ensure `cards.json` (containing all 191 character objects) is placed in the workspace root or `/src/data/` directory.
- Schema per card object:
  ```json
  {
    "id": 1,
    "name": "1 Shukaku",
    "ovr": 89,
    "rarity": "GOLD RARE",
    "image_url": "images/1 shukaku.png"
  }
  2. Async Data Loading (script.js)
Use fetch('cards.json') on page load to initialize the master card array.

Handle relative image pathing cleanly (images/filename.png).

3. Updated Showcase Rendering
Dynamically render cards into the #showcase grid from the loaded dataset.

Implement pagination or initial limit (e.g., show 20 cards first, with a "Load More" button or category filtering) to ensure smooth page performance with 191 cards.

4. Updated Gacha Logic Integration
When a user opens a pack, pick a card from cards.json based on the targeted rarity tier:

Bronze Pack: Filter cards with rarity === 'BRONZE', then apply the star rate probability.

Silver Pack: Filter cards with rarity === 'SILVER RARE', then apply the star rate probability.

Gold Pack: Filter cards with rarity === 'GOLD RARE', then apply the star rate probability.

Agent Action Required
Update script.js to asynchronously load cards.json using fetch().

Update the Showcase grid generator to pull directly from the JSON dataset.

Update the Gacha opening logic to pull random character cards matching the tier from cards.json.