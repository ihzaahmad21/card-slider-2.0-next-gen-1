import React, { useState, useEffect, useCallback, useRef } from 'react';
import masterCardsData from './data/cards.json';
import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import ShowcaseModal from './components/ShowcaseModal.jsx';
import InventoryModal from './components/InventoryModal.jsx';
import ShopModal from './components/ShopModal.jsx';
import Storm4Modal from './components/Storm4Modal.jsx';
import GachaResultModal from './components/GachaResultModal.jsx';
import ToastContainer from './components/ToastContainer.jsx';

const PACK_CONFIG = {
  bronze: {
    cost: 100,
    rarityFilter: 'BRONZE',
    starRates: [{ star: 1, threshold: 50 }, { star: 2, threshold: 90 }, { star: 3, threshold: 100 }]
  },
  silver: {
    cost: 500,
    rarityFilter: 'SILVER RARE',
    starRates: [{ star: 3, threshold: 85 }, { star: 4, threshold: 100 }]
  },
  gold: {
    cost: 1000,
    rarityFilter: 'GOLD RARE',
    starRates: [{ star: 4, threshold: 80 }, { star: 5, threshold: 100 }]
  }
};

const STORAGE_KEYS = {
  coins: 'shinobiTCG.userCoins',
  rateBoosters: 'shinobiTCG.rateBoosters',
  inventory: 'shinobiTCG.userInventory'
};

const DEFAULTS = { coins: 1500, rateBoosters: 0, inventory: [] };

const VALID_RARITY_CLASSES = ['gold', 'silver', 'bronze'];
const FALLBACK_CARD_IMAGE = '/images/naruto__part_1__by_masonengine_daim8u2.png';

function logError(scope, err) {
  console.error(`[ShinobiTCG] ${scope}:`, err);
}

function readStoredNumber(key, fallback, errors) {
  try {
    const saved = localStorage.getItem(key);
    if (saved === null) return fallback;
    const parsed = Number(saved);
    if (!Number.isFinite(parsed) || parsed < 0) {
      throw new Error(`stored value is not a non-negative number: ${JSON.stringify(saved)}`);
    }
    return parsed;
  } catch (err) {
    logError(`Failed to read "${key}" from localStorage`, err);
    errors.push(key);
    return fallback;
  }
}

function sanitizeImagePath(value) {
  const src = String(value == null ? '' : value).trim();
  if (!src) return FALLBACK_CARD_IMAGE;
  const scheme = src.match(/^([a-z][a-z0-9+.-]*):/i);
  if (scheme && !/^https?$/i.test(scheme[1])) return FALLBACK_CARD_IMAGE;
  return src;
}

function sanitizeNumber(value, fallback) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

// Persisted inventory is user-writable (localStorage), so every field is
// re-validated rather than trusted as stored.
function sanitizeInventoryItem(item) {
  if (!item || typeof item !== 'object' || item.id === undefined || item.id === null) return null;
  return {
    id: item.id,
    instanceId: typeof item.instanceId === 'string' ? item.instanceId : `${item.id}-${Math.random().toString(36).slice(2, 8)}`,
    name: String(item.name == null ? 'Unknown Shinobi' : item.name),
    rarity: String(item.rarity == null ? 'BRONZE' : item.rarity),
    rarityClass: VALID_RARITY_CLASSES.includes(item.rarityClass) ? item.rarityClass : 'bronze',
    img: sanitizeImagePath(item.img),
    jutsu: String(item.jutsu == null ? 'Secret Ninja Art' : item.jutsu),
    summon: String(item.summon == null ? 'Unknown Spirit' : item.summon),
    ovr: sanitizeNumber(item.ovr, 70),
    stars: sanitizeNumber(item.stars, 1),
    atk: sanitizeNumber(item.atk, 50),
    def: sanitizeNumber(item.def, 50),
    chk: sanitizeNumber(item.chk, 50),
    quantity: sanitizeNumber(item.quantity, 1),
    plusLevel: sanitizeNumber(item.plusLevel, 0)
  };
}

function readStoredInventory(key, fallback, errors) {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return fallback;
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) {
      throw new Error(`stored inventory is not an array (got ${typeof parsed})`);
    }
    const sanitized = parsed.map(sanitizeInventoryItem).filter(Boolean);
    if (sanitized.length !== parsed.length) {
      logError(`Dropped ${parsed.length - sanitized.length} unusable inventory entr(ies) from "${key}"`, new Error('invalid inventory entries'));
      errors.push(key);
    }
    return sanitized;
  } catch (err) {
    logError(`Failed to read "${key}" from localStorage`, err);
    errors.push(key);
    return fallback;
  }
}

function loadPersistedState() {
  const errors = [];
  return {
    coins: readStoredNumber(STORAGE_KEYS.coins, DEFAULTS.coins, errors),
    rateBoosters: readStoredNumber(STORAGE_KEYS.rateBoosters, DEFAULTS.rateBoosters, errors),
    inventory: readStoredInventory(STORAGE_KEYS.inventory, DEFAULTS.inventory, errors),
    errors
  };
}

function getCardKey(card) {
  return card.instanceId || card.id;
}

function buildInventoryInstance(card, plusLevel = 0) {
  return {
    ...card,
    quantity: 1,
    plusLevel: plusLevel,
    instanceId: `${card.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  };
}

export default function App() {
  const [persisted] = useState(loadPersistedState);

  const [coins, setCoins] = useState(persisted.coins);
  const [rateBoosters, setRateBoosters] = useState(persisted.rateBoosters);
  const [inventory, setInventory] = useState(persisted.inventory);

  // Direct load from imported cards.json
  const [cards] = useState(() => processRawCards(masterCardsData));

  const [selectedCard, setSelectedCard] = useState(null);
  const [isShowcaseOpen, setIsShowcaseOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [gachaResults, setGachaResults] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Toast Notification Helper
  const showToast = useCallback((message) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 2800);
  }, []);

  // Surface unreadable saved data instead of silently resetting to defaults
  const loadErrorReported = useRef(false);
  useEffect(() => {
    if (loadErrorReported.current || persisted.errors.length === 0) return;
    loadErrorReported.current = true;
    showToast('Saved progress could not be read and was reset to defaults. See the console for details.');
  }, [persisted, showToast]);

  // Save game state to localStorage whenever coins, rateBoosters, or inventory changes
  const saveErrorReported = useRef(false);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.coins, String(coins));
      localStorage.setItem(STORAGE_KEYS.rateBoosters, String(rateBoosters));
      localStorage.setItem(STORAGE_KEYS.inventory, JSON.stringify(inventory));
      saveErrorReported.current = false;
    } catch (err) {
      logError('Failed to save progress to localStorage', err);
      if (!saveErrorReported.current) {
        saveErrorReported.current = true;
        showToast('Progress could not be saved — your collection will be lost when you reload.');
      }
    }
  }, [coins, rateBoosters, inventory, showToast]);

  // Card Draw Roll logic
  const rollSingleCard = useCallback((packType) => {
    const config = PACK_CONFIG[packType];
    if (!config || cards.length === 0) return null;

    const roll = Math.random() * 100;
    let rolledStar = config.starRates[config.starRates.length - 1].star;
    for (const rate of config.starRates) {
      if (roll < rate.threshold) {
        rolledStar = rate.star;
        break;
      }
    }

    let pool = cards.filter(c => c.rarity === config.rarityFilter);
    const starPool = pool.filter(c => c.stars === rolledStar);
    if (starPool.length > 0) pool = starPool;

    if (pool.length === 0) {
      pool = cards.filter(c => c.rarityClass === packType);
    }
    if (pool.length === 0) {
      pool = cards;
    }

    return pool[Math.floor(Math.random() * pool.length)];
  }, [cards]);

  // Open Pack Handler
  const handleOpenPack = useCallback((packType, count = 1) => {
    const config = PACK_CONFIG[packType];
    if (!config) {
      logError('Open pack failed', new Error(`unknown pack type "${packType}"`));
      showToast('That pack is unavailable right now.');
      return;
    }

    const totalCost = config.cost * count;
    if (coins < totalCost) {
      showToast(`Not enough coins! You need ${totalCost.toLocaleString()} Coins for ${count} pull(s).`);
      return;
    }

    // Roll before charging so a failed roll never costs the player coins
    const pulled = [];
    for (let i = 0; i < count; i++) {
      const card = rollSingleCard(packType);
      if (card) pulled.push(card);
    }

    if (pulled.length === 0) {
      logError('Open pack failed', new Error(`no card could be rolled for pack "${packType}" (card pool size: ${cards.length})`));
      showToast('Pack could not be opened — no cards available. You were not charged.');
      return;
    }

    if (pulled.length < count) {
      logError('Open pack partially failed', new Error(`rolled ${pulled.length} of ${count} cards for pack "${packType}"`));
      showToast(`Only ${pulled.length} of ${count} pulls could be rolled — you were charged for ${pulled.length}.`);
    }

    setCoins(prev => prev - config.cost * pulled.length);
    setGachaResults(pulled);
  }, [cards.length, coins, rollSingleCard, showToast]);

  // Keep Pulled Cards
  const handleKeepCards = useCallback(() => {
    if (!gachaResults || gachaResults.length === 0) return;

    setInventory(prev => {
      const nextInv = [...prev];
      gachaResults.forEach(card => {
        nextInv.push(buildInventoryInstance(card, 0));
      });
      return nextInv;
    });

    showToast(`${gachaResults.length} card(s) added to your Inventory!`);
    setGachaResults(null);
  }, [gachaResults, showToast]);

  // Quick Sell Pulled Cards
  const handleQuickSell = useCallback(() => {
    if (!gachaResults || gachaResults.length === 0) return;

    let totalCoins = 0;
    gachaResults.forEach(card => {
      if (card.rarityClass === 'gold') totalCoins += 400;
      else if (card.rarityClass === 'silver') totalCoins += 150;
      else totalCoins += 30;
    });

    setCoins(prev => prev + totalCoins);
    showToast(`Quick sold for +${totalCoins.toLocaleString()} Coins!`);
    setGachaResults(null);
  }, [gachaResults, showToast]);

  // FO3-style Refinement Handler (FIXED & MUTATION-SAFE)
  const handleUpgradeCard = useCallback((mainCard, materialCard) => {
    if (!mainCard || !materialCard) {
      showToast('Select a main card and a duplicate material first.');
      return;
    }

    // Ambil ID Unik (fallback ke id biasa jika instanceId kosong)
    const mainKey = getCardKey(mainCard);
    const matKey = getCardKey(materialCard);

    if (mainKey === matKey && mainCard.instanceId && materialCard.instanceId) {
      showToast('Cannot use the same card as its own material!');
      return;
    }

    const mainLevel = mainCard.plusLevel || 0;
    const cost = 200 * (mainLevel + 1);

    if (mainLevel >= 10) {
      showToast(`${mainCard.name} is already at MAX +10.`);
      return;
    }

    if (coins < cost) {
      showToast(`Not enough coins! Refinement requires ${cost} Coins.`);
      return;
    }

    // Validate against the current inventory *before* charging, so a failed
    // refinement can never deduct coins or report a false success.
    const hasMain = inventory.some(item => getCardKey(item) === mainKey);
    if (!hasMain) {
      logError('Refinement failed', new Error(`main card ${mainKey} not found in inventory`));
      showToast('That card is no longer in your inventory.');
      return;
    }

    const hasMaterial = inventory.some(item => {
      const itemKey = getCardKey(item);
      return itemKey === matKey && itemKey !== mainKey;
    });
    if (!hasMaterial) {
      showToast('Duplicate material not found in inventory.');
      return;
    }

    // 1. Hapus HANYA 1 kartu material/tumbal secara presisi
    let materialRemoved = false;
    const filteredInv = inventory.filter(item => {
      const itemKey = getCardKey(item);
      if (!materialRemoved && itemKey === matKey && itemKey !== mainKey) {
        materialRemoved = true;
        return false; // Hapus kartu tumbal ini
      }
      return true;
    });

    // 2. Tambahkan +1 MURNI ke kartu utama
    let updatedMainCard = null;
    const nextInv = filteredInv.map(item => {
      if (getCardKey(item) !== mainKey) return item;
      updatedMainCard = {
        ...item,
        plusLevel: (item.plusLevel || 0) + 1,
        ovr: (item.ovr || 0) + 1,
        atk: Math.min(99, (item.atk || 50) + 1),
        def: Math.min(99, (item.def || 50) + 1),
        chk: Math.min(99, (item.chk || 50) + 1)
      };
      return updatedMainCard;
    });

    if (!updatedMainCard) {
      logError('Refinement failed', new Error(`main card ${mainKey} could not be upgraded`));
      showToast('Refinement failed — nothing was changed.');
      return;
    }

    setInventory(nextInv);

    // Keep the open modal in sync with the refined card
    if (selectedCard && getCardKey(selectedCard) === mainKey) {
      setSelectedCard(updatedMainCard);
    }

    setCoins(prev => prev - cost);
    showToast(`${mainCard.name} successfully upgraded to +${mainLevel + 1}!`);
  }, [coins, inventory, selectedCard, showToast]);

  // Sell Card Handler
  const handleSellCard = useCallback((instanceId) => {
    const cardIndex = inventory.findIndex(c => getCardKey(c) === instanceId);
    if (cardIndex === -1) {
      logError('Sell failed', new Error(`no inventory card matches key ${instanceId}`));
      showToast('That card could not be sold — it is no longer in your inventory.');
      return;
    }

    const card = inventory[cardIndex];
    const sellValue = card.rarityClass === 'gold' ? 400 : (card.rarityClass === 'silver' ? 150 : 30);

    setInventory(prevInv => {
      const index = prevInv.findIndex(c => getCardKey(c) === instanceId);
      if (index === -1) return prevInv;
      const nextInv = [...prevInv];
      nextInv.splice(index, 1);
      return nextInv;
    });

    setCoins(c => c + sellValue);
    showToast(`Sold ${card.name} for +${sellValue} Coins.`);

    if (selectedCard && getCardKey(selectedCard) === instanceId) {
      setSelectedCard(null);
    }
  }, [inventory, selectedCard, showToast]);

  // Buy Coins Handler
  const handleBuyCoins = useCallback((amount) => {
    setCoins(prev => prev + amount);
    showToast(`Purchased +${amount.toLocaleString()} Coins!`);
  }, [showToast]);

  // Buy Booster Handler
  const handleBuyBooster = useCallback(() => {
    setRateBoosters(prev => prev + 1);
    showToast('Unlocked 1x Rate Booster!');
  }, [showToast]);

  return (
    <div className="app-root">
      {/* Floating Capsule Navbar */}
      <Navbar
        coins={coins}
        onOpenShowcase={() => setIsShowcaseOpen(true)}
        onOpenInventory={() => setIsInventoryOpen(true)}
        onOpenInventory={() => setIsInventoryOpen(true)}
        onOpenShop={() => setIsShopOpen(true)}
      />

      {/* Hero Section */}
      <Hero
        cards={cards}
        onOpenShowcase={() => setIsShowcaseOpen(true)}
        onOpenInventory={() => setIsInventoryOpen(true)}
        onOpenShop={() => setIsShopOpen(true)}
        onSelectCard={card => setSelectedCard(card)}
      />

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="nav-brand">
              <div className="brand-icon">忍</div>
              <div className="brand-text">SHINOBI<span>TCG</span></div>
            </div>
            <p className="footer-text">© 2026 Shinobi Card Slider 2.0 TCG React Application. All rights reserved.</p>
            <div className="footer-links">
              <a href="#home">Home</a>
              <button className="nav-link" onClick={() => setIsShowcaseOpen(true)}>Showcase</button>
              <a href="#gacha">Gacha</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Storm 4 Parchment Card View Modal */}
      {selectedCard && (
        <Storm4Modal
          card={selectedCard}
          inventory={inventory}
          coins={coins}
          onClose={() => setSelectedCard(null)}
          onUpgrade={handleUpgradeCard}
          onSell={handleSellCard}
        />
      )}

      {/* RAM-Optimized Showcase Modal (Mounts ONLY when isShowcaseOpen is true) */}
      <ShowcaseModal
        isOpen={isShowcaseOpen}
        onClose={() => setIsShowcaseOpen(false)}
        cards={cards}
        onSelectCard={card => setSelectedCard(card)}
      />

      <InventoryModal
        isOpen={isInventoryOpen}
        onClose={() => setIsInventoryOpen(false)}
        inventory={inventory}
        totalMasterCount={cards.length}
        onSelectCard={card => {
          setSelectedCard(card);
        }}
      />

      // ✅ REVISI PERBAIKAN:
      <ShopModal
        isOpen={isShopOpen}
        onClose={() => setIsShopOpen(false)}
        coins={coins}
        rateBoosters={rateBoosters}
        onOpenPack={(packType, count) => {
          handleOpenPack(packType, count);
          setIsShopOpen(false); // Khusus gacha tetep close biar animasi gacha / result modal keliatan
        }}
        onBuyCoins={amount => {
          handleBuyCoins(amount); // ❌ Hapus setIsShopOpen(false) biar modal tetep kebuka pas beli koin!
        }}
        onBuyBooster={() => {
          handleBuyBooster(); // ❌ Hapus setIsShopOpen(false) biar modal tetep kebuka pas unlock booster!
        }}
      />

      {/* Gacha Multi-Pull Result Popup Modal */}
      {gachaResults && (
        <GachaResultModal
          results={gachaResults}
          onKeep={handleKeepCards}
          onQuickSell={handleQuickSell}
          onClose={() => setGachaResults(null)}
          onSelectCard={card => setSelectedCard(card)}
        />
      )}

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} />
    </div>
  );
}

// Data Processor Function: Preserves all JSON values (OVR, Name, Rarity, Jutsu, Summon, Stats, Image)
function processRawCards(rawCards) {
  if (!Array.isArray(rawCards)) {
    throw new TypeError(`[ShinobiTCG] cards.json must contain an array of cards, got ${typeof rawCards}`);
  }

  return rawCards.map(card => {
    const rawImg = card.image_url || card.img || '';
    let img = rawImg.replace(/^\/?public\//, '');
    if (!img.startsWith('/') && !img.startsWith('http')) {
      img = '/' + img;
    }

    let rarityClass = 'bronze';
    let stars = card.stars;

    if (card.rarity === 'GOLD RARE') {
      rarityClass = 'gold';
      if (!stars) {
        if (card.ovr >= 95) stars = 5;
        else if (card.ovr >= 88) stars = 4;
        else stars = 3;
      }
    } else if (card.rarity === 'SILVER RARE') {
      rarityClass = 'silver';
      if (!stars) {
        if (card.ovr >= 88) stars = 4;
        else if (card.ovr >= 80) stars = 3;
        else stars = 2;
      }
    } else {
      rarityClass = 'bronze';
      if (!stars) {
        if (card.ovr <= 68) stars = 1;
        else if (card.ovr <= 74) stars = 2;
        else stars = 3;
      }
    }

    const atk = card.atk !== undefined ? card.atk : clamp(card.ovr + ((card.id * 7) % 5) - 2, 50, 99);
    const def = card.def !== undefined ? card.def : clamp(card.ovr - 3 + ((card.id * 3) % 4), 50, 99);
    const chk = card.chk !== undefined ? card.chk : clamp(card.ovr + 2 - ((card.id * 11) % 5), 50, 99);

    return {
      id: card.id,
      name: card.name,
      ovr: card.ovr, // Preserves exact JSON OVR
      rarity: card.rarity, // Preserves exact JSON rarity string
      rarityClass: rarityClass,
      stars: stars,
      img: img,
      jutsu: card.jutsu || getJutsuForCharacter(card.name),
      summon: card.summon || getSummonForCharacter(card.name),
      atk,
      def,
      chk
    };
  });
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

function getJutsuForCharacter(name) {
  const n = (name || '').toLowerCase();
  if (n.includes('naruto') && n.includes('baryon')) return 'Rasengan / Baryon Tail';
  if (n.includes('naruto') && n.includes('sage')) return 'Sage Art: Rasenshuriken';
  if (n.includes('naruto') && n.includes('six paths')) return 'Truth-Seeking Orbs';
  if (n.includes('naruto') && n.includes('bijuu')) return 'Tailed Beast Bomb';
  if (n.includes('sasuke') && n.includes('rinne')) return "Indra's Arrow / Chidori";
  if (n.includes('sasuke')) return 'Fire Release / Sharingan Genjutsu';
  if (n.includes('kakashi')) return 'Raikiri / Kamui';
  if (n.includes('itachi')) return 'Tsukuyomi / Amaterasu';
  if (n.includes('madara')) return 'Tengai Shinsei / Susanoo';
  if (n.includes('gaara')) return 'Sand Tsunami / Shield';
  if (n.includes('guy')) return 'Night Guy / Morning Peacock';
  if (n.includes('hashirama')) return 'Wood Style: Sage Art';
  if (n.includes('minato')) return 'Flying Raijin / Rasengan';
  return 'Secret Ninja Art';
}

function getSummonForCharacter(name) {
  const n = (name || '').toLowerCase();
  if (n.includes('naruto')) return 'Nine-Tails Kurama';
  if (n.includes('sasuke')) return 'Susanoo Armor';
  if (n.includes('kakashi')) return 'Ninken Hounds';
  if (n.includes('itachi')) return 'Crow Clone';
  if (n.includes('gaara')) return 'Shukaku Sand';
  if (n.includes('jiraiya') || n.includes('minato')) return 'Toad Gamabunta';
  if (n.includes('tsunade') || n.includes('sakura')) return 'Katsuyu Slug';
  if (n.includes('orochimaru')) return 'Giant Snake Manda';
  return 'None';
}
