/**
 * SHINOBI TCG — MASTER JAVASCRIPT MECHANICS (STEP 4: DATABASE INTEGRATION)
 * 
 * Systems:
 *  1. Async dataset loading from cards.json (with fallback to characterDatabase.js)
 *  2. Coin balance state management
 *  3. Dynamic Showcase grid rendering with filter pills + Load More pagination
 *  4. Gacha Pack roll mechanics using exact probability rates per tier
 *  5. Reveal modal overlay + toast notifications
 */

// ═══════════════════════════════════════════════════════════════════════════
// GLOBAL APPLICATION STATE
// ═══════════════════════════════════════════════════════════════════════════
const state = {
  coins: 1500,
  inventory: [],
  masterCards: [],         // Processed card objects ready for rendering
  currentFilter: 'all',   // Current showcase filter: 'all' | 'gold' | 'silver' | 'bronze'
  displayLimit: 20,        // Pagination: how many cards to show in showcase
  rateBoosters: 0,
  shopQuantities: { bronze: 1, silver: 1, gold: 1 },
};

const HERO_CAROUSEL_INTERVAL = 4000;
let heroCarouselTimer = null;
let heroCarouselIndex = 0;
let heroCarouselCandidates = [];

// How many cards get revealed each time "Load More" is clicked
const LOAD_MORE_INCREMENT = 20;

// ═══════════════════════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', async () => {
  loadGameStateFromStorage();
  updateCoinsDisplay();
  updateShopBoostersDisplay();
  await loadCardsDataset();
  renderShowcaseGrid();
  renderInventoryGrid();
  initHeroCarousel();
  setupShowcaseFilters();
  setupGachaButtons();
  setupLoadMoreButton();
  setupShopButtons();
  setupPackQuantityControls();
  updateShopPackDisplays();
  setupModalBackdropHandlers();
});

// ═══════════════════════════════════════════════════════════════════════════
// 1. ASYNC DATA LOADING — cards.json with JS fallback
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Attempts to load cards.json via fetch (supports both root and public/ paths).
 * Falls back to the global OFFICIAL_CHARACTER_DATA array loaded from characterDatabase.js
 * if fetch is blocked (e.g. file:// protocol).
 */
async function loadCardsDataset() {
  const fetchPaths = ['cards.json', 'public/cards.json'];

  for (const path of fetchPaths) {
    try {
      const res = await fetch(path);
      if (res.ok) {
        const rawCards = await res.json();
        state.masterCards = processRawCards(rawCards);
        console.log('[ShinobiTCG] Loaded ' + state.masterCards.length + ' cards from ' + path);
        updateHeroCardCount();
        renderInventoryGrid();
        return;
      }
    } catch (err) {
      console.warn('[ShinobiTCG] fetch(' + path + ') failed:', err.message);
    }
  }

  // Fallback: OFFICIAL_CHARACTER_DATA from characterDatabase.js
  if (typeof OFFICIAL_CHARACTER_DATA !== 'undefined' && OFFICIAL_CHARACTER_DATA.length > 0) {
    const mapped = OFFICIAL_CHARACTER_DATA.map((item, idx) => {
      let rarity = 'BRONZE';
      if (item.rarity === 'UR') rarity = 'GOLD RARE';
      else if (item.rarity === 'SSR') rarity = item.stats.ovr >= 90 ? 'GOLD RARE' : 'SILVER RARE';
      else if (item.rarity === 'SR') rarity = item.stats.ovr >= 82 ? 'SILVER RARE' : 'BRONZE';

      return {
        id: idx + 1,
        name: item.name,
        ovr: item.stats.ovr,
        rarity: rarity,
        image_url: 'images/' + item.file
      };
    });
    state.masterCards = processRawCards(mapped);
    console.log('[ShinobiTCG] Loaded ' + state.masterCards.length + ' cards from OFFICIAL_CHARACTER_DATA fallback');
    updateHeroCardCount();
    renderInventoryGrid();
    return;
  }

  console.error('[ShinobiTCG] No card data source available!');
}

/**
 * Normalizes raw card objects from cards.json into the app's internal format.
 * Assigns: rarityClass, stars, img path, jutsu, summon, computed ATK/DEF/CHK.
 */
function processRawCards(rawCards) {
  return rawCards.map(card => {
    // Clean image path — ensure it points to ./public/images/filename.png
    const imgFile = card.image_url
      .replace(/^\/?public\//, '')
      .replace(/^\/?images\//, '');
    const img = './public/images/' + imgFile;

    // Map rarity string → CSS class + star count
    // Stars are derived from OVR *within* the declared rarity tier so that
    // low-OVR GOLD RARE cards are not forcibly pinned to 5★ (keeps the gacha
    // star-rate drop tables meaningful).
    let rarityClass, stars;
    if (card.rarity === 'GOLD RARE') {
      rarityClass = 'gold';
      if (card.ovr >= 95) stars = 5;
      else if (card.ovr >= 88) stars = 4;
      else stars = 3;
    } else if (card.rarity === 'SILVER RARE') {
      rarityClass = 'silver';
      if (card.ovr >= 88) stars = 4;
      else if (card.ovr >= 80) stars = 3;
      else stars = 2;
    } else {
      // BRONZE tier — assign 1–3 stars based on OVR
      rarityClass = 'bronze';
      if (card.ovr <= 68) stars = 1;
      else if (card.ovr <= 74) stars = 2;
      else stars = 3;
    }

    // Derive pseudo-stats from OVR (deterministic per card ID)
    const atk = clamp(card.ovr + ((card.id * 7) % 5) - 2, 50, 99);
    const def = clamp(card.ovr - 3 + ((card.id * 3) % 4), 50, 99);
    const chk = clamp(card.ovr + 2 - ((card.id * 11) % 5), 50, 99);

    const explicitJutsu = typeof card.jutsu === 'string' ? card.jutsu.trim() : '';
    const explicitSummon = typeof card.summon === 'string' ? card.summon.trim() : '';

    return {
      id: card.id,
      name: card.name,
      ovr: card.ovr,
      rarity: card.rarity,     // Original string: 'GOLD RARE' | 'SILVER RARE' | 'BRONZE'
      rarityClass: rarityClass, // CSS class key: 'gold' | 'silver' | 'bronze'
      stars: stars,
      img: img,
      jutsu: explicitJutsu || getJutsuForCharacter(card.name),
      summon: explicitSummon || getSummonForCharacter(card.name),
      atk: atk,
      def: def,
      chk: chk
    };
  });
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

// ── Character Jutsu & Summon lookup tables ──
function getJutsuForCharacter(name) {
  const n = name.toLowerCase();
  if (n.includes('naruto') && n.includes('baryon')) return 'Rasengan / Baryon Tail';
  if (n.includes('naruto') && n.includes('sage')) return 'Sage Art: Rasenshuriken';
  if (n.includes('naruto') && n.includes('six paths')) return 'Truth-Seeking Orbs';
  if (n.includes('naruto') && n.includes('bijuu')) return 'Tailed Beast Bomb';
  if (n.includes('naruto') && n.includes('kcm')) return 'Planetary Rasengan';
  if (n.includes('naruto') && n.includes('hokage')) return 'Massive Rasengan Barrage';
  if (n.includes('naruto')) return 'Shadow Clone / Rasengan';
  if (n.includes('sasuke') && n.includes('rinne')) return "Indra's Arrow / Chidori";
  if (n.includes('sasuke') && n.includes('war')) return 'Enton: Kagutsuchi';
  if (n.includes('sasuke') && n.includes('taka')) return 'Kirin / Chidori Stream';
  if (n.includes('sasuke')) return 'Fire Release / Sharingan Genjutsu / Amaterasu';
  if (n.includes('kakashi') && n.includes('dms')) return 'Complete Susanoo Kamui';
  if (n.includes('kakashi')) return 'Raikiri / Kamui';
  if (n.includes('itachi')) return 'Tsukuyomi / Amaterasu';
  if (n.includes('madara') && n.includes('six')) return 'Limbo / Infinite Tsukuyomi';
  if (n.includes('madara')) return 'Tengai Shinsei / Susanoo';
  if (n.includes('gaara')) return 'Sand Tsunami / Shield';
  if (n.includes('guy') && n.includes('8 gates')) return 'Night Guy / Evening Elephant';
  if (n.includes('guy')) return 'Morning Peacock / Dynamic Entry';
  if (n.includes('hashirama')) return 'Wood Style: Sage Art';
  if (n.includes('tobirama')) return 'Flying Thunder God / Edo Tensei';
  if (n.includes('hiruzen')) return 'Reaper Death Seal';
  if (n.includes('minato')) return 'Flying Raijin / Rasengan';
  if (n.includes('jiraiya')) return 'Ultra Big Ball Rasengan';
  if (n.includes('tsunade')) return 'Mitotic Regeneration';
  if (n.includes('orochimaru')) return 'Eight Branches / Edo Tensei';
  if (n.includes('sakura')) return 'Cherry Blossom Impact';
  if (n.includes('hinata')) return 'Twin Lion Fists';
  if (n.includes('neji')) return '8 Trigrams 64 Palms';
  if (n.includes('rock lee') || n.includes('lee')) return 'Hidden Lotus / Drunken Fist';
  if (n.includes('shikamaru')) return 'Shadow Possession';
  if (n.includes('choji') && n.includes('butterfly')) return 'Butterfly Bomber';
  if (n.includes('choji')) return 'Human Boulder';
  if (n.includes('ino')) return 'Mind Transfer Jutsu';
  if (n.includes('kiba')) return 'Fang Over Fang';
  if (n.includes('shino')) return 'Parasitic Insects';
  if (n.includes('tenten')) return 'Twin Rising Dragons';
  if (n.includes('deidara')) return 'C4 Karura / Art Explosion';
  if (n.includes('sasori')) return 'Red Secret: 100 Puppets';
  if (n.includes('hidan')) return 'Jashin Ritual';
  if (n.includes('kakuzu')) return 'Earth Grudge Fear';
  if (n.includes('kisame')) return 'Great Shark Bomb';
  if (n.includes('konan')) return 'Paper Ocean / God Angel';
  if (n.includes('pain') || n.includes('nagato')) return 'Almighty Push / Chibaku Tensei';
  if (n.includes('obito') && n.includes('ten tails')) return 'Truth-Seeking Balls';
  if (n.includes('obito')) return 'Kamui Shuriken';
  if (n.includes('kaguya')) return 'Expansive Truth-Seeking Ball';
  if (n.includes('killer bee') || n.includes('bee')) return 'Lariat / Bijuu Bomb';
  if (n.includes('kurama') || n.includes('bijuu') || n.includes('jinchuriki')) return 'Tailed Beast Bomb / Secret Shinobi Art';
  if (n.includes('shukaku')) return 'Wind Style: Sand Buckshot';
  if (n.includes('danzo')) return 'Izanagi / Wind Vacuum';
  if (n.includes('kabuto') && n.includes('sage')) return 'Sage Art: Inorganic Animation';
  if (n.includes('kabuto')) return 'Chakra Scalpel';
  if (n.includes('asuma')) return 'Burning Ash / Wind Blade';
  if (n.includes('kurenai')) return 'Demonic Illusion: Tree Bind';
  if (n.includes('yamato')) return 'Wood Style: Deep Forest';
  if (n.includes('sai')) return 'Super Beast Scroll';
  if (n.includes('temari')) return 'Wind Scythe Jutsu';
  if (n.includes('kankuro')) return 'Black Secret: Crow';
  if (n.includes('darui')) return 'Storm Release: Laser Circus';
  if (n.includes('hanzo')) return 'Poison Mist / Sickle Weasel';
  if (n.includes('mifune')) return 'Iaidō: Flash';
  if (n.includes('kushina')) return 'Adamantine Chains';
  if (n.includes('jubi') || n.includes('ten-tails')) return 'Tailed Beast Ball';
  if (n.includes('delta')) return 'Destruction Beam';
  if (n.includes('jigen') || n.includes('isshiki')) return 'Sukunahikona / Daikokuten';
  if (n.includes('boruto') && n.includes('karma')) return 'Karma Rasengan';
  if (n.includes('boruto')) return 'Vanishing Rasengan';
  if (n.includes('kawaki') && n.includes('karma')) return 'Karma Absorption';
  if (n.includes('kawaki')) return 'Fire Style: Flame Bullets';
  if (n.includes('sarada')) return 'Chidori / Sharingan';
  if (n.includes('mitsuki')) return 'Sage Transformation';
  if (n.includes('koji')) return 'Samadhi Truth Flames';
  if (n.includes('momoshiki')) return 'Absorb & Release';
  if (n.includes('kinshiki')) return 'Otsutsuki Weapon Morph';
  if (n.includes('toneri')) return 'Tenseigan Chakra Mode';
  if (n.includes('ashura')) return 'Six Paths: Rasengan';
  if (n.includes('indra')) return 'Six Paths: Susanoo';
  if (n.includes('ohnoki')) return 'Particle Style: Detachment';
  if (n.includes('mei') || n.includes('mizukage')) return 'Lava Style: Dissolving';
  if (n.includes('raikage') || n.includes('ay')) return 'Lightning Armour Lariat';
  if (n.includes('uchiha')) return 'Fire Release / Sharingan Genjutsu / Amaterasu';
  if (n.includes('uzumaki')) return 'Rasengan / Sage Art / Shadow Clone';
  if (n.includes('jinchuriki') || n.includes('bijuu')) return 'Tailed Beast Bomb / Secret Shinobi Art';
  return 'Secret Ninja Art';
}

function getSummonForCharacter(name) {
  const n = name.toLowerCase();
  if (n.includes('naruto')) return 'Nine-Tails Kurama';
  if (n.includes('sasuke')) return 'Susanoo Armor';
  if (n.includes('kakashi')) return 'Ninken Hounds';
  if (n.includes('itachi')) return 'Crow Clone';
  if (n.includes('gaara')) return 'Shukaku Sand';
  if (n.includes('jiraiya') || n.includes('minato')) return 'Toad Gamabunta';
  if (n.includes('tsunade') || n.includes('sakura')) return 'Katsuyu Slug';
  if (n.includes('orochimaru') || n.includes('anko') || n.includes('kabuto')) return 'Giant Snake Manda';
  if (n.includes('killer bee') || n.includes('bee')) return 'Eight-Tails Gyuki';
  if (n.includes('hashirama')) return 'Wood Golem';
  if (n.includes('madara')) return 'Nine Bijuu';
  if (n.includes('obito')) return 'Gedo Statue';
  if (n.includes('temari')) return 'Kamatari Weasel';
  if (n.includes('kankuro')) return 'Crow / Black Ant';
  if (n.includes('bijuu') || n.includes('jinchuriki')) return 'Corresponding Bijuu';
  if (n.includes('uchiha')) return 'Susanoo Armor';
  if (n.includes('uzumaki')) return 'Toad Gamabunta';
  return 'None';
}

// ═══════════════════════════════════════════════════════════════════════════
// 2. COIN BALANCE MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════
function updateCoinsDisplay() {
  const el = document.getElementById('user-coins-count');
  if (el) {
    el.textContent = state.coins.toLocaleString() + ' COINS';
  }
}

/**
 * Syncs the hero "Ninja Cards" stat with the real loaded dataset length.
 */
function updateHeroCardCount() {
  const el = document.getElementById('hero-card-count');
  if (el) {
    el.textContent = state.masterCards.length;
  }
}

function initHeroCarousel() {
  heroCarouselCandidates = state.masterCards
    .filter(card => card.rarity === 'GOLD RARE' || card.ovr >= 90)
    .sort((a, b) => b.ovr - a.ovr || b.stars - a.stars);

  if (heroCarouselCandidates.length === 0) {
    heroCarouselCandidates = [...state.masterCards]
      .sort((a, b) => b.ovr - a.ovr || b.stars - a.stars)
      .slice(0, 6);
  }

  heroCarouselIndex = 0;
  renderHeroCard(heroCarouselCandidates[heroCarouselIndex]);
  startHeroCarousel();

  const stage = document.getElementById('hero-card-stage');
  if (!stage) return;

  stage.addEventListener('mouseenter', pauseHeroCarousel);
  stage.addEventListener('mouseleave', resumeHeroCarousel);
}

function renderHeroCard(card) {
  if (!card) return;

  const container = document.getElementById('hero-card-container');
  const nameEl = document.getElementById('hero-card-name');
  const ovrEl = document.getElementById('hero-card-ovr');
  const imageEl = document.getElementById('hero-card-image');
  const jutsuEl = document.getElementById('hero-card-jutsu');
  const summonEl = document.getElementById('hero-card-summon');
  const atkEl = document.getElementById('hero-card-atk');
  const defEl = document.getElementById('hero-card-def');
  const chkEl = document.getElementById('hero-card-chk');
  const starsEl = document.getElementById('hero-card-stars');
  const rarityEl = document.getElementById('hero-card-rarity');

  if (container) {
    container.classList.add('hero-carousel-fade');
    window.setTimeout(() => container.classList.remove('hero-carousel-fade'), 450);
  }
  if (nameEl) nameEl.textContent = card.name;
  if (ovrEl) ovrEl.textContent = card.ovr + ' OVR';
  if (imageEl) {
    imageEl.src = card.img;
    imageEl.alt = card.name;
    imageEl.onerror = function () {
      this.onerror = null;
      this.src = './public/images/naruto__part_1__by_masonengine_daim8u2.png';
    };
  }
  if (jutsuEl) jutsuEl.textContent = card.jutsu || 'Secret Ninja Art';
  if (summonEl) summonEl.textContent = 'Summon: ' + (card.summon || 'Unknown Spirit');
  if (atkEl) atkEl.style.width = card.atk + '%';
  if (defEl) defEl.style.width = card.def + '%';
  if (chkEl) chkEl.style.width = card.chk + '%';
  if (starsEl) starsEl.textContent = '★ '.repeat(card.stars) + '☆ '.repeat(5 - card.stars);
  if (rarityEl) rarityEl.textContent = card.rarity;
}

function startHeroCarousel() {
  stopHeroCarousel();
  heroCarouselTimer = window.setInterval(() => {
    if (heroCarouselCandidates.length === 0) return;
    heroCarouselIndex = (heroCarouselIndex + 1) % heroCarouselCandidates.length;
    renderHeroCard(heroCarouselCandidates[heroCarouselIndex]);
  }, HERO_CAROUSEL_INTERVAL);
}

function stopHeroCarousel() {
  if (heroCarouselTimer) {
    window.clearInterval(heroCarouselTimer);
    heroCarouselTimer = null;
  }
}

function pauseHeroCarousel() {
  stopHeroCarousel();
}

function resumeHeroCarousel() {
  startHeroCarousel();
}

function loadGameStateFromStorage() {
  try {
    const storedCoins = localStorage.getItem('shinobiTCG.userCoins');
    if (storedCoins !== null) {
      const parsedCoins = Number(storedCoins);
      if (!Number.isNaN(parsedCoins)) {
        state.coins = parsedCoins;
      }
    }
  } catch (err) {
    console.warn('[ShinobiTCG] Could not load coins from localStorage:', err.message);
  }

  try {
    const storedBoosters = localStorage.getItem('shinobiTCG.rateBoosters');
    if (storedBoosters !== null) {
      const parsedBoosters = Number(storedBoosters);
      if (!Number.isNaN(parsedBoosters)) {
        state.rateBoosters = parsedBoosters;
      }
    }
  } catch (err) {
    console.warn('[ShinobiTCG] Could not load boosters from localStorage:', err.message);
  }

  try {
    const stored = localStorage.getItem('shinobiTCG.userInventory');
    if (!stored) {
      state.inventory = [];
      return;
    }

    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed)) {
      state.inventory = parsed
        .filter(item => item && item.id)
        .map(item => ({
          ...item,
          quantity: typeof item.quantity === 'number' ? item.quantity : 1,
          upgradeLevel: typeof item.upgradeLevel === 'number' ? item.upgradeLevel : 1,
          stars: typeof item.stars === 'number' ? item.stars : 1,
          ovr: typeof item.ovr === 'number' ? item.ovr : 70,
          atk: typeof item.atk === 'number' ? item.atk : 50,
          def: typeof item.def === 'number' ? item.def : 50,
          chk: typeof item.chk === 'number' ? item.chk : 50,
        }));
    } else {
      state.inventory = [];
    }
  } catch (err) {
    console.warn('[ShinobiTCG] Could not load inventory from localStorage:', err.message);
    state.inventory = [];
  }
}

function saveGameStateToStorage() {
  try {
    localStorage.setItem('shinobiTCG.userCoins', String(state.coins));
    localStorage.setItem('shinobiTCG.rateBoosters', String(state.rateBoosters));
    localStorage.setItem('shinobiTCG.userInventory', JSON.stringify(state.inventory));
  } catch (err) {
    console.warn('[ShinobiTCG] Could not save game state to localStorage:', err.message);
  }
}

function updateInventoryProgress() {
  const el = document.getElementById('inventory-progress');
  if (!el) return;

  const totalCards = state.masterCards.length || 0;
  const ownedCount = state.inventory.length;
  el.textContent = 'Collection: ' + ownedCount + ' / ' + totalCards + ' Shinobi Unlocked';
}

function renderInventoryGrid() {
  const grid = document.getElementById('inventory-grid');
  if (!grid) return;

  updateInventoryProgress();

  if (state.inventory.length === 0) {
    grid.innerHTML = '<div class="inventory-empty-state">Your inventory is empty! Roll some Gacha Packs to collect Shinobi cards.</div>';
    return;
  }

  grid.innerHTML = '';
  state.inventory.forEach(item => {
    grid.appendChild(createInventoryCardElement(item));
  });
}

function createInventoryCardElement(entry) {
  const wrapper = document.createElement('div');
  wrapper.className = 'inventory-card-wrapper';
  wrapper.dataset.cardId = String(entry.id);

  const starsFull = entry.stars || 1;
  const starsEmpty = 5 - starsFull;
  const starStr = '★ '.repeat(starsFull) + '☆ '.repeat(starsEmpty);

  wrapper.innerHTML =
    '<div class="card-container ' + entry.rarityClass + '-tier inventory-card">' +
      '<div class="card-inner">' +
        '<div class="card-header">' +
          '<span class="card-title">' + escapeHtml(entry.name) + '</span>' +
          '<div class="ovr-badge">' + entry.ovr + ' OVR</div>' +
        '</div>' +
        '<div class="card-image-window">' +
          '<img src="' + entry.img + '" alt="' + escapeHtml(entry.name) + '" onerror="this.onerror=null;this.src=\'./public/images/naruto__part_1__by_masonengine_daim8u2.png\'">' +
        '</div>' +
        '<div class="card-details-panel">' +
          '<div class="jutsu-name">' + escapeHtml(entry.jutsu) + '</div>' +
          '<div class="summon-type">Summon: ' + escapeHtml(entry.summon) + '</div>' +
          '<div class="stat-bars">' +
            '<div class="stat-row"><span class="stat-label">ATK</span><div class="stat-track"><div class="stat-fill" style="width:' + entry.atk + '%"></div></div></div>' +
            '<div class="stat-row"><span class="stat-label">DEF</span><div class="stat-track"><div class="stat-fill" style="width:' + entry.def + '%"></div></div></div>' +
            '<div class="stat-row"><span class="stat-label">CHK</span><div class="stat-track"><div class="stat-fill" style="width:' + entry.chk + '%"></div></div></div>' +
          '</div>' +
        '</div>' +
        '<div class="card-footer">' +
          '<div class="stars-rating">' + starStr + '</div>' +
          '<span class="rarity-tag">' + entry.rarity + '</span>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<div class="inventory-card-meta">' +
      '<h4>' + escapeHtml(entry.name) + '</h4>' +
      '<p>' + entry.ovr + ' OVR · ' + entry.stars + '-Star ' + entry.rarity + '</p>' +
    '</div>' +
    (entry.quantity > 1 ? '<span class="inventory-quantity-badge">x' + entry.quantity + '</span>' : '');

  wrapper.addEventListener('click', () => openInventoryCardModal(entry.id));
  return wrapper;
}

function addCardToInventory(card) {
  const existing = state.inventory.find(item => item.id === card.id);

  if (existing) {
    existing.quantity = (existing.quantity || 1) + 1;
  } else {
    state.inventory.push({
      ...card,
      quantity: 1
    });
  }

  saveGameStateToStorage();
  renderInventoryGrid();
}

function openInventoryCardModal(cardId) {
  const entry = state.inventory.find(item => item.id === cardId);
  if (!entry) return;

  const overlay = document.getElementById('inventory-modal-overlay');
  const container = document.getElementById('inventory-modal-container');
  if (!overlay || !container) return;

  const starsFull = entry.stars || 1;
  const starsEmpty = 5 - starsFull;
  const starStr = '★ '.repeat(starsFull) + '☆ '.repeat(starsEmpty);
  const upgradeCost = getUpgradeCost(entry);
  const sellValue = getSellValue(entry);
  const canUpgrade = entry.stars < 5;

  container.innerHTML =
    '<div class="inventory-modal-stage">' +
      '<div class="inventory-modal-head">' +
        '<h3>' + escapeHtml(entry.name) + '</h3>' +
        '<span class="reveal-tier-tag ' + entry.rarityClass + '-tag">' + entry.stars + '★ ' + entry.rarity + '</span>' +
      '</div>' +
      '<div class="card-container ' + entry.rarityClass + '-tier">' +
        '<div class="card-inner">' +
          '<div class="card-header">' +
            '<span class="card-title">' + escapeHtml(entry.name) + '</span>' +
            '<div class="ovr-badge">' + entry.ovr + ' OVR</div>' +
          '</div>' +
          '<div class="card-image-window">' +
            '<img src="' + entry.img + '" alt="' + escapeHtml(entry.name) + '" onerror="this.onerror=null;this.src=\'./public/images/naruto__part_1__by_masonengine_daim8u2.png\'">' +
          '</div>' +
          '<div class="card-details-panel">' +
            '<div class="jutsu-name">' + escapeHtml(entry.jutsu) + '</div>' +
            '<div class="summon-type">Summon: ' + escapeHtml(entry.summon) + '</div>' +
            '<div class="stat-bars">' +
              '<div class="stat-row"><span class="stat-label">ATK</span><div class="stat-track"><div class="stat-fill" style="width:' + entry.atk + '%"></div></div></div>' +
              '<div class="stat-row"><span class="stat-label">DEF</span><div class="stat-track"><div class="stat-fill" style="width:' + entry.def + '%"></div></div></div>' +
              '<div class="stat-row"><span class="stat-label">CHK</span><div class="stat-track"><div class="stat-fill" style="width:' + entry.chk + '%"></div></div></div>' +
            '</div>' +
          '</div>' +
          '<div class="card-footer">' +
            '<div class="stars-rating">' + starStr + '</div>' +
            '<span class="rarity-tag">' + entry.rarity + '</span>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="inventory-modal-details">' +
        '<p>Owned Copies: x' + entry.quantity + '</p>' +
        '<p>Upgrade Cost: ' + upgradeCost + ' Coins</p>' +
        '<p>Sell Value: +' + sellValue + ' Coins</p>' +
      '</div>' +
      '<div class="inventory-modal-actions">' +
        '<button class="btn-primary btn-upgrade" id="btn-upgrade-card">Upgrade Card</button>' +
        '<button class="btn-secondary btn-sell" id="btn-sell-card">Sell Card</button>' +
        '<button class="btn-secondary btn-close" id="btn-close-card-modal">Close</button>' +
      '</div>' +
    '</div>';

  overlay.classList.add('active');

  document.getElementById('btn-upgrade-card').addEventListener('click', () => upgradeCard(cardId));
  document.getElementById('btn-sell-card').addEventListener('click', () => sellCard(cardId));
  document.getElementById('btn-close-card-modal').addEventListener('click', () => closeInventoryModal());

  if (!canUpgrade) {
    const upgradeBtn = document.getElementById('btn-upgrade-card');
    if (upgradeBtn) {
      upgradeBtn.disabled = true;
      upgradeBtn.textContent = 'Maxed Out';
    }
  }
}

function closeInventoryModal() {
  const overlay = document.getElementById('inventory-modal-overlay');
  if (overlay) {
    overlay.classList.remove('active');
  }
}

function closeGachaModal() {
  const overlay = document.getElementById('gacha-modal-overlay');
  const container = document.getElementById('gacha-modal-container');
  if (overlay) {
    overlay.classList.remove('active');
  }
  if (container) {
    container.innerHTML = '';
  }
}

function setupModalBackdropHandlers() {
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) {
        if (overlay.id === 'inventory-modal-overlay') {
          closeInventoryModal();
        } else {
          closeGachaModal();
        }
      }
    });
  });
}

function getUpgradeCost(card) {
  return 200 * (card.upgradeLevel || 1);
}

function getSellValue(card) {
  if (card.rarityClass === 'gold') return 400;
  if (card.rarityClass === 'silver') return 150;
  return 30;
}

function upgradeCard(cardId) {
  const card = state.inventory.find(item => item.id === cardId);
  if (!card) return;

  if (card.stars >= 5) {
    showToastNotification(card.name + ' is already at max 5★.');
    return;
  }

  const cost = getUpgradeCost(card);
  if (state.coins < cost) {
    showToastNotification('Not enough coins for that upgrade.');
    return;
  }

  state.coins -= cost;
  card.upgradeLevel = (card.upgradeLevel || 1) + 1;
  card.stars = Math.min(5, card.stars + 1);
  card.ovr += 3;
  card.atk = Math.min(99, (card.atk || 50) + 6);
  card.def = Math.min(99, (card.def || 50) + 6);
  card.chk = Math.min(99, (card.chk || 50) + 6);

  updateCoinsDisplay();
  saveGameStateToStorage();
  renderInventoryGrid();
  openInventoryCardModal(cardId);
  showToastNotification(card.name + ' upgraded to ' + card.stars + '★ for ' + cost + ' Coins.');
}

function sellCard(cardId) {
  const cardIndex = state.inventory.findIndex(item => item.id === cardId);
  if (cardIndex === -1) return;

  const card = state.inventory[cardIndex];
  const sellValue = getSellValue(card);

  if ((card.quantity || 1) <= 1) {
    state.inventory.splice(cardIndex, 1);
    showToastNotification('Sold ' + card.name + ' for +' + sellValue + ' Coins.');
  } else {
    card.quantity = (card.quantity || 1) - 1;
    showToastNotification('Sold ' + card.name + ' for +' + sellValue + ' Coins.');
  }

  state.coins += sellValue;
  updateCoinsDisplay();
  saveGameStateToStorage();
  renderInventoryGrid();
  closeInventoryModal();
}

function updateShopBoostersDisplay() {
  const el = document.getElementById('shop-booster-count');
  if (el) {
    el.textContent = state.rateBoosters;
  }
}

function updateShopPackDisplays() {
  Object.keys(state.shopQuantities).forEach(pack => {
    const qtyEl = document.getElementById('shop-qty-' + pack);
    if (qtyEl) {
      qtyEl.textContent = 'x' + state.shopQuantities[pack];
    }

    const totalEl = document.getElementById('shop-total-' + pack);
    if (totalEl) {
      const config = PACK_CONFIG[pack];
      totalEl.textContent = 'Total: ' + (config.cost * state.shopQuantities[pack]).toLocaleString() + ' Coins';
    }
  });
}

function setupPackQuantityControls() {
  document.querySelectorAll('[data-pack][data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const pack = btn.getAttribute('data-pack');
      const action = btn.getAttribute('data-action');
      if (!pack || !PACK_CONFIG[pack]) return;

      const current = state.shopQuantities[pack] || 1;
      if (action === 'decrease') {
        state.shopQuantities[pack] = Math.max(1, current - 1);
      } else if (action === 'increase') {
        state.shopQuantities[pack] = Math.min(10, current + 1);
      }
      updateShopPackDisplays();
    });
  });
}

function setupShopButtons() {
  document.querySelectorAll('[data-shop-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.getAttribute('data-shop-action');
      if (action === 'bundle') {
        const amount = Number(btn.getAttribute('data-amount') || 0);
        state.coins += amount;
        updateCoinsDisplay();
        saveGameStateToStorage();
        showToastNotification('Purchased ' + amount.toLocaleString() + ' Coins.');
      } else if (action === 'booster') {
        state.rateBoosters += 1;
        updateShopBoostersDisplay();
        saveGameStateToStorage();
        showToastNotification('Rate Booster unlocked.');
      } else if (action === 'inventory') {
        document.getElementById('inventory')?.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  document.querySelectorAll('[data-pack-open]').forEach(btn => {
    btn.addEventListener('click', () => {
      const pack = btn.getAttribute('data-pack-open');
      if (!pack || !PACK_CONFIG[pack]) return;
      openShopPack(pack);
    });
  });
}

function openShopPack(packType) {
  const config = PACK_CONFIG[packType];
  if (!config) return;

  const quantity = state.shopQuantities[packType] || 1;
  const totalCost = config.cost * quantity;
  if (state.coins < totalCost) {
    showToastNotification('Not enough coins for ' + quantity + ' pulls.');
    return;
  }

  state.coins -= totalCost;
  updateCoinsDisplay();
  saveGameStateToStorage();

  const results = [];
  for (let i = 0; i < quantity; i += 1) {
    results.push(rollSinglePackCard(packType));
  }

  showGachaResultModal(results);
}

function rollSinglePackCard(packType) {
  const config = PACK_CONFIG[packType];
  if (!config) return null;

  const roll = Math.random() * 100;
  let rolledStar = config.starRates[config.starRates.length - 1].star;
  for (const rate of config.starRates) {
    if (roll < rate.threshold) {
      rolledStar = rate.star;
      break;
    }
  }

  let pool = state.masterCards.filter(c => c.rarity === config.rarityFilter);
  const starPool = pool.filter(c => c.stars === rolledStar);
  if (starPool.length > 0) pool = starPool;

  if (pool.length === 0) {
    pool = state.masterCards.filter(c => c.rarityClass === packType);
  }
  if (pool.length === 0) {
    pool = state.masterCards;
  }

  return pool[Math.floor(Math.random() * pool.length)];
}

// ═══════════════════════════════════════════════════════════════════════════
// 3. DYNAMIC SHOWCASE GRID — Rendering, Filtering & Load More
// ═══════════════════════════════════════════════════════════════════════════
function renderShowcaseGrid() {
  const grid = document.getElementById('showcase-grid');
  if (!grid) return;

  grid.innerHTML = '';

  // Apply current filter
  let filtered = state.masterCards;
  if (state.currentFilter !== 'all') {
    filtered = state.masterCards.filter(c => c.rarityClass === state.currentFilter);
  }

  // Paginated slice
  const batch = filtered.slice(0, state.displayLimit);

  batch.forEach(card => {
    grid.appendChild(createCardElement(card));
  });

  // Update Load More button state
  updateLoadMoreButton(filtered.length);
}

function createCardElement(card) {
  const wrapper = document.createElement('div');
  wrapper.className = 'showcase-card-wrapper';
  wrapper.setAttribute('data-rarity', card.rarityClass);

  const starsFull = card.stars;
  const starsEmpty = 5 - starsFull;
  const starStr = '★ '.repeat(starsFull) + '☆ '.repeat(starsEmpty);

  wrapper.innerHTML =
    '<div class="card-container ' + card.rarityClass + '-tier">' +
      '<div class="card-inner">' +
        '<div class="card-header">' +
          '<span class="card-title">' + escapeHtml(card.name) + '</span>' +
          '<div class="ovr-badge">' + card.ovr + ' OVR</div>' +
        '</div>' +
        '<div class="card-image-window">' +
          '<img src="' + card.img + '" alt="' + escapeHtml(card.name) + '" onerror="this.onerror=null;this.src=\'./public/images/naruto__part_1__by_masonengine_daim8u2.png\'">' +
        '</div>' +
        '<div class="card-details-panel">' +
          '<div class="jutsu-name">' + escapeHtml(card.jutsu) + '</div>' +
          '<div class="summon-type">Summon: ' + escapeHtml(card.summon) + '</div>' +
          '<div class="stat-bars">' +
            '<div class="stat-row"><span class="stat-label">ATK</span><div class="stat-track"><div class="stat-fill" style="width:' + card.atk + '%"></div></div></div>' +
            '<div class="stat-row"><span class="stat-label">DEF</span><div class="stat-track"><div class="stat-fill" style="width:' + card.def + '%"></div></div></div>' +
            '<div class="stat-row"><span class="stat-label">CHK</span><div class="stat-track"><div class="stat-fill" style="width:' + card.chk + '%"></div></div></div>' +
          '</div>' +
        '</div>' +
        '<div class="card-footer">' +
          '<div class="stars-rating">' + starStr + '</div>' +
          '<span class="rarity-tag">' + card.rarity + '</span>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<div class="card-meta-info">' +
      '<h4>' + escapeHtml(card.name) + '</h4>' +
      '<p>' + card.ovr + ' OVR · ' + card.stars + '-Star ' + card.rarity + '</p>' +
    '</div>';

  return wrapper;
}

function escapeHtml(str) {
  const el = document.createElement('span');
  el.textContent = str;
  return el.innerHTML;
}

function updateLoadMoreButton(totalFiltered) {
  const container = document.getElementById('load-more-container');
  if (!container) return;

  const remaining = totalFiltered - state.displayLimit;
  if (remaining <= 0) {
    container.style.display = 'none';
  } else {
    container.style.display = 'flex';
    const btn = document.getElementById('btn-load-more');
    if (btn) btn.textContent = 'Load More Cards (' + remaining + ' Remaining)';
  }
}

function setupShowcaseFilters() {
  const buttons = document.querySelectorAll('.filter-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.currentFilter = btn.getAttribute('data-filter');
      state.displayLimit = LOAD_MORE_INCREMENT; // reset pagination on filter change
      renderShowcaseGrid();
    });
  });
}

function setupLoadMoreButton() {
  const btn = document.getElementById('btn-load-more');
  if (btn) {
    btn.addEventListener('click', () => {
      state.displayLimit += LOAD_MORE_INCREMENT;
      renderShowcaseGrid();
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 4. GACHA PACK ROLL MECHANICS
// ═══════════════════════════════════════════════════════════════════════════

const PACK_CONFIG = {
  bronze: {
    cost: 100,
    // Filter cards.json by rarity === 'BRONZE'
    rarityFilter: 'BRONZE',
    // Drop rates: 1★ (50%), 2★ (40%), 3★ (10%)
    starRates: [ { star: 1, threshold: 50 }, { star: 2, threshold: 90 }, { star: 3, threshold: 100 } ]
  },
  silver: {
    cost: 500,
    // Filter cards.json by rarity === 'SILVER RARE'
    rarityFilter: 'SILVER RARE',
    // Drop rates: 3★ (85%), 4★ (15%)
    starRates: [ { star: 3, threshold: 85 }, { star: 4, threshold: 100 } ]
  },
  gold: {
    cost: 1000,
    // Filter cards.json by rarity === 'GOLD RARE'
    rarityFilter: 'GOLD RARE',
    // Drop rates: 4★ (80%), 5★ (20%)
    starRates: [ { star: 4, threshold: 80 }, { star: 5, threshold: 100 } ]
  }
};

function setupGachaButtons() {
  const ids = { bronze: 'btn-buy-bronze', silver: 'btn-buy-silver', gold: 'btn-buy-gold' };
  Object.keys(ids).forEach(pack => {
    const btn = document.getElementById(ids[pack]);
    if (btn) btn.addEventListener('click', () => drawCard(pack));
  });
}

/**
 * Core gacha draw function.
 * 1. Validate coins → deduct
 * 2. Filter masterCards by pack's rarity string (BRONZE / SILVER RARE / GOLD RARE)
 * 3. Roll star rating with exact probability thresholds
 * 4. Pick random card from pool → push to inventory → show reveal modal
 */
function drawCard(packType) {
  const config = PACK_CONFIG[packType];
  if (!config) return;

  if (state.coins < config.cost) {
    showToastNotification('Insufficient Coins! You need ' + config.cost.toLocaleString() + ' Coins to open this pack.');
    return;
  }

  state.coins -= config.cost;
  updateCoinsDisplay();
  saveGameStateToStorage();

  const drawnCard = rollSinglePackCard(packType);
  showGachaResultModal([drawnCard]);
}

// ═══════════════════════════════════════════════════════════════════════════
// 5. GACHA RESULT MODAL & TOAST NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════════════════
function showGachaResultModal(cards) {
  const overlay = document.getElementById('gacha-modal-overlay');
  const container = document.getElementById('gacha-modal-container');
  if (!overlay || !container) return;

  const results = Array.isArray(cards) ? cards.filter(Boolean) : [cards].filter(Boolean);
  if (results.length === 0) return;

  const cardsMarkup = results.map(card => {
    const starStr = '★ '.repeat(card.stars) + '☆ '.repeat(5 - card.stars);
    return '<div class="gacha-result-card">' +
      '<div class="card-container ' + card.rarityClass + '-tier modal-card-animate">' +
        '<div class="card-inner">' +
          '<div class="card-header">' +
            '<span class="card-title">' + escapeHtml(card.name) + '</span>' +
            '<div class="ovr-badge">' + card.ovr + ' OVR</div>' +
          '</div>' +
          '<div class="card-image-window">' +
            '<img src="' + card.img + '" alt="' + escapeHtml(card.name) + '" onerror="this.onerror=null;this.src=\'./public/images/naruto__part_1__by_masonengine_daim8u2.png\'">' +
          '</div>' +
          '<div class="card-details-panel">' +
            '<div class="jutsu-name">' + escapeHtml(card.jutsu) + '</div>' +
            '<div class="summon-type">Summon: ' + escapeHtml(card.summon) + '</div>' +
            '<div class="stat-bars">' +
              '<div class="stat-row"><span class="stat-label">ATK</span><div class="stat-track"><div class="stat-fill" style="width:' + card.atk + '%"></div></div></div>' +
              '<div class="stat-row"><span class="stat-label">DEF</span><div class="stat-track"><div class="stat-fill" style="width:' + card.def + '%"></div></div></div>' +
              '<div class="stat-row"><span class="stat-label">CHK</span><div class="stat-track"><div class="stat-fill" style="width:' + card.chk + '%"></div></div></div>' +
            '</div>' +
          '</div>' +
          '<div class="card-footer">' +
            '<div class="stars-rating">' + starStr + '</div>' +
            '<span class="rarity-tag">' + card.rarity + '</span>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
  }).join('');

  container.innerHTML =
    '<div class="gacha-reveal-stage">' +
      '<div class="gacha-reveal-title">' +
        '<h3>Pack Opened!</h3>' +
        '<span class="reveal-tier-tag ' + results[0].rarityClass + '-tag">' + results.length + ' Card' + (results.length > 1 ? 's' : '') + ' Revealed</span>' +
      '</div>' +
      '<div class="gacha-results-grid">' + cardsMarkup + '</div>' +
      '<div class="gacha-modal-actions">' +
        '<button class="btn-primary btn-keep" id="btn-keep-cards">KEEP CARD(S)</button>' +
        '<button class="btn-secondary btn-quick-sell" id="btn-quick-sell">QUICK SELL</button>' +
      '</div>' +
    '</div>';

  overlay.classList.add('active');

  document.getElementById('btn-keep-cards').addEventListener('click', () => keepPulledCards(results));
  document.getElementById('btn-quick-sell').addEventListener('click', () => quickSellPulledCards(results));
}

function keepPulledCards(cards) {
  cards.forEach(card => addCardToInventory(card));
  closeGachaModal();
  showToastNotification('Card(s) added to Inventory!');
}

function quickSellPulledCards(cards) {
  const totalValue = cards.reduce((sum, card) => sum + getSellValue(card), 0);
  state.coins += totalValue;
  updateCoinsDisplay();
  saveGameStateToStorage();
  closeGachaModal();
  showToastNotification('Quick sold for +' + totalValue + ' Coins!');
}

function showToastNotification(message) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  toast.textContent = message;
  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}
