import React, { useState, useEffect, useCallback } from 'react';
import masterCardsData from './data/cards.json';
import BrandMark from './components/BrandMark.jsx';
import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import ShowcaseModal from './components/ShowcaseModal.jsx';
import InventoryModal from './components/InventoryModal.jsx';
import ShopModal from './components/ShopModal.jsx';
import Storm4Modal from './components/Storm4Modal.jsx';
import GachaResultModal from './components/GachaResultModal.jsx';
import ToastContainer from './components/ToastContainer.jsx';
import { PACK_CONFIG } from './config/packs.js';
import { processRawCards } from './utils/cardData.js';
import {
  MAX_PLUS_LEVEL,
  buildInventoryInstance,
  getCardKey,
  getSellValue,
  getUpgradeCost,
  sanitizeInventory
} from './utils/cards.js';
import {
  STORAGE_KEYS,
  readStoredJson,
  readStoredNumber,
  writeStoredValues
} from './utils/storage.js';

export default function App() {
  const [coins, setCoins] = useState(() => readStoredNumber(STORAGE_KEYS.coins, 1500));

  const [rateBoosters, setRateBoosters] = useState(() => readStoredNumber(STORAGE_KEYS.rateBoosters, 0));

  // Direct load from imported cards.json
  const [cards] = useState(() => processRawCards(masterCardsData));

  const [inventory, setInventory] = useState(() => sanitizeInventory(readStoredJson(STORAGE_KEYS.inventory, [])));

  const [selectedCard, setSelectedCard] = useState(null);
  const [isShowcaseOpen, setIsShowcaseOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [gachaResults, setGachaResults] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Save game state to localStorage whenever coins, rateBoosters, or inventory changes
  useEffect(() => {
    writeStoredValues({
      [STORAGE_KEYS.coins]: String(coins),
      [STORAGE_KEYS.rateBoosters]: String(rateBoosters),
      [STORAGE_KEYS.inventory]: inventory
    });
  }, [coins, rateBoosters, inventory]);

  // Toast Notification Helper
  const showToast = useCallback((message) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 2800);
  }, []);

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
    if (!config) return;

    const totalCost = config.cost * count;
    if (coins < totalCost) {
      showToast(`Not enough coins! You need ${totalCost.toLocaleString()} Coins for ${count} pull(s).`);
      return;
    }

    setCoins(prev => prev - totalCost);

    const pulled = [];
    for (let i = 0; i < count; i++) {
      const card = rollSingleCard(packType);
      if (card) pulled.push(card);
    }

    setGachaResults(pulled);
  }, [coins, rollSingleCard, showToast]);

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

    const totalCoins = gachaResults.reduce((sum, card) => sum + getSellValue(card), 0);

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
    const cost = getUpgradeCost(mainLevel);

    if (mainLevel >= MAX_PLUS_LEVEL) {
      showToast(`${mainCard.name} is already at MAX +${MAX_PLUS_LEVEL}.`);
      return;
    }

    if (coins < cost) {
      showToast(`Not enough coins! Refinement requires ${cost} Coins.`);
      return;
    }

    setInventory(prevInv => {
      // 1. Cek ketersediaan material/tumbal
      const hasMaterial = prevInv.some(item =>
        item.instanceId ? item.instanceId === matKey : item.id === materialCard.id
      );

      if (!hasMaterial) {
        showToast('Duplicate material not found in inventory.');
        return prevInv;
      }

      // 2. Hapus HANYA 1 kartu material/tumbal secara presisi
      let materialRemoved = false;
      const filteredInv = prevInv.filter(item => {
        const itemKey = getCardKey(item);
        if (!materialRemoved && itemKey === matKey && itemKey !== mainKey) {
          materialRemoved = true;
          return false; // Hapus kartu tumbal ini
        }
        return true;
      });

      // 3. Tambahkan +1 MURNI ke kartu utama
      let updatedMainCard = null;
      const nextInv = filteredInv.map(item => {
        const itemKey = getCardKey(item);
        if (itemKey === mainKey) {
          const newPlusLevel = (item.plusLevel || 0) + 1;
          updatedMainCard = {
            ...item,
            plusLevel: newPlusLevel,
            ovr: (item.ovr || 0) + 1,
            atk: Math.min(99, (item.atk || 50) + 1),
            def: Math.min(99, (item.def || 50) + 1),
            chk: Math.min(99, (item.chk || 50) + 1)
          };
          return updatedMainCard;
        }
        return item;
      });

      // 4. Update selectedCard secara aman jika sedang dibuka di Modal
      if (updatedMainCard && selectedCard) {
        const selectedKey = getCardKey(selectedCard);
        if (selectedKey === mainKey) {
          setSelectedCard(updatedMainCard);
        }
      }

      return nextInv;
    });

    setCoins(prev => prev - cost);
    showToast(`${mainCard.name} successfully upgraded to +${mainLevel + 1}!`);
  }, [coins, selectedCard, showToast]);

  // Sell Card Handler
  const handleSellCard = useCallback((instanceId) => {
    setInventory(prevInv => {
      const cardIndex = prevInv.findIndex(c => c.instanceId === instanceId);
      if (cardIndex === -1) return prevInv;

      const card = prevInv[cardIndex];
      const sellValue = getSellValue(card);

      setCoins(c => c + sellValue);
      showToast(`Sold ${card.name} for +${sellValue} Coins.`);

      const nextInv = [...prevInv];
      nextInv.splice(cardIndex, 1);

      if (selectedCard && selectedCard.instanceId === instanceId) {
        setSelectedCard(null);
      }

      return nextInv;
    });
  }, [selectedCard, showToast]);

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
            <BrandMark />
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
