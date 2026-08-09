import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Storm4Modal from '../src/components/Storm4Modal.jsx';
import { makeCard, makeInventoryItem } from './fixtures.js';

const card = makeCard({ img: '/images/naruto.webp' });

function renderModal(props = {}) {
  const handlers = {
    onClose: vi.fn(),
    onUpgrade: vi.fn(),
    onSell: vi.fn()
  };
  const utils = render(
    <Storm4Modal card={card} inventory={[]} coins={5000} {...handlers} {...props} />
  );
  return { ...utils, ...handlers };
}

const materialOptions = () =>
  [...document.querySelectorAll('#refine-material option')].map(o => o.textContent);

describe('Storm4Modal', () => {
  it('renders the card identity, jutsu and stats', () => {
    renderModal();

    expect(screen.getByText('Naruto Uzumaki')).toBeInTheDocument();
    expect(screen.getByText('90')).toBeInTheDocument();
    expect(screen.getByText('Rasengan')).toBeInTheDocument();
    expect([...document.querySelectorAll('.storm4-stat-value')].map(el => el.textContent)).toEqual(['92', '80', '85']);
  });

  it('falls back to a default jutsu label', () => {
    renderModal({ card: makeCard({ jutsu: undefined }) });
    expect(screen.getByText('Secret Ninja Art')).toBeInTheDocument();
  });

  it('loads the HD artwork variant and falls back to the thumbnail on error', () => {
    renderModal();
    const img = screen.getByAltText('Naruto Uzumaki');

    expect(img).toHaveAttribute('src', '/images/HD/naruto.png');

    fireEvent.error(img);

    expect(screen.getByAltText('Naruto Uzumaki')).toHaveAttribute('src', '/images/naruto.webp');
  });

  it('reveals the artwork once loaded', () => {
    renderModal();
    const img = screen.getByAltText('Naruto Uzumaki');

    expect(document.querySelector('.storm4-img-shimmer')).toBeInTheDocument();

    fireEvent.load(img);

    expect(document.querySelector('.storm4-img-shimmer')).toBeNull();
    expect(screen.getByAltText('Naruto Uzumaki').className).toContain('storm4-img-visible');
  });

  it('reloads the HD artwork when a different card is shown', () => {
    const { rerender } = renderModal();

    rerender(
      <Storm4Modal
        card={makeCard({ id: 2, name: 'Sasuke', img: '/images/sasuke.webp' })}
        inventory={[]}
        coins={0}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByAltText('Sasuke')).toHaveAttribute('src', '/images/HD/sasuke.png');
  });

  it.each([
    ['gold', 'GOLD RARE'],
    ['silver', 'SILVER RARE'],
    ['bronze', 'BRONZE'],
    [undefined, 'BRONZE']
  ])('watermarks %s cards', (rarityClass, watermark) => {
    renderModal({ card: makeCard({ rarityClass }) });
    expect(document.querySelector('.storm4-rarity-watermark').textContent).toBe(watermark);
  });

  it('prompts to roll gacha for unowned cards', () => {
    renderModal();

    expect(screen.getByText('Roll in Gacha to unlock this card!')).toBeInTheDocument();
    expect(screen.queryByText('Ninja Upgrade')).toBeNull();
    expect(document.querySelector('.storm4-btn-sell')).toBeNull();
  });

  it('shows owned stats from the inventory entry rather than the master card', () => {
    const owned = makeInventoryItem({ instanceId: 'inst-a', plusLevel: 3, ovr: 93, atk: 95, def: 83, chk: 88, stars: 5 });
    renderModal({ card, inventory: [owned] });

    expect(screen.getByText('+3')).toBeInTheDocument();
    expect(screen.getByText('93')).toBeInTheDocument();
    expect(screen.getByText('Target: +4')).toBeInTheDocument();
    expect(screen.getByText('800C + 1 Duplicate')).toBeInTheDocument();
  });

  it('renders the star rating with empty stars', () => {
    renderModal({ card: makeCard({ stars: 3 }) });
    expect(document.querySelector('.storm4-stars').textContent).toBe('★★★☆☆');
  });

  it('matches the inventory entry by instanceId when the card has one', () => {
    const selected = makeInventoryItem({ instanceId: 'inst-b', plusLevel: 2 });
    const other = makeInventoryItem({ instanceId: 'inst-a', plusLevel: 7 });
    renderModal({ card: selected, inventory: [other, selected] });

    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  it('lists duplicates of the same card as upgrade materials, excluding the main instance', () => {
    const main = makeInventoryItem({ instanceId: 'inst-a' });
    const dupe = makeInventoryItem({ instanceId: 'inst-b', plusLevel: 1 });
    const otherCard = makeInventoryItem({ id: 99, instanceId: 'inst-c', name: 'Sakura' });
    renderModal({ card: main, inventory: [main, dupe, otherCard] });

    expect(screen.getByText('Duplicates Available: 1')).toBeInTheDocument();
    expect(materialOptions()).toEqual(['Naruto Uzumaki +1 (OVR 90)']);
  });

  it('disables the upgrade button without duplicates', () => {
    const main = makeInventoryItem({ instanceId: 'inst-a' });
    renderModal({ card: main, inventory: [main] });

    expect(materialOptions()).toEqual(['No duplicates available']);
    expect(document.querySelector('.storm4-btn-upgrade')).toBeDisabled();
  });

  it('disables the upgrade button when coins are short', () => {
    const main = makeInventoryItem({ instanceId: 'inst-a' });
    const dupe = makeInventoryItem({ instanceId: 'inst-b' });
    renderModal({ card: main, inventory: [main, dupe], coins: 100 });

    expect(document.querySelector('.storm4-btn-upgrade')).toBeDisabled();
  });

  it('shows MAX +10 and disables upgrading a fully refined card', () => {
    const main = makeInventoryItem({ instanceId: 'inst-a', plusLevel: 10 });
    const dupe = makeInventoryItem({ instanceId: 'inst-b' });
    renderModal({ card: main, inventory: [main, dupe] });

    const button = document.querySelector('.storm4-btn-upgrade');
    expect(button).toHaveTextContent('MAX +10');
    expect(button).toBeDisabled();
  });

  it('upgrades with the auto-selected first duplicate', async () => {
    const main = makeInventoryItem({ instanceId: 'inst-a' });
    const dupe = makeInventoryItem({ instanceId: 'inst-b' });
    const { onUpgrade } = renderModal({ card: main, inventory: [main, dupe] });

    await userEvent.click(document.querySelector('.storm4-btn-upgrade'));

    expect(onUpgrade).toHaveBeenCalledWith(main, dupe);
  });

  it('upgrades with an explicitly selected duplicate', async () => {
    const main = makeInventoryItem({ instanceId: 'inst-a' });
    const dupeB = makeInventoryItem({ instanceId: 'inst-b' });
    const dupeC = makeInventoryItem({ instanceId: 'inst-c', plusLevel: 4 });
    const { onUpgrade } = renderModal({ card: main, inventory: [main, dupeB, dupeC] });

    await userEvent.selectOptions(screen.getByLabelText('Select Material Card'), 'inst-c');
    await userEvent.click(document.querySelector('.storm4-btn-upgrade'));

    expect(onUpgrade).toHaveBeenCalledWith(main, dupeC);
  });

  it.each([
    ['gold', 400],
    ['silver', 150],
    ['bronze', 30]
  ])('prices %s sells at %i coins', (rarityClass, value) => {
    const main = makeInventoryItem({ instanceId: 'inst-a', rarityClass });
    renderModal({ card: main, inventory: [main] });

    expect(document.querySelector('.storm4-btn-sell')).toHaveTextContent(`SELL +${value}C`);
  });

  it('sells the owned instance', async () => {
    const main = makeInventoryItem({ instanceId: 'inst-a' });
    const { onSell } = renderModal({ card: main, inventory: [main] });

    await userEvent.click(document.querySelector('.storm4-btn-sell'));

    expect(onSell).toHaveBeenCalledWith('inst-a');
  });

  it('closes from the header button, the CLOSE button, the backdrop and Escape', async () => {
    const { onClose, container } = renderModal();

    await userEvent.click(screen.getByTitle('Close (ESC)'));
    await userEvent.click(screen.getByRole('button', { name: 'CLOSE' }));
    await userEvent.click(container.querySelector('.storm4-modal-overlay'));
    await userEvent.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalledTimes(4);
  });

  it('does not close when the panel itself is clicked', async () => {
    const { onClose, container } = renderModal();

    await userEvent.click(container.querySelector('.storm4-split-container'));

    expect(onClose).not.toHaveBeenCalled();
  });

  it('stops listening for Escape after unmount', async () => {
    const { onClose, unmount } = renderModal();

    unmount();
    await userEvent.keyboard('{Escape}');

    expect(onClose).not.toHaveBeenCalled();
  });

  it('tolerates a missing inventory', () => {
    renderModal({ inventory: undefined });

    expect(screen.getByText('Roll in Gacha to unlock this card!')).toBeInTheDocument();
  });
});
