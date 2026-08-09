import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GachaResultModal from '../src/components/GachaResultModal.jsx';
import { makeCard } from './fixtures.js';

function renderModal(props = {}) {
  const handlers = {
    onKeep: vi.fn(),
    onQuickSell: vi.fn(),
    onClose: vi.fn(),
    onSelectCard: vi.fn(),
    ...props
  };
  const utils = render(<GachaResultModal results={[makeCard()]} {...handlers} />);
  return { ...utils, ...handlers };
}

describe('GachaResultModal', () => {
  it('renders nothing without results', () => {
    const { container: noResults } = render(<GachaResultModal results={null} />);
    const { container: emptyResults } = render(<GachaResultModal results={[]} />);

    expect(noResults).toBeEmptyDOMElement();
    expect(emptyResults).toBeEmptyDOMElement();
  });

  it('renders one card per result with a singular label', () => {
    renderModal();

    expect(screen.getByText('Pack Opened!')).toBeInTheDocument();
    expect(screen.getByText('1 Card Revealed')).toBeInTheDocument();
    expect(screen.getAllByText('Naruto Uzumaki')).toHaveLength(1);
  });

  it('pluralises the label and renders every card for multi pulls', () => {
    render(
      <GachaResultModal
        results={[makeCard({ id: 1 }), makeCard({ id: 2, name: 'Sasuke' }), makeCard({ id: 3, name: 'Sakura' })]}
      />
    );

    expect(screen.getByText('3 Cards Revealed')).toBeInTheDocument();
    expect(screen.getByText('Sasuke')).toBeInTheDocument();
    expect(screen.getByText('Sakura')).toBeInTheDocument();
  });

  it('tags the reveal with the first result rarity, defaulting to gold', () => {
    const { container: silver } = render(<GachaResultModal results={[makeCard({ rarityClass: 'silver' })]} />);
    const { container: unknown } = render(<GachaResultModal results={[makeCard({ rarityClass: undefined })]} />);

    expect(silver.querySelector('.reveal-tier-tag').className).toContain('silver-tag');
    expect(unknown.querySelector('.reveal-tier-tag').className).toContain('gold-tag');
  });

  it('calls onKeep and onQuickSell from the action buttons', async () => {
    const { onKeep, onQuickSell } = renderModal();

    await userEvent.click(screen.getByRole('button', { name: 'KEEP CARD(S)' }));
    await userEvent.click(screen.getByRole('button', { name: 'QUICK SELL' }));

    expect(onKeep).toHaveBeenCalledTimes(1);
    expect(onQuickSell).toHaveBeenCalledTimes(1);
  });

  it('selects the clicked card', async () => {
    const card = makeCard();
    const onSelectCard = vi.fn();
    const { container } = render(<GachaResultModal results={[card]} onSelectCard={onSelectCard} />);

    await userEvent.click(container.querySelector('.card-container'));

    expect(onSelectCard).toHaveBeenCalledWith(card);
  });

  it('closes on backdrop click but not on content click', async () => {
    const { onClose, container } = renderModal();

    await userEvent.click(container.querySelector('.gacha-reveal-stage'));
    expect(onClose).not.toHaveBeenCalled();

    await userEvent.click(container.querySelector('.modal-overlay'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
