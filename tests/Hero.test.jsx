import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Hero from '../src/components/Hero.jsx';
import { makeCard } from './fixtures.js';

const golds = [
  makeCard({ id: 1, name: 'Gold A', ovr: 99, stars: 5 }),
  makeCard({ id: 2, name: 'Gold B', ovr: 95, stars: 5 }),
  makeCard({ id: 3, name: 'Gold C', ovr: 95, stars: 4 })
];

const previewName = () => document.querySelector('.hero-card-stage .card-title').textContent;

const heroStat = (label) =>
  [...document.querySelectorAll('.stat-item')].find(el => el.textContent.includes(label)).querySelector('h4')
    .textContent;

const advanceCarousel = () => {
  act(() => {
    vi.advanceTimersByTime(4000);
  });
  act(() => {
    vi.advanceTimersByTime(300);
  });
};

afterEach(() => {
  vi.useRealTimers();
});

describe('Hero', () => {
  it('renders the card count and static stats', () => {
    render(<Hero cards={golds} onSelectCard={vi.fn()} />);

    expect(heroStat('Ninja Cards')).toBe('3');
    expect(heroStat('Pack Tiers')).toBe('3');
    expect(heroStat('Max OVR Power')).toBe('99');
  });

  it('renders a zero card count for an empty collection', () => {
    render(<Hero cards={[]} onSelectCard={vi.fn()} />);
    expect(heroStat('Ninja Cards')).toBe('0');
  });

  it('previews gold cards sorted by ovr then stars', () => {
    render(<Hero cards={[...golds].reverse()} onSelectCard={vi.fn()} />);
    expect(previewName()).toBe('Gold A');
  });

  it('falls back to the six highest ovr cards when no golds qualify', () => {
    const bronzes = Array.from({ length: 8 }, (_, i) =>
      makeCard({ id: i + 1, name: `Bronze ${i + 1}`, rarity: 'BRONZE', rarityClass: 'bronze', ovr: 60 + i, stars: 1 })
    );

    render(<Hero cards={bronzes} onSelectCard={vi.fn()} />);

    expect(previewName()).toBe('Bronze 8');
  });

  it('includes non-gold cards rated 90 or above in the carousel', () => {
    const strongSilver = makeCard({ id: 9, name: 'Strong Silver', rarity: 'SILVER RARE', ovr: 90, stars: 4 });
    const weakSilver = makeCard({ id: 10, name: 'Weak Silver', rarity: 'SILVER RARE', ovr: 70, stars: 2 });
    render(<Hero cards={[weakSilver, strongSilver]} onSelectCard={vi.fn()} />);

    expect(previewName()).toBe('Strong Silver');
  });

  it('renders no preview card for an empty card list', () => {
    render(<Hero cards={[]} onSelectCard={vi.fn()} />);
    expect(document.querySelector('.hero-card-stage .card-title')).toBeNull();
  });

  it('rotates the preview card and wraps around', () => {
    vi.useFakeTimers();
    render(<Hero cards={golds} onSelectCard={vi.fn()} />);

    advanceCarousel();
    expect(previewName()).toBe('Gold B');

    advanceCarousel();
    expect(previewName()).toBe('Gold C');

    advanceCarousel();
    expect(previewName()).toBe('Gold A');
  });

  it('applies the fade class mid-transition', () => {
    vi.useFakeTimers();
    render(<Hero cards={golds} onSelectCard={vi.fn()} />);

    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(document.querySelector('.hero-card-stage').className).toContain('hero-carousel-fade');

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(document.querySelector('.hero-card-stage').className).not.toContain('hero-carousel-fade');
  });

  it('pauses rotation while hovered and resumes on leave', () => {
    vi.useFakeTimers();
    render(<Hero cards={golds} onSelectCard={vi.fn()} />);
    const stage = document.querySelector('.hero-card-stage');

    fireEvent.mouseEnter(stage);
    advanceCarousel();
    expect(previewName()).toBe('Gold A');

    fireEvent.mouseLeave(stage);
    advanceCarousel();
    expect(previewName()).toBe('Gold B');
  });

  it('selects the previewed card when the stage is clicked', async () => {
    const onSelectCard = vi.fn();
    render(<Hero cards={golds} onSelectCard={onSelectCard} />);

    await userEvent.click(document.querySelector('.hero-card-stage'));

    expect(onSelectCard).toHaveBeenCalledWith(golds[0]);
  });

  it('opens the showcase and inventory from the hero buttons', async () => {
    const onOpenShowcase = vi.fn();
    const onOpenInventory = vi.fn();
    render(
      <Hero
        cards={golds}
        onSelectCard={vi.fn()}
        onOpenShowcase={onOpenShowcase}
        onOpenInventory={onOpenInventory}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: 'Showcase' }));
    await userEvent.click(screen.getByRole('button', { name: 'Inventory' }));

    expect(onOpenShowcase).toHaveBeenCalledTimes(1);
    expect(onOpenInventory).toHaveBeenCalledTimes(1);
  });

  it('opens the shop modal when a handler is provided', async () => {
    const onOpenShop = vi.fn();
    render(<Hero cards={golds} onSelectCard={vi.fn()} onOpenShop={onOpenShop} />);

    await userEvent.click(screen.getByRole('button', { name: 'Gacha Now' }));

    expect(onOpenShop).toHaveBeenCalledTimes(1);
  });

  it('scrolls to the gacha section when no shop handler is provided', async () => {
    const gacha = document.createElement('div');
    gacha.id = 'gacha';
    gacha.scrollIntoView = vi.fn();
    document.body.appendChild(gacha);

    render(<Hero cards={golds} onSelectCard={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: 'Gacha Now' }));

    expect(gacha.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
    gacha.remove();
  });

  it('does not throw when neither a shop handler nor a gacha section exists', async () => {
    render(<Hero cards={golds} onSelectCard={vi.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: 'Gacha Now' }));

    expect(screen.getByRole('button', { name: 'Gacha Now' })).toBeInTheDocument();
  });
});
