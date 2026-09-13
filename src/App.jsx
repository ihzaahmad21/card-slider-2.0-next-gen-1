import React, { useState, useEffect, useCallback } from 'react';
import masterCardsData from './data/cards.json';
import EmberParticles from './components/EmberParticles.jsx';
import Sidebar from './components/Sidebar.jsx';
import UtilitiesView from './views/UtilitiesView.jsx';
import Topbar from './components/Topbar.jsx';
import HomeView from './views/HomeView.jsx';
import PatchNotesView from './views/PatchNotesView.jsx';
import CodexView from './views/CodexView.jsx';
import CharacterLoreView from './views/CharacterLoreView.jsx';
import MarketView from './views/MarketView.jsx';
import DeckView from './views/DeckView.jsx';
import BattleArenaView from './views/BattleArenaView.jsx';
import ShowcaseModal from './components/ShowcaseModal.jsx';
import Inventory from './components/Inventory.jsx';
import InventoryModal from './components/InventoryModal.jsx';
import ShopModal from './components/ShopModal.jsx';
import Storm4Modal from './components/Storm4Modal.jsx';
import GachaShop from './components/GachaShop.jsx';
import GachaResultModal from './components/GachaResultModal.jsx';
import ToastContainer from './components/ToastContainer.jsx';
import CardPreviewPlayground from './components/CardPreviewPlayground.jsx';
import SettingsModal from './components/SettingsModal.jsx';
import UserProfileModal from './components/UserProfileModal.jsx';
import MatchHistoryModal from './components/MatchHistoryModal.jsx';
import CardFusionModal from './components/CardFusionModal.jsx';
import { useAudioPlayer } from './hooks/useAudioPlayer.js';
import { useSettings } from './hooks/useSettings.js';
import { PACK_CONFIG } from './config/packs.js';
import { rollSingleCard, isTopTierPull } from './utils/gacha.js';
import { processRawCards, resolveRarity } from './utils/cardData.js';
import { checkAchievements } from './utils/achievementEngine.js';
import {
  MAX_PLUS_LEVEL,
  RARITY_LABELS,
  buildInventoryInstance,
  getCardKey,
  getSellValue,
  getUpgradeCost,
  sanitizeInventory
} from './utils/cards.js';
import {
  buyListing,
  createPlayerListing,
  removePlayerListing
} from './utils/market.js';
import {
  toggleCardInDeck,
  normalizeDeckPresets,
  sanitizeAllPresets
} from './utils/deck.js';
import { generateBotSquad, calculateLevelUp } from './utils/battle.js';
import {
  STORAGE_KEYS,
  readStoredJson,
  readStoredNumber,
  writeStoredValues
} from './utils/storage.js';

export default function App() {
  const [activeView, setActiveView] = useState('home');
  const [coins, setCoins] = useState(() => readStoredNumber(STORAGE_KEYS.coins, 1500));
  const [playerProfile, setPlayerProfile] = useState(() => ({
    level: readStoredNumber(STORAGE_KEYS.level, 1),
    exp: readStoredNumber(STORAGE_KEYS.exp, 0)
  }));
  const [rateBoosters, setRateBoosters] = useState(() => readStoredNumber(STORAGE_KEYS.rateBoosters, 0));

  // Pity state for each pack
  const [pity, setPity] = useState(() => ({
    bronze: readStoredNumber(STORAGE_KEYS.pity('bronze'), 0),
    silver: readStoredNumber(STORAGE_KEYS.pity('silver'), 0),
    gold: readStoredNumber(STORAGE_KEYS.pity('gold'), 0),
    premium: readStoredNumber(STORAGE_KEYS.pity('premium'), 0)
  }));

  // Direct load from imported cards.json
  const [cards] = useState(() => processRawCards(masterCardsData));

  const [inventory, setInventory] = useState(() => sanitizeInventory(readStoredJson(STORAGE_KEYS.inventory, [])));
  
  const [playerListings, setPlayerListings] = useState(() => readStoredJson(STORAGE_KEYS.marketListings, []));
  const [deckPresets, setDeckPresets] = useState(() => normalizeDeckPresets(readStoredJson(STORAGE_KEYS.deck, [])));
  const [activePresetId, setActivePresetId] = useState('preset-1');

  // Active Player Team (confirmed squad for Battle Arena) and Enemy BOT Squad
  const [activePlayerTeam, setActivePlayerTeam] = useState(() => readStoredJson(STORAGE_KEYS.activePlayerTeam, []));
  const [botEnemyTeam, setBotEnemyTeam] = useState(() => readStoredJson(STORAGE_KEYS.botEnemyTeam, null));

  const [selectedCard, setSelectedCard] = useState(null);
  const [isShowcaseOpen, setIsShowcaseOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isPlaygroundOpen, setIsPlaygroundOpen] = useState(false);
  const [gachaResults, setGachaResults] = useState(null);
  const [rankUp, setRankUp] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMatchHistoryOpen, setIsMatchHistoryOpen] = useState(false);
  const [isFusionOpen, setIsFusionOpen] = useState(false);
  const [avatarIcon, setAvatarIcon] = useState(() => localStorage.getItem(STORAGE_KEYS.avatarIcon) || '影');
  const [userName, setUserName] = useState(() => localStorage.getItem('shinobiTCG.userName') || 'Shadow Shinobi');
  const [achievements, setAchievements] = useState(() => readStoredJson(STORAGE_KEYS.achievements, []));
  const [battleStats, setBattleStats] = useState(() => readStoredJson(STORAGE_KEYS.battleStats, {
    totalMatches: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    currentWinStreak: 0
  }));

  // Lifted audio player API (shared by AudioControls + SettingsModal)
  const audio = useAudioPlayer();

  // Centralized settings (audio values seeded from the live player)
  const { settings, updateSetting, updateSettings, resetSettings, resetCategory } = useSettings({
    audio: {
      volume: audio.volume,
      muted: audio.isMuted,
      currentTrack: audio.currentTrack.id
    }
  });

  // Apply Reduce Motion globally
  useEffect(() => {
    document.documentElement.setAttribute(
      'data-reduced-motion',
      settings.display.reduceMotion ? 'true' : 'false'
    );
  }, [settings.display.reduceMotion]);

  // Sync Deck Presets with Inventory
  useEffect(() => {
    setDeckPresets(prevPresets => {
      const sanitized = sanitizeAllPresets(prevPresets, inventory);
      const changed = sanitized.some((p, i) => (p.deck.length !== (prevPresets[i]?.deck?.length || 0)));
      return changed ? sanitized : prevPresets;
    });
  }, [inventory]);

  // Save game state to localStorage whenever coins, playerProfile, rateBoosters, inventory, pity, deckPresets, activePlayerTeam, or botEnemyTeam changes
  useEffect(() => {
    writeStoredValues({
      [STORAGE_KEYS.coins]: String(coins),
      [STORAGE_KEYS.level]: String(playerProfile.level),
      [STORAGE_KEYS.exp]: String(playerProfile.exp),
      [STORAGE_KEYS.rateBoosters]: String(rateBoosters),
      [STORAGE_KEYS.inventory]: inventory,
      [STORAGE_KEYS.pity('bronze')]: String(pity.bronze || 0),
      [STORAGE_KEYS.pity('silver')]: String(pity.silver || 0),
      [STORAGE_KEYS.pity('gold')]: String(pity.gold || 0),
      [STORAGE_KEYS.pity('premium')]: String(pity.premium || 0),
      [STORAGE_KEYS.marketListings]: playerListings,
      [STORAGE_KEYS.deck]: deckPresets,
      [STORAGE_KEYS.activePlayerTeam]: activePlayerTeam,
      [STORAGE_KEYS.botEnemyTeam]: botEnemyTeam,
      [STORAGE_KEYS.avatarIcon]: avatarIcon,
      [STORAGE_KEYS.battleStats]: battleStats,
      [STORAGE_KEYS.achievements]: achievements,
      'shinobiTCG.userName': userName
    });
  }, [coins, playerProfile, rateBoosters, inventory, pity, playerListings, deckPresets, activePlayerTeam, botEnemyTeam, avatarIcon, battleStats, achievements, userName]);

  // Active Deck derived from current active preset
  const activeDeck = deckPresets.find(p => p.id === activePresetId)?.deck || [];

  // Handle toggling card in active preset deck
  const handleToggleDeckCard = useCallback((instanceId) => {
    setDeckPresets(prevPresets => {
      return prevPresets.map(preset => {
        if (preset.id === activePresetId) {
          return {
            ...preset,
            deck: toggleCardInDeck(preset.deck, instanceId)
          };
        }
        return preset;
      });
    });
  }, [activePresetId]);

  // Toast Notification Helper
  const showToast = useCallback((message) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 2800);
  }, []);

  // Add Player EXP and handle level up progression
  const addPlayerExp = useCallback((expAmount) => {
    let outcome;
    setPlayerProfile(prev => {
      outcome = calculateLevelUp(prev.level, prev.exp, expAmount);
      if (outcome.leveledUp) {
        showToast(`⚡ LEVEL UP! Congratulations, you reached Level ${outcome.newLevel}!`);
      }
      return { level: outcome.newLevel, exp: outcome.newExp };
    });
    return outcome;
  }, [showToast]);

  // Award Post-Battle Rewards (Coins and EXP) and track battle statistics
  const handleAwardBattleRewards = useCallback(({ coins: rewardCoins = 0, exp: rewardExp = 0, outcome = null }) => {
    if (rewardCoins > 0) {
      setCoins(prev => prev + rewardCoins);
    }
    if (rewardExp > 0) {
      addPlayerExp(rewardExp);
    }
    if (outcome) {
      setBattleStats(prev => {
        const isWin = outcome === 'player';
        const isLoss = outcome === 'bot';
        const isDraw = outcome === 'draw';
        const prevStreak = Number(prev?.currentWinStreak) || 0;
        const newStreak = isWin ? prevStreak + 1 : 0;
        return {
          totalMatches: ((prev && prev.totalMatches) || 0) + 1,
          wins: ((prev && prev.wins) || 0) + (isWin ? 1 : 0),
          losses: ((prev && prev.losses) || 0) + (isLoss ? 1 : 0),
          draws: ((prev && prev.draws) || 0) + (isDraw ? 1 : 0),
          currentWinStreak: newStreak
        };
      });
    }
  }, [addPlayerExp]);

  // Evaluate achievement milestones whenever relevant state changes
  useEffect(() => {
    const newlyUnlocked = checkAchievements(achievements, {
      battleStats,
      inventory,
      playerProfile,
      coins
    });
    if (newlyUnlocked.length > 0) {
      const newIds = newlyUnlocked.map(a => a.id);
      const totalBonusCoins = newlyUnlocked.reduce((sum, a) => sum + (a.reward || 0), 0);
      setAchievements(prev => [...prev, ...newIds]);
      if (totalBonusCoins > 0) {
        setCoins(prev => prev + totalBonusCoins);
      }
      newlyUnlocked.forEach(a => {
        showToast(`🏆 Milestone Unlocked: "${a.label}"! (+${a.reward} Coins)`);
      });
    }
  }, [battleStats, inventory, playerProfile, achievements, showToast]);

  // Handle Confirm Squad from DeckView: saves squad, generates BOT opponent, navigates to Battle Arena
  const handleConfirmSquad = useCallback((squad, avgOvr) => {
    setActivePlayerTeam(squad);
    const bot = generateBotSquad(squad, cards);
    setBotEnemyTeam(bot);
    setActiveView('battle');
    showToast(`⚡ Squad Confirmed! Avg OVR: ${avgOvr}. Entering Battle Arena!`);
  }, [cards, showToast]);

  // Handle Re-roll BOT Squad in Battle Arena
  const handleRerollBot = useCallback(() => {
    const currentTeam = activePlayerTeam && activePlayerTeam.length > 0
      ? activePlayerTeam
      : activeDeck.map(id => inventory.find(c => c.instanceId === id)).filter(Boolean);
    const target = currentTeam.length > 0 ? currentTeam : 75;
    const newBot = generateBotSquad(target, cards, { teamSize: Math.max(3, currentTeam.length) });
    setBotEnemyTeam(newBot);
    showToast(`🎲 New opponent: ${newBot.botName} (Avg OVR: ${newBot.avgOvr})!`);
  }, [activePlayerTeam, activeDeck, inventory, cards, showToast]);

  // Auto-generate BOT opponent if visiting Battle Arena without one
  useEffect(() => {
    if (activeView === 'battle' && (!botEnemyTeam || !botEnemyTeam.squad || botEnemyTeam.squad.length === 0)) {
      const currentTeam = activePlayerTeam && activePlayerTeam.length > 0
        ? activePlayerTeam
        : activeDeck.map(id => inventory.find(c => c.instanceId === id)).filter(Boolean);
      if (currentTeam.length > 0) {
        setBotEnemyTeam(generateBotSquad(currentTeam, cards));
      }
    }
  }, [activeView, botEnemyTeam, activePlayerTeam, activeDeck, inventory, cards]);

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

    let isBoosted = false;
    if (rateBoosters > 0) {
      isBoosted = true;
      setRateBoosters(prev => prev - 1);
      showToast("Rate Booster aktif! Peluang kartu tier tertinggi meningkat.");
    }

    let currentPity = pity[packType] || 0;

    const pulled = [];
    for (let i = 0; i < count; i++) {
      currentPity += 1;
      const isPity = currentPity >= config.pityGuarantee;

      const card = rollSingleCard(packType, cards, isPity, isBoosted);
      if (card) {
        pulled.push(card);
        // Reset pity jika mendapat kartu tier tertinggi
        if (isTopTierPull(packType, card)) {
          currentPity = 0;
        }
      }
    }

    setPity(prev => ({ ...prev, [packType]: currentPity }));
    setGachaResults(pulled);
  }, [coins, rateBoosters, pity, cards, showToast]);

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

    // Deteksi Rank-Up: apakah upgrade ini menaikkan kartu ke Diamond/Mythic?
    const newOvr = Math.min(110, Math.round(
      ((mainCard.atk || 50) + (mainCard.def || 50) + (mainCard.spd || 50) + (mainCard.chk || 50) + 4) / 4
    ));
    const { rarityClass: newRarityClass } = resolveRarity(mainCard, newOvr);
    const rankUpTier =
      ['diamond', 'mythic'].includes(newRarityClass) && newRarityClass !== mainCard.rarityClass
        ? newRarityClass : null;

    setInventory(prevInv => {
      // 1. Cek ketersediaan material/tumbal
      const hasMaterial = prevInv.some(item =>
        item.instanceId ? item.instanceId === matKey : item.id === materialCard.id
      );

      if (!hasMaterial) {
        showToast('Duplicate material not found in inventory.');
        return prevInv;
      }

      // Jangan habiskan kartu yang levelnya LEBIH TINGGI sbg tumbal
      if ((materialCard.plusLevel || 0) > (mainCard.plusLevel || 0)) {
        showToast('Cannot use a stronger card as upgrade material!');
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

      // 3. Tambahkan +1 ke 4 stats dan hitung ulang OVR, rarityClass, serta stars
      let updatedMainCard = null;
      const nextInv = filteredInv.map(item => {
        const itemKey = getCardKey(item);
        if (itemKey === mainKey) {
          const newPlusLevel = (item.plusLevel || 0) + 1;
          const newAtk = Math.min(110, (item.atk || 50) + 1);
          const newDef = Math.min(110, (item.def || 50) + 1);
          const newSpd = Math.min(110, (item.spd || 50) + 1);
          const newChk = Math.min(110, (item.chk || 50) + 1);
          const newOvr = Math.min(110, Math.round((newAtk + newDef + newSpd + newChk) / 4));
          const { rarityClass: newRarityClass, stars: newStars } = resolveRarity(item, newOvr);

          updatedMainCard = {
            ...item,
            plusLevel: newPlusLevel,
            ovr: newOvr,
            atk: newAtk,
            def: newDef,
            spd: newSpd,
            chk: newChk,
            rarityClass: newRarityClass,
            stars: newStars,
            rarity: RARITY_LABELS[newRarityClass] || item.rarity || 'BRONZE'
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
    showToast(rankUpTier
      ? `★ RANK UP! ${mainCard.name} naik ke ${RARITY_LABELS[rankUpTier]}!`
      : `${mainCard.name} successfully upgraded to +${mainLevel + 1}!`);

    if (rankUpTier) {
      setRankUp({ name: mainCard.name, tier: rankUpTier });
      setTimeout(() => setRankUp(null), 2600);
    }
  }, [coins, selectedCard, showToast]);

  // Sell Card Handler (supports single instanceId or array of instanceIds)
  const handleSellCard = useCallback((target) => {
    const idsToSell = Array.isArray(target) ? target : [target];
    if (idsToSell.length === 0) return;

    setInventory(prevInv => {
      let totalEarned = 0;
      let soldCount = 0;
      let lastSoldName = '';
      const idSet = new Set(idsToSell);

      const nextInv = prevInv.filter(card => {
        if (idSet.has(card.instanceId)) {
          totalEarned += getSellValue(card);
          soldCount++;
          lastSoldName = card.name;
          return false;
        }
        return true;
      });

      if (soldCount > 0) {
        setCoins(c => c + totalEarned);
        const msg = soldCount === 1 
          ? `Sold ${lastSoldName} for +${totalEarned.toLocaleString()} Coins.`
          : `Quick sold ${soldCount} cards for +${totalEarned.toLocaleString()} Coins!`;
        showToast(msg);
      }

      if (selectedCard && idSet.has(selectedCard.instanceId)) {
        setSelectedCard(null);
      }

      return nextInv;
    });
  }, [selectedCard, showToast]);

  // ── Card Fusion Handler ──────────────────────────────────────────────────────
  // mainCard: the card to keep & enhance (its instanceId stays).
  // sacrificeCard: the duplicate that gets removed.
  const handleFuseCard = useCallback((mainCard, sacrificeCard) => {
    if (!mainCard || !sacrificeCard) return false;
    if (String(mainCard.id) !== String(sacrificeCard.id)) return false;
    if (mainCard.instanceId === sacrificeCard.instanceId) return false;

    const STAT_BOOST_PER_LEVEL = 0.03;
    const MAX_ENHANCEMENT = 10;
    const currentLevel = mainCard.enhancementLevel || 0;
    if (currentLevel >= MAX_ENHANCEMENT) return false;
    const newLevel = currentLevel + 1;
    const boost = 1 + STAT_BOOST_PER_LEVEL * newLevel;

    setInventory(prev => {
      // Remove sacrifice
      const without = prev.filter(c => c.instanceId !== sacrificeCard.instanceId);
      // Boost main card stats
      return without.map(c => {
        if (c.instanceId !== mainCard.instanceId) return c;
        const baseAtk = c._baseAtk ?? c.atk ?? 50;
        const baseDef = c._baseDef ?? c.def ?? 50;
        const baseSpd = c._baseSpd ?? c.spd ?? 50;
        const baseChk = c._baseChk ?? c.chk ?? 50;
        const baseOvr = c._baseOvr ?? c.ovr ?? 70;
        return {
          ...c,
          enhancementLevel: newLevel,
          // Store originals on first fusion so future levels stack correctly
          _baseAtk: c._baseAtk ?? c.atk ?? 50,
          _baseDef: c._baseDef ?? c.def ?? 50,
          _baseSpd: c._baseSpd ?? c.spd ?? 50,
          _baseChk: c._baseChk ?? c.chk ?? 50,
          _baseOvr: c._baseOvr ?? c.ovr ?? 70,
          atk: Math.min(110, Math.round(baseAtk * boost)),
          def: Math.min(110, Math.round(baseDef * boost)),
          spd: Math.min(110, Math.round(baseSpd * boost)),
          chk: Math.min(110, Math.round(baseChk * boost)),
          ovr: Math.min(110, Math.round(baseOvr * boost))
        };
      });
    });
    return true;
  }, []);

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

  // MARKET LOGIC
  const handleMarketBuy = useCallback((listingId, listingsToSearch, isBot, onSuccessCallback) => {
    const result = buyListing(listingsToSearch, inventory, coins, listingId);
    
    if (result.error) {
      showToast(result.error);
      return;
    }
    
    setCoins(result.newCoins);
    setInventory(result.newInventory);
    
    if (!isBot) {
      setPlayerListings(result.newListings);
    } else {
      if (onSuccessCallback) onSuccessCallback(result.newListings);
    }
    
    showToast(`Purchased ${result.card.name}!`);
  }, [coins, inventory, showToast]);

  const handleMarketCreate = useCallback((inventoryItem, price) => {
    setInventory(prev => prev.filter(item => item.instanceId !== inventoryItem.instanceId));
    
    const newListing = createPlayerListing(inventoryItem, price);
    setPlayerListings(prev => [...prev, newListing]);
    
    showToast(`Listed ${inventoryItem.name} on the market for ${price.toLocaleString()} Coins!`);
  }, [showToast]);

  const handleMarketCancel = useCallback((listingId) => {
    const result = removePlayerListing(playerListings, listingId);
    if (result.error) {
      showToast(result.error);
      return;
    }
    
    setPlayerListings(result.newListings);
    setInventory(prev => [...prev, result.card]);
    
    showToast(`Cancelled listing for ${result.card.name}.`);
  }, [playerListings, showToast]);

  return (
    <div className="app">
      <EmberParticles count={22} />
      <Sidebar activeView={activeView} setActiveView={setActiveView} />

      <div style={{ gridColumn: '2', gridRow: '1 / 3', display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <Topbar
          coins={coins}
          gems={50}
          level={playerProfile.level}
          exp={playerProfile.exp}
          avatarIcon={avatarIcon}
          onOpenProfile={() => setIsProfileOpen(true)}
        />

        <main className="main" style={{ flex: 1, overflowY: 'auto' }}>
          {activeView === 'home' && (
            <HomeView
              cards={cards}
              onStartGacha={() => setActiveView('gacha')}
              onOpenInventory={() => setActiveView('inventory')}
              onOpenShowcase={() => setIsShowcaseOpen(true)}
              onSelectCard={card => setSelectedCard(card)}
              inventory={inventory}
            />
          )}

          {activeView === 'gacha' && (
            <div style={{ padding: '20px 0' }}>
              <GachaShop
                coins={coins}
                rateBoosters={rateBoosters}
                pity={pity}
                onOpenPack={handleOpenPack}
                onBuyCoins={handleBuyCoins}
                onBuyBooster={handleBuyBooster}
              />
            </div>
          )}

          {activeView === 'inventory' && (
            <div style={{ padding: '20px 0' }}>
              <Inventory
                inventory={inventory}
                onSelectCard={card => setSelectedCard(card)}
              />
            </div>
          )}

          {activeView === 'showcase' && (
            <div style={{ padding: '20px 0' }}>
              <ShowcaseModal
                isInline={true}
                cards={cards}
                onSelectCard={card => setSelectedCard(card)}
              />
            </div>
          )}

          {activeView === 'patchnotes' && (
            <PatchNotesView />
          )}
          
          {activeView === 'codex' && (
            <CodexView 
              cards={cards}
              inventory={inventory}
              onSelectCard={card => setSelectedCard(card)}
              onSwitchToLore={() => setActiveView('lore')}
            />
          )}

          {activeView === 'lore' && (
            <CharacterLoreView 
              cards={cards}
              inventory={inventory}
              onSelectCard={card => setSelectedCard(card)}
              onSwitchToCodex={() => setActiveView('codex')}
            />
          )}

          {activeView === 'market' && (
            <MarketView 
              cards={cards}
              inventory={inventory}
              coins={coins}
              playerListings={playerListings}
              onBuyListing={handleMarketBuy}
              onCreateListing={handleMarketCreate}
              onCancelListing={handleMarketCancel}
              onQuickSell={handleSellCard}
              onSelectCard={card => setSelectedCard(card)}
              onOpenFusion={() => setIsFusionOpen(true)}
            />
          )}

          {activeView === 'deck' && (
            <DeckView 
              inventory={inventory}
              presets={deckPresets}
              activePresetId={activePresetId}
              onSelectPreset={setActivePresetId}
              deck={activeDeck}
              onToggleDeckCard={handleToggleDeckCard}
              onSelectCard={card => setSelectedCard(card)}
              showToast={showToast}
              onConfirmSquad={handleConfirmSquad}
            />
          )}

          {activeView === 'battle' && (
            <BattleArenaView
              playerSquad={
                activePlayerTeam && activePlayerTeam.length > 0
                  ? activePlayerTeam
                  : activeDeck.map(id => inventory.find(c => c.instanceId === id)).filter(Boolean)
              }
              botSquad={botEnemyTeam?.squad || []}
              botName={botEnemyTeam?.botName || 'Rogue Shinobi Brigade'}
              playerLevel={playerProfile.level}
              playerExp={playerProfile.exp}
              onRerollBot={handleRerollBot}
              onNavigateToDeck={() => setActiveView('deck')}
              onNavigateToHome={() => setActiveView('home')}
              onAwardRewards={handleAwardBattleRewards}
              onAwardCoins={(amt) => {
                setCoins(prev => prev + amt);
              }}
              addPlayerExp={addPlayerExp}
              showToast={showToast}
              onOpenMatchHistory={() => setIsMatchHistoryOpen(true)}
            />
          )}

          {activeView === 'utilities' && (
            <UtilitiesView
              inventory={inventory}
              allCards={cards}
              audio={audio}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onClaimDaily={(result) => {
                setCoins(prev => prev + result.reward);
                if (
                  settings.notifications.enabled &&
                  settings.notifications.dailyRewards
                ) {
                  showToast(`Daily Bonus! +${result.reward.toLocaleString()} Coins (Day ${result.streak})`);
                }
              }}
            />
          )}
        </main>
      </div>



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

      {/* RAM-Optimized Showcase Modal */}
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
        pity={pity}
        onOpenPack={(packType, count) => {
          handleOpenPack(packType, count);
          setIsShopOpen(false);
        }}
        onBuyCoins={amount => {
          handleBuyCoins(amount);
        }}
        onBuyBooster={() => {
          handleBuyBooster();
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

      {/* Rank-Up Celebration Overlay */}
      {rankUp && (
        <div
          className={`rankup-overlay rankup-${rankUp.tier}`}
          onClick={() => setRankUp(null)}
        >
          <div className="rankup-card">
            ★ RANK UP! ★<br />
            {rankUp.name} → {RARITY_LABELS[rankUp.tier]}
          </div>
        </div>
      )}

      {/* 3D Card Preview Playground Modal */}
      <CardPreviewPlayground
        isOpen={isPlaygroundOpen}
        onClose={() => setIsPlaygroundOpen(false)}
        cards={cards}
        inventory={inventory}
      />

      {/* Player Profile & Stats Modal */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        level={playerProfile.level}
        exp={playerProfile.exp}
        coins={coins}
        gems={50}
        inventory={inventory}
        totalCardCount={cards.length}
        deckPresets={deckPresets}
        battleStats={battleStats}
        avatarIcon={avatarIcon}
        onChangeAvatar={newIcon => {
          setAvatarIcon(newIcon);
          showToast(`🎭 Avatar changed to "${newIcon}"!`);
        }}
        userName={userName}
        onChangeUserName={newName => {
          setUserName(newName);
          showToast(`✎ Shinobi name updated to "${newName}"!`);
        }}
        onOpenMatchHistory={() => setIsMatchHistoryOpen(true)}
        unlockedAchievements={achievements}
      />

      {/* Settings / Preferences Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        updateSetting={updateSetting}
        resetSettings={resetSettings}
        resetCategory={resetCategory}
        audio={audio}
      />

      {/* Battle Match History Modal */}
      <MatchHistoryModal
        isOpen={isMatchHistoryOpen}
        onClose={() => setIsMatchHistoryOpen(false)}
        showToast={showToast}
      />

      {/* Card Fusion Lab Modal */}
      <CardFusionModal
        isOpen={isFusionOpen}
        onClose={() => setIsFusionOpen(false)}
        inventory={inventory}
        onFuse={handleFuseCard}
        showToast={showToast}
      />

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} />
    </div>
  );
}
