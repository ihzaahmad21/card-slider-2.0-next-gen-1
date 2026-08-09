/**
 * verify_step4.js — Step 4 Database Integration Verification Script
 * 
 * Verifies:
 *  1. Dataset integrity (count, rarity distribution, required fields)
 *  2. All image paths exist on disk
 *  3. Star distribution per tier (replicates processRawCards() logic from script.js)
 *  4. Gacha pool sizes per pack tier
 * 
 * Run: node verify_step4.js
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));

// ── Load dataset (root cards.json is the source of truth) ──
const datasetPath = path.join(scriptDir, 'cards.json');

function loadDataset(filePath) {
  let contents;
  try {
    contents = fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    console.error(`FATAL: cannot read dataset at ${filePath}: ${err.message}`);
    process.exit(1);
  }

  try {
    const parsed = JSON.parse(contents);
    if (!Array.isArray(parsed)) {
      throw new Error(`expected an array, got ${typeof parsed}`);
    }
    return parsed;
  } catch (err) {
    console.error(`FATAL: invalid dataset at ${filePath}: ${err.message}`);
    process.exit(1);
  }
}

const rawCards = loadDataset(datasetPath);

// ── 1. Dataset integrity ──
console.log('═══════════════════════════════════════════════════════════');
console.log('  STEP 4 VERIFICATION — SHINOBI TCG DATABASE INTEGRATION');
console.log('═══════════════════════════════════════════════════════════\n');

let passCount = 0;
let failCount = 0;

function check(label, condition, detail = '') {
  if (condition) {
    passCount++;
    console.log(`  ✅ ${label}${detail ? ' — ' + detail : ''}`);
  } else {
    failCount++;
    console.log(`  ❌ ${label}${detail ? ' — ' + detail : ''}`);
  }
}

// Total count
check('Dataset count is 190', rawCards.length === 190, `${rawCards.length} cards loaded`);

// Required fields present
const missingFields = rawCards.filter(c => !c.id || !c.name || !c.ovr || !c.rarity || !c.image_url);
check('All cards have required fields (id, name, ovr, rarity, image_url)', missingFields.length === 0,
  missingFields.length > 0 ? `Missing on: ${missingFields.map(c => c.name).join(', ')}` : '');

// Rarity distribution
const rarityCounts = {};
rawCards.forEach(c => { rarityCounts[c.rarity] = (rarityCounts[c.rarity] || 0) + 1; });
check('GOLD RARE count = 39', rarityCounts['GOLD RARE'] === 39, `${rarityCounts['GOLD RARE'] || 0} cards`);
check('SILVER RARE count = 48', rarityCounts['SILVER RARE'] === 48, `${rarityCounts['SILVER RARE'] || 0} cards`);
check('BRONZE count = 103', rarityCounts['BRONZE'] === 103, `${rarityCounts['BRONZE'] || 0} cards`);

// ── 2. Image path existence ──
const missingImages = rawCards.filter(c => {
  const imgFile = c.image_url.replace(/^\/?public\//, '').replace(/^\/?images\//, '');
  const fullPath = path.join(scriptDir, 'public', 'images', imgFile);
  return !fs.existsSync(fullPath);
});
check('All 190 image files exist on disk', missingImages.length === 0,
  missingImages.length > 0 ? `Missing: ${missingImages.slice(0, 5).map(c => c.image_url).join(', ')}` : '');

// ── 3. Star distribution per tier (replicates processRawCards logic) ──
function computeStars(card) {
  if (card.rarity === 'GOLD RARE') {
    if (card.ovr >= 95) return 5;
    if (card.ovr >= 88) return 4;
    return 3;
  } else if (card.rarity === 'SILVER RARE') {
    if (card.ovr >= 88) return 4;
    if (card.ovr >= 80) return 3;
    return 2;
  } else {
    if (card.ovr <= 68) return 1;
    if (card.ovr <= 74) return 2;
    return 3;
  }
}

const starDist = { 'GOLD RARE': {}, 'SILVER RARE': {}, 'BRONZE': {} };
rawCards.forEach(c => {
  const stars = computeStars(c);
  starDist[c.rarity][stars] = (starDist[c.rarity][stars] || 0) + 1;
});

console.log('\n  ── Star Distribution per Tier ──');
Object.keys(starDist).forEach(tier => {
  const dist = starDist[tier];
  const summary = Object.keys(dist).sort().map(s => `${s}★×${dist[s]}`).join(', ');
  console.log(`    ${tier}: ${summary}`);
});

// Expected: GOLD 23×4★/16×5★, SILVER 38×3★/10×4★, BRONZE 10×1★/8×2★/85×3★
check('GOLD star distribution (23×4★, 16×5★)', starDist['GOLD RARE'][4] === 23 && starDist['GOLD RARE'][5] === 16,
  `4★=${starDist['GOLD RARE'][4] || 0}, 5★=${starDist['GOLD RARE'][5] || 0}`);
check('SILVER star distribution (38×3★, 10×4★)', starDist['SILVER RARE'][3] === 38 && starDist['SILVER RARE'][4] === 10,
  `3★=${starDist['SILVER RARE'][3] || 0}, 4★=${starDist['SILVER RARE'][4] || 0}`);
check('BRONZE star distribution (10×1★, 8×2★, 85×3★)', starDist['BRONZE'][1] === 10 && starDist['BRONZE'][2] === 8 && starDist['BRONZE'][3] === 85,
  `1★=${starDist['BRONZE'][1] || 0}, 2★=${starDist['BRONZE'][2] || 0}, 3★=${starDist['BRONZE'][3] || 0}`);

// ── 4. Gacha pool sizes ──
const bronzePool = rawCards.filter(c => c.rarity === 'BRONZE');
const silverPool = rawCards.filter(c => c.rarity === 'SILVER RARE');
const goldPool = rawCards.filter(c => c.rarity === 'GOLD RARE');

console.log('\n  ── Gacha Pool Sizes ──');
console.log(`    Bronze Pack pool: ${bronzePool.length} cards`);
console.log(`    Silver Pack pool: ${silverPool.length} cards`);
console.log(`    Gold Pack pool:   ${goldPool.length} cards`);

check('Bronze gacha pool = 103', bronzePool.length === 103, `${bronzePool.length} cards`);
check('Silver gacha pool = 48', silverPool.length === 48, `${silverPool.length} cards`);
check('Gold gacha pool = 39', goldPool.length === 39, `${goldPool.length} cards`);

// ── Summary ──
console.log('\n═══════════════════════════════════════════════════════════');
console.log(`  RESULT: ${passCount} passed, ${failCount} failed`);
console.log('═══════════════════════════════════════════════════════════\n');

process.exit(failCount > 0 ? 1 : 0);

