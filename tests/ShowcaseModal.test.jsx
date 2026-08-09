import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ShowcaseModal from '../src/components/ShowcaseModal.jsx';
import { makeCard } from './fixtures.js';

const RARITIES = ['gold', 'silver', 'bronze'];

const cards = Array.from({ length: 30 }, (_, i) =>
  makeCard({
    id: i + 1,
    name: `Ninja ${i + 1}`,
    rarityClass: RARITIES[i % 3],
    rarity: RARITIES[i % 3].toUpperCase(),
    ovr: 60 + i
  })
);

const visibleNames = () => [...document.querySelectorAll('.card-meta-info h4')].map(el => el.textContent);

function renderModal(props = {}) {
  const onClose = vi.fn();
  const onSelectCard = vi.fn();
  const utils = render(
    <ShowcaseModal isOpen onClose={onClose} cards={cards} onSelectCard={onSelectCard} {...props} />
  );
  return { ...utils, onClose, onSelectCard };
}

describe('ShowcaseModal', () => {
  it('renders the first batch of 12 cards and a load more button', () => {
    renderModal();

    expect(visibleNames()).toHaveLength(12);
    expect(screen.getByRole('button', { name: 'Load More Cards (18 Remaining)' })).toBeInTheDocument();
  });

  it('shows the total card count on the all filter', () => {
    renderModal();
    expect(screen.getByRole('button', { name: 'ALL (30)' })).toBeInTheDocument();
  });

  it('loads another batch on demand and hides the button at the end', async () => {
    renderModal();

    await userEvent.click(screen.getByRole('button', { name: /Load More Cards/ }));
    expect(visibleNames()).toHaveLength(24);

    await userEvent.click(screen.getByRole('button', { name: /Load More Cards/ }));
    expect(visibleNames()).toHaveLength(30);
    expect(screen.queryByRole('button', { name: /Load More Cards/ })).toBeNull();
  });

  it.each(RARITIES)('filters by %s rarity', async (rarity) => {
    renderModal();

    await userEvent.click(document.querySelector(`[data-filter="${rarity}"]`));

    expect(visibleNames()).toHaveLength(10);
    expect(document.querySelectorAll(`.card-container.${rarity}-tier`)).toHaveLength(10);
    expect(document.querySelector(`[data-filter="${rarity}"]`).className).toContain('active');
  });

  it('resets pagination when the filter changes', async () => {
    renderModal();

    await userEvent.click(screen.getByRole('button', { name: /Load More Cards/ }));
    expect(visibleNames()).toHaveLength(24);

    await userEvent.click(document.querySelector('[data-filter="all"]'));
    expect(visibleNames()).toHaveLength(12);
  });

  it('renders card meta info', () => {
    renderModal({ cards: [makeCard({ name: 'Bee', ovr: 92, stars: 5, rarity: 'GOLD RARE' })] });

    expect(screen.getByText('92 OVR · 5-Star GOLD RARE')).toBeInTheDocument();
  });

  it('handles an empty card list', () => {
    renderModal({ cards: [] });

    expect(visibleNames()).toEqual([]);
    expect(screen.getByRole('button', { name: 'ALL (0)' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Load More Cards/ })).toBeNull();
  });

  it('selects the clicked card', async () => {
    const { onSelectCard } = renderModal();

    await userEvent.click(document.querySelectorAll('.card-container')[0]);

    expect(onSelectCard).toHaveBeenCalledWith(cards[0]);
  });

  it('closes from the close button, the backdrop and Escape', async () => {
    const { onClose, container } = renderModal();

    await userEvent.click(screen.getByTitle('Close Showcase (ESC)'));
    await userEvent.click(container.querySelector('.showcase-modal-overlay'));
    await userEvent.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalledTimes(3);
  });

  it('does not close when the modal content is clicked', async () => {
    const { onClose, container } = renderModal();

    await userEvent.click(container.querySelector('.showcase-modal-content'));

    expect(onClose).not.toHaveBeenCalled();
  });

  it('ignores Escape while closed', async () => {
    const onClose = vi.fn();
    render(<ShowcaseModal isOpen={false} onClose={onClose} cards={cards} onSelectCard={vi.fn()} />);

    await userEvent.keyboard('{Escape}');

    expect(onClose).not.toHaveBeenCalled();
  });
});
