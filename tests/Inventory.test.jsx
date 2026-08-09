import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Inventory from '../src/components/Inventory.jsx';
import { makeInventoryItem } from './fixtures.js';

const items = [
  makeInventoryItem({ id: 1, instanceId: 'a', name: 'Choji', ovr: 70, plusLevel: 2, stars: 2, rarity: 'BRONZE' }),
  makeInventoryItem({ id: 2, instanceId: 'b', name: 'Asuma', ovr: 85, plusLevel: 0, stars: 3, rarity: 'SILVER RARE' }),
  makeInventoryItem({ id: 3, instanceId: 'c', name: 'Bee', ovr: 92, plusLevel: 5, stars: 5, rarity: 'GOLD RARE' })
];

const renderedNames = () =>
  [...document.querySelectorAll('.inventory-card-meta h4')].map(el => el.textContent);

describe('Inventory', () => {
  it('renders an empty state when nothing is owned', () => {
    render(<Inventory inventory={[]} totalMasterCount={190} onSelectCard={vi.fn()} />);

    expect(screen.getByText(/Your inventory is empty!/)).toBeInTheDocument();
    expect(screen.getByText('Collection: 0 / 190 Shinobi Unlocked')).toBeInTheDocument();
  });

  it('treats a missing inventory as empty', () => {
    render(<Inventory inventory={undefined} totalMasterCount={190} onSelectCard={vi.fn()} />);

    expect(screen.getByText(/Your inventory is empty!/)).toBeInTheDocument();
    expect(screen.getByText('Collection: 0 / 190 Shinobi Unlocked')).toBeInTheDocument();
  });

  it('renders owned cards with meta info and the owned count', () => {
    render(<Inventory inventory={items} totalMasterCount={190} onSelectCard={vi.fn()} />);

    expect(screen.getByText('Collection: 3 / 190 Shinobi Unlocked')).toBeInTheDocument();
    expect(screen.getByText('92 OVR · 5-Star GOLD RARE')).toBeInTheDocument();
    expect([...document.querySelectorAll('.meta-plus')].map(el => el.textContent)).toEqual(['+5', '+2']);
  });

  it('hides the plus badge for un-upgraded cards', () => {
    render(<Inventory inventory={[items[1]]} totalMasterCount={190} onSelectCard={vi.fn()} />);
    expect(document.querySelector('.meta-plus')).toBeNull();
  });

  it('sorts by plus level descending by default', () => {
    render(<Inventory inventory={items} totalMasterCount={190} onSelectCard={vi.fn()} />);
    expect(renderedNames()).toEqual(['Bee', 'Choji', 'Asuma']);
  });

  it('toggles the plus level sort direction on repeated clicks', async () => {
    render(<Inventory inventory={items} totalMasterCount={190} onSelectCard={vi.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: /Level/ }));
    expect(renderedNames()).toEqual(['Asuma', 'Choji', 'Bee']);
    expect(screen.getByRole('button', { name: 'Level ↑' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Level/ }));
    expect(renderedNames()).toEqual(['Bee', 'Choji', 'Asuma']);
  });

  it('sorts by ovr descending first, then ascending', async () => {
    render(<Inventory inventory={items} totalMasterCount={190} onSelectCard={vi.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: /OVR/ }));
    expect(renderedNames()).toEqual(['Bee', 'Asuma', 'Choji']);

    await userEvent.click(screen.getByRole('button', { name: /OVR/ }));
    expect(renderedNames()).toEqual(['Choji', 'Asuma', 'Bee']);
  });

  it('sorts by name ascending first, then descending', async () => {
    render(<Inventory inventory={items} totalMasterCount={190} onSelectCard={vi.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: /Name/ }));
    expect(renderedNames()).toEqual(['Asuma', 'Bee', 'Choji']);

    await userEvent.click(screen.getByRole('button', { name: /Name/ }));
    expect(renderedNames()).toEqual(['Choji', 'Bee', 'Asuma']);
  });

  it('marks only the active sort button', async () => {
    render(<Inventory inventory={items} totalMasterCount={190} onSelectCard={vi.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: /OVR/ }));
    const active = [...document.querySelectorAll('.sort-btn.active')];

    expect(active).toHaveLength(1);
    expect(active[0].textContent).toContain('OVR');
  });

  it('treats a missing plus level as zero when sorting', () => {
    const withoutLevel = makeInventoryItem({ id: 4, instanceId: 'd', name: 'Ino', plusLevel: undefined });
    render(<Inventory inventory={[withoutLevel, items[0]]} totalMasterCount={190} onSelectCard={vi.fn()} />);

    expect(renderedNames()).toEqual(['Choji', 'Ino']);
  });

  it('does not mutate the inventory prop while sorting', async () => {
    const original = [...items];
    render(<Inventory inventory={items} totalMasterCount={190} onSelectCard={vi.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: /Name/ }));

    expect(items).toEqual(original);
  });

  it('selects the clicked inventory card', async () => {
    const onSelectCard = vi.fn();
    render(<Inventory inventory={items} totalMasterCount={190} onSelectCard={onSelectCard} />);

    await userEvent.click(document.querySelectorAll('.inventory-card-wrapper')[0]);

    expect(onSelectCard).toHaveBeenCalledWith(items[2]);
  });
});
