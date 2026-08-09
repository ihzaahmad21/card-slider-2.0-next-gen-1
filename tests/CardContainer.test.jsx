import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CardContainer from '../src/components/CardContainer.jsx';
import { makeCard } from './fixtures.js';

const FALLBACK_IMAGE = '/images/naruto__part_1__by_masonengine_daim8u2.png';

describe('CardContainer', () => {
  it('renders nothing without a card', () => {
    const { container } = render(<CardContainer card={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the card identity, jutsu, summon and rarity', () => {
    render(<CardContainer card={makeCard()} />);

    expect(screen.getByText('Naruto Uzumaki')).toBeInTheDocument();
    expect(screen.getByText('90 OVR')).toBeInTheDocument();
    expect(screen.getByText('Rasengan')).toBeInTheDocument();
    expect(screen.getByText('Summon: Nine-Tails Kurama')).toBeInTheDocument();
    expect(screen.getByText('GOLD RARE')).toBeInTheDocument();
  });

  it('falls back to defaults for missing jutsu and summon', () => {
    render(<CardContainer card={makeCard({ jutsu: undefined, summon: undefined })} />);

    expect(screen.getByText('Secret Ninja Art')).toBeInTheDocument();
    expect(screen.getByText('Summon: None')).toBeInTheDocument();
  });

  it.each([
    [5, '★ ★ ★ ★ ★ '],
    [3, '★ ★ ★ ☆ ☆ '],
    [1, '★ ☆ ☆ ☆ ☆ '],
    [undefined, '★ ☆ ☆ ☆ ☆ '],
    [7, '★ ★ ★ ★ ★ ★ ★ ']
  ])('renders %s stars as a filled/empty rating string', (stars, expected) => {
    const { container } = render(<CardContainer card={makeCard({ stars })} />);
    expect(container.querySelector('.stars-rating').textContent).toBe(expected);
  });

  it('applies the rarity tier class, defaulting to bronze', () => {
    const { container: gold } = render(<CardContainer card={makeCard({ rarityClass: 'gold' })} />);
    const { container: unknown } = render(<CardContainer card={makeCard({ rarityClass: undefined })} />);

    expect(gold.querySelector('.card-container').className).toContain('gold-tier');
    expect(unknown.querySelector('.card-container').className).toContain('bronze-tier');
  });

  it('appends the extra className', () => {
    const { container } = render(<CardContainer card={makeCard()} className="modal-card-animate" />);
    expect(container.querySelector('.card-container').className).toContain('modal-card-animate');
  });

  it('shows a plus badge only above +0 and marks +10 as max', () => {
    const { container: plain } = render(<CardContainer card={makeCard({ plusLevel: 0 })} />);
    expect(plain.querySelector('.plus-badge')).toBeNull();

    const { container: upgraded } = render(<CardContainer card={makeCard({ plusLevel: 3 })} />);
    const badge = upgraded.querySelector('.plus-badge');
    expect(badge).toHaveTextContent('+3');
    expect(badge.className).not.toContain('plus-badge-max');

    const { container: maxed } = render(<CardContainer card={makeCard({ plusLevel: 10 })} />);
    expect(maxed.querySelector('.plus-badge').className).toContain('plus-badge-max');
  });

  it('ignores negative plus levels', () => {
    const { container } = render(<CardContainer card={makeCard({ plusLevel: -4 })} />);
    expect(container.querySelector('.plus-badge')).toBeNull();
  });

  it('renders stat bars from the card stats and defaults missing ones to 50%', () => {
    const { container } = render(
      <CardContainer card={makeCard({ atk: 92, def: undefined, chk: undefined })} />
    );
    const widths = [...container.querySelectorAll('.stat-fill')].map(el => el.style.width);

    expect(widths).toEqual(['92%', '50%', '50%']);
  });

  it('uses the fallback image when the card has no image', () => {
    render(<CardContainer card={makeCard({ img: '' })} />);
    expect(screen.getByAltText('Naruto Uzumaki')).toHaveAttribute('src', FALLBACK_IMAGE);
  });

  it('swaps to the fallback image once and clears the error handler', () => {
    render(<CardContainer card={makeCard()} />);
    const img = screen.getByAltText('Naruto Uzumaki');

    img.dispatchEvent(new Event('error', { bubbles: true }));

    expect(img).toHaveAttribute('src', FALLBACK_IMAGE);
    expect(img.onerror).toBeNull();
  });

  it('forwards clicks', async () => {
    const onClick = vi.fn();
    const { container } = render(<CardContainer card={makeCard()} onClick={onClick} />);

    await userEvent.click(container.querySelector('.card-container'));

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
