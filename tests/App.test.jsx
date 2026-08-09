import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App.jsx';
import masterCardsData from '../src/data/cards.json';
import { makeInventoryItem } from './fixtures.js';

const COINS_KEY = 'shinobiTCG.userCoins';
const BOOSTERS_KEY = 'shinobiTCG.rateBoosters';
const INVENTORY_KEY = 'shinobiTCG.userInventory';

const coinBalance = () => document.querySelector('.user-coins-badge').textContent;
const navButton = (label) =>
  [...document.querySelectorAll('.nav-menu .nav-link')].find(el => el.textContent === label);
const storedCoins = () => Number(localStorage.getItem(COINS_KEY));
const storedInventory = () => JSON.parse(localStorage.getItem(INVENTORY_KEY));
const revealedCards = () => document.querySelectorAll('.gacha-result-card');
const toastMessages = () => [...document.querySelectorAll('.toast-notification')].map(el => el.textContent);

/** Deterministic but varied stand-in for Math.random so pulls stay unique. */
function stubRandom() {
  let step = 0;
  return vi.spyOn(Math, 'random').mockImplementation(() => {
    step += 1;
    return (step * 0.37) % 1;
  });
}

async function openPack(user, pack) {
  await user.click(navButton('Shop'));
  await user.click(document.querySelector(`.${pack}-pack .btn-pack-buy`));
}

function seedInventory(items) {
  localStorage.setItem(INVENTORY_KEY, JSON.stringify(items));
}

describe('App', () => {
  let user;

  beforeEach(() => {
    user = userEvent.setup();
    stubRandom();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('persisted game state', () => {
    it('starts with 1,500 coins, no boosters and an empty inventory', () => {
      render(<App />);

      expect(coinBalance()).toContain('1,500 COINS');
      expect(storedCoins()).toBe(1500);
      expect(localStorage.getItem(BOOSTERS_KEY)).toBe('0');
      expect(storedInventory()).toEqual([]);
    });

    it('restores coins, boosters and inventory from localStorage', async () => {
      localStorage.setItem(COINS_KEY, '250');
      localStorage.setItem(BOOSTERS_KEY, '4');
      seedInventory([makeInventoryItem({ name: 'Neji', instanceId: 'neji-1' })]);

      render(<App />);

      expect(coinBalance()).toContain('250 COINS');
      await user.click(navButton('Shop'));
      expect(screen.getByText('4')).toBeInTheDocument();
      await user.keyboard('{Escape}');
      await user.click(navButton('Inventory'));
      expect(screen.getByText('Collection: 1 / 190 Shinobi Unlocked')).toBeInTheDocument();
    });

    it('ignores a corrupt stored inventory', () => {
      localStorage.setItem(INVENTORY_KEY, '{not json');

      render(<App />);

      expect(storedInventory()).toEqual([]);
    });

    it('warns instead of throwing when persistence fails', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('quota exceeded');
      });

      render(<App />);

      expect(warn).toHaveBeenCalledWith('[ShinobiTCG] LocalStorage sync warning:', expect.any(Error));
      setItem.mockRestore();
    });
  });

  describe('card catalogue', () => {
    it('renders every master card in the showcase filters', async () => {
      render(<App />);

      await user.click(navButton('Showcase Modal'));

      expect(screen.getByRole('button', { name: `ALL (${masterCardsData.length})` })).toBeInTheDocument();
    });
  });

  describe('opening packs', () => {
    it('charges the pack cost and reveals one card', async () => {
      render(<App />);

      await openPack(user, 'gold');

      expect(revealedCards()).toHaveLength(1);
      expect(coinBalance()).toContain('500 COINS');
      await waitFor(() => expect(storedCoins()).toBe(500));
    });

    it('closes the shop and reveals every card of a multi-pull', async () => {
      localStorage.setItem(COINS_KEY, '1000');
      render(<App />);

      await user.click(navButton('Shop'));
      const bronze = document.querySelector('.pack-shop-item.bronze');
      await user.click(bronze.querySelectorAll('.qty-btn')[1]);
      await user.click(bronze.querySelectorAll('.qty-btn')[1]);
      await user.click(bronze.querySelector('.btn-shop-action'));

      expect(document.querySelector('.modal-panel-shop')).toBeNull();
      expect(revealedCards()).toHaveLength(3);
      expect(coinBalance()).toContain('700 COINS');
    });

    it('rejects a pull that costs more than the current balance', async () => {
      localStorage.setItem(COINS_KEY, '50');
      render(<App />);

      await openPack(user, 'bronze');

      expect(revealedCards()).toHaveLength(0);
      expect(coinBalance()).toContain('50 COINS');
      expect(toastMessages()).toEqual(['Not enough coins! You need 100 Coins for 1 pull(s).']);
    });

    it('rolls only cards of the pack rarity', async () => {
      localStorage.setItem(COINS_KEY, '10000');
      render(<App />);

      await openPack(user, 'gold');

      expect(document.querySelector('.reveal-tier-tag').className).toContain('gold-tag');
      expect(document.querySelectorAll('.gacha-result-card .card-container.gold-tier')).toHaveLength(1);
    });

    it('closes the reveal from the backdrop without keeping the cards', async () => {
      render(<App />);
      await openPack(user, 'bronze');

      await user.click(document.querySelector('.modal-overlay'));

      expect(revealedCards()).toHaveLength(0);
      expect(storedInventory()).toEqual([]);
    });
  });

  describe('keeping and quick selling pulls', () => {
    it('adds each kept card to the inventory as its own instance', async () => {
      localStorage.setItem(COINS_KEY, '1000');
      render(<App />);

      await user.click(navButton('Shop'));
      const bronze = document.querySelector('.pack-shop-item.bronze');
      await user.click(bronze.querySelectorAll('.qty-btn')[1]);
      await user.click(bronze.querySelector('.btn-shop-action'));
      await user.click(screen.getByRole('button', { name: 'KEEP CARD(S)' }));

      await waitFor(() => expect(storedInventory()).toHaveLength(2));
      const inventory = storedInventory();
      expect(new Set(inventory.map(c => c.instanceId)).size).toBe(2);
      expect(inventory.every(c => c.plusLevel === 0 && c.quantity === 1)).toBe(true);
      expect(toastMessages()).toEqual(['2 card(s) added to your Inventory!']);
      expect(revealedCards()).toHaveLength(0);
    });

    it('quick sells a bronze pull for 30 coins', async () => {
      render(<App />);
      await openPack(user, 'bronze');

      await user.click(screen.getByRole('button', { name: 'QUICK SELL' }));

      expect(coinBalance()).toContain('1,430 COINS');
      expect(toastMessages()).toEqual(['Quick sold for +30 Coins!']);
      await waitFor(() => expect(storedInventory()).toEqual([]));
    });

    it('quick sells a gold pull for 400 coins', async () => {
      render(<App />);
      await openPack(user, 'gold');

      await user.click(screen.getByRole('button', { name: 'QUICK SELL' }));

      expect(coinBalance()).toContain('900 COINS');
    });

    it('quick sells a silver pull for 150 coins', async () => {
      render(<App />);
      await openPack(user, 'silver');

      await user.click(screen.getByRole('button', { name: 'QUICK SELL' }));

      expect(coinBalance()).toContain('1,150 COINS');
    });
  });

  describe('shop purchases', () => {
    it('adds purchased coins and keeps the shop open', async () => {
      render(<App />);

      await user.click(navButton('Shop'));
      await user.click(screen.getByRole('button', { name: 'Buy 4,000 Coins' }));

      expect(coinBalance()).toContain('5,500 COINS');
      expect(document.querySelector('.modal-panel-shop')).not.toBeNull();
      expect(toastMessages()).toEqual(['Purchased +4,000 Coins!']);
      await waitFor(() => expect(storedCoins()).toBe(5500));
    });

    it('unlocks rate boosters', async () => {
      render(<App />);

      await user.click(navButton('Shop'));
      await user.click(screen.getByRole('button', { name: 'Unlock Booster' }));

      expect(screen.getByText('Owned Boosters:').textContent).toBe('Owned Boosters: 1');
      expect(toastMessages()).toEqual(['Unlocked 1x Rate Booster!']);
      await waitFor(() => expect(localStorage.getItem(BOOSTERS_KEY)).toBe('1'));
    });
  });

  describe('refinement', () => {
    const duplicates = [
      makeInventoryItem({ id: 1, instanceId: 'main', name: 'Bee', ovr: 90, atk: 90, def: 90, chk: 90 }),
      makeInventoryItem({ id: 1, instanceId: 'material', name: 'Bee', ovr: 90, atk: 90, def: 90, chk: 90 })
    ];

    async function openCardDetail(instanceIndex = 0) {
      await user.click(navButton('Inventory'));
      await user.click(document.querySelectorAll('.inventory-card-wrapper')[instanceIndex]);
    }

    it('consumes one duplicate and the coin cost to add +1', async () => {
      seedInventory(duplicates);
      render(<App />);
      await openCardDetail();

      await user.click(document.querySelector('.storm4-btn-upgrade'));

      await waitFor(() => expect(storedInventory()).toHaveLength(1));
      const [upgraded] = storedInventory();
      expect(upgraded).toMatchObject({ instanceId: 'main', plusLevel: 1, ovr: 91, atk: 91, def: 91, chk: 91 });
      expect(coinBalance()).toContain('1,300 COINS');
      expect(toastMessages()).toEqual(['Bee successfully upgraded to +1!']);
    });

    it('keeps the open card detail in sync with the upgrade', async () => {
      seedInventory(duplicates);
      render(<App />);
      await openCardDetail();

      await user.click(document.querySelector('.storm4-btn-upgrade'));

      expect(document.querySelector('.storm4-plus-badge').textContent).toBe('+1');
      expect(document.querySelector('.storm4-ovr-num').textContent).toBe('91');
    });

    it('caps refined stats at 99', async () => {
      seedInventory([
        makeInventoryItem({ id: 1, instanceId: 'main', name: 'Bee', ovr: 99, atk: 99, def: 99, chk: 99 }),
        makeInventoryItem({ id: 1, instanceId: 'material', name: 'Bee', ovr: 99, atk: 99, def: 99, chk: 99 })
      ]);
      render(<App />);
      await openCardDetail();

      await user.click(document.querySelector('.storm4-btn-upgrade'));

      await waitFor(() => expect(storedInventory()).toHaveLength(1));
      expect(storedInventory()[0]).toMatchObject({ ovr: 100, atk: 99, def: 99, chk: 99 });
    });

    it('charges more coins at higher plus levels', async () => {
      localStorage.setItem(COINS_KEY, '2000');
      seedInventory([
        makeInventoryItem({ id: 1, instanceId: 'main', name: 'Bee', plusLevel: 3 }),
        makeInventoryItem({ id: 1, instanceId: 'material', name: 'Bee' })
      ]);
      render(<App />);
      await openCardDetail();

      expect(screen.getByText('800C + 1 Duplicate')).toBeInTheDocument();
      await user.click(document.querySelector('.storm4-btn-upgrade'));

      expect(coinBalance()).toContain('1,200 COINS');
    });

    it('blocks refinement when coins are short', async () => {
      localStorage.setItem(COINS_KEY, '100');
      seedInventory(duplicates);
      render(<App />);
      await openCardDetail();

      expect(document.querySelector('.storm4-btn-upgrade')).toBeDisabled();
      expect(storedInventory()).toHaveLength(2);
    });
  });

  describe('selling from the card detail', () => {
    it('removes the sold instance, pays out and closes the detail', async () => {
      seedInventory([
        makeInventoryItem({ id: 1, instanceId: 'sell-me', name: 'Bee', rarityClass: 'gold' }),
        makeInventoryItem({ id: 2, instanceId: 'keep-me', name: 'Ino', rarityClass: 'silver' })
      ]);
      render(<App />);
      await user.click(navButton('Inventory'));
      await user.click([...document.querySelectorAll('.inventory-card-wrapper')].find(el => el.textContent.includes('Bee')));

      await user.click(document.querySelector('.storm4-btn-sell'));

      await waitFor(() => expect(storedInventory().map(c => c.instanceId)).toEqual(['keep-me']));
      expect(coinBalance()).toContain('1,900 COINS');
      expect(toastMessages()).toEqual(['Sold Bee for +400 Coins.']);
      expect(document.querySelector('.storm4-modal-overlay')).toBeNull();
    });
  });

  describe('toasts', () => {
    it('dismisses a toast after its lifetime', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
      render(<App />);
      const fakeTimerUser = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

      await fakeTimerUser.click(navButton('Shop'));
      await fakeTimerUser.click(screen.getByRole('button', { name: 'Unlock Booster' }));
      expect(toastMessages()).toHaveLength(1);

      act(() => {
        vi.advanceTimersByTime(2800);
      });

      expect(toastMessages()).toEqual([]);
      vi.useRealTimers();
    });
  });

  describe('navigation', () => {
    it('opens and closes the showcase, inventory and shop modals', async () => {
      render(<App />);

      await user.click(navButton('Showcase Modal'));
      expect(document.querySelector('.showcase-modal-overlay')).not.toBeNull();
      await user.click(screen.getByTitle('Close Showcase (ESC)'));
      expect(document.querySelector('.showcase-modal-overlay')).toBeNull();

      await user.click(navButton('Inventory'));
      expect(screen.getByText('Your Shinobi Inventory')).toBeInTheDocument();
      await user.click(screen.getByTitle('Close Inventory (ESC)'));
      expect(screen.queryByText('Your Shinobi Inventory')).toBeNull();

      await user.click(navButton('Shop'));
      expect(document.querySelector('.modal-panel-shop')).not.toBeNull();
      await user.click(screen.getByTitle('Close Shop (ESC)'));
      expect(document.querySelector('.modal-panel-shop')).toBeNull();
    });

    it('opens the showcase from the footer link', async () => {
      render(<App />);

      await user.click(document.querySelector('.footer-links .nav-link'));

      expect(document.querySelector('.showcase-modal-overlay')).not.toBeNull();
    });

    it('opens the card detail from the hero preview and closes it again', async () => {
      render(<App />);

      await user.click(document.querySelector('.hero-card-stage'));
      expect(document.querySelector('.storm4-modal-overlay')).not.toBeNull();

      await user.click(screen.getByRole('button', { name: 'CLOSE' }));
      expect(document.querySelector('.storm4-modal-overlay')).toBeNull();
    });

    it('opens the card detail from a showcase card', async () => {
      render(<App />);

      await user.click(navButton('Showcase Modal'));
      await user.click(document.querySelectorAll('.showcase-card-wrapper .card-container')[0]);

      expect(document.querySelector('.storm4-modal-overlay')).not.toBeNull();
      expect(screen.getByText('Roll in Gacha to unlock this card!')).toBeInTheDocument();
    });

    it('opens the card detail from a revealed pull', async () => {
      render(<App />);
      await openPack(user, 'bronze');

      await user.click(document.querySelector('.gacha-result-card .card-container'));

      expect(document.querySelector('.storm4-modal-overlay')).not.toBeNull();
    });
  });
});
