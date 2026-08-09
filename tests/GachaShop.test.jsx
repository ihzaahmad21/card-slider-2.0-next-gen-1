import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GachaShop from '../src/components/GachaShop.jsx';

function renderShop(props = {}) {
  const handlers = {
    coins: 5000,
    rateBoosters: 2,
    onOpenPack: vi.fn(),
    onBuyCoins: vi.fn(),
    onBuyBooster: vi.fn(),
    ...props
  };
  const utils = render(<GachaShop {...handlers} />);
  return { ...utils, ...handlers };
}

const stepper = (pack) => {
  const item = document.querySelector(`.pack-shop-item.${pack}`);
  return {
    minus: item.querySelectorAll('.qty-btn')[0],
    plus: item.querySelectorAll('.qty-btn')[1],
    value: () => item.querySelector('.qty-value').textContent,
    total: () => item.querySelector('.pack-total').textContent,
    open: () => item.querySelector('.btn-shop-action')
  };
};

describe('GachaShop', () => {
  it('renders the three single-pull packs with their costs', () => {
    renderShop();

    expect([...document.querySelectorAll('.pack-card .pack-title')].map(el => el.textContent)).toEqual([
      'Bronze Pack',
      'Silver Pack',
      'Gold Pack'
    ]);
    expect([...document.querySelectorAll('.pack-card .pack-cost')].map(el => el.textContent)).toEqual([
      '⚙100 Coins',
      '⚙500 Coins',
      '⚙1,000 Coins'
    ]);
  });

  it.each([['bronze'], ['silver'], ['gold']])('opens a single %s pack', async (pack) => {
    const { onOpenPack } = renderShop();
    const label = pack[0].toUpperCase() + pack.slice(1);

    await userEvent.click(
      [...document.querySelectorAll('.pack-card .btn-pack-buy')].find(b => b.textContent === `Open 1x ${label} Pack`)
    );

    expect(onOpenPack).toHaveBeenCalledWith(pack, 1);
  });

  it('shows the owned rate booster count', () => {
    renderShop({ rateBoosters: 7 });
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('starts every multi-pull stepper at one', () => {
    renderShop();

    for (const pack of ['bronze', 'silver', 'gold']) {
      expect(stepper(pack).value()).toBe('x1');
    }
  });

  it('increments the quantity and updates the localised total', async () => {
    renderShop();
    const gold = stepper('gold');

    await userEvent.click(gold.plus);
    await userEvent.click(gold.plus);

    expect(gold.value()).toBe('x3');
    expect(gold.total()).toBe('Total: 3,000 Coins');
  });

  it('clamps the quantity between 1 and 10', async () => {
    renderShop();
    const bronze = stepper('bronze');

    await userEvent.click(bronze.minus);
    expect(bronze.value()).toBe('x1');

    for (let i = 0; i < 12; i++) await userEvent.click(bronze.plus);
    expect(bronze.value()).toBe('x10');
    expect(bronze.total()).toBe('Total: 1,000 Coins');

    await userEvent.click(bronze.minus);
    expect(bronze.value()).toBe('x9');
  });

  it('keeps pack quantities independent', async () => {
    renderShop();

    await userEvent.click(stepper('silver').plus);

    expect(stepper('silver').value()).toBe('x2');
    expect(stepper('bronze').value()).toBe('x1');
    expect(stepper('gold').value()).toBe('x1');
  });

  it('opens a multi-pull with the selected quantity', async () => {
    const { onOpenPack } = renderShop();
    const silver = stepper('silver');

    await userEvent.click(silver.plus);
    await userEvent.click(silver.plus);
    await userEvent.click(silver.open());

    expect(onOpenPack).toHaveBeenCalledWith('silver', 3);
  });

  it('buys coin bundles and boosters', async () => {
    const { onBuyCoins, onBuyBooster } = renderShop();

    await userEvent.click(screen.getByRole('button', { name: 'Buy 1,500 Coins' }));
    await userEvent.click(screen.getByRole('button', { name: 'Buy 4,000 Coins' }));
    await userEvent.click(screen.getByRole('button', { name: 'Unlock Booster' }));

    expect(onBuyCoins).toHaveBeenNthCalledWith(1, 1500);
    expect(onBuyCoins).toHaveBeenNthCalledWith(2, 4000);
    expect(onBuyBooster).toHaveBeenCalledTimes(1);
  });
});
