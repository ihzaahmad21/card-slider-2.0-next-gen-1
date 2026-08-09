import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Navbar from '../src/components/Navbar.jsx';

describe('Navbar', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('renders a localised coin balance', () => {
    render(<Navbar coins={12345} />);
    expect(screen.getByText('12,345 COINS')).toBeInTheDocument();
  });

  it('opens the showcase, inventory and shop', async () => {
    const onOpenShowcase = vi.fn();
    const onOpenInventory = vi.fn();
    const onOpenShop = vi.fn();

    render(
      <Navbar
        coins={0}
        onOpenShowcase={onOpenShowcase}
        onOpenInventory={onOpenInventory}
        onOpenShop={onOpenShop}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: 'Showcase Modal' }));
    await userEvent.click(screen.getByRole('button', { name: 'Inventory' }));
    await userEvent.click(screen.getByRole('button', { name: 'Shop' }));

    expect(onOpenShowcase).toHaveBeenCalledTimes(1);
    expect(onOpenInventory).toHaveBeenCalledTimes(1);
    expect(onOpenShop).toHaveBeenCalledTimes(1);
  });

  it('scrolls to the home section when it exists', async () => {
    const home = document.createElement('div');
    home.id = 'home';
    home.scrollIntoView = vi.fn();
    document.body.appendChild(home);

    render(<Navbar coins={0} />);
    await userEvent.click(screen.getByRole('button', { name: 'Home' }));

    expect(home.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
  });

  it('does not throw when the target section is missing', async () => {
    render(<Navbar coins={0} />);

    await userEvent.click(screen.getByRole('button', { name: 'Home' }));
    await userEvent.click(document.querySelector('.nav-brand'));

    expect(screen.getByRole('button', { name: 'Home' })).toBeInTheDocument();
  });
});
