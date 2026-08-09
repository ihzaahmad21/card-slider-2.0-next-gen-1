import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ShopModal from '../src/components/ShopModal.jsx';

function renderModal(props = {}) {
  const handlers = {
    onClose: vi.fn(),
    onOpenPack: vi.fn(),
    onBuyCoins: vi.fn(),
    onBuyBooster: vi.fn()
  };
  const utils = render(<ShopModal isOpen coins={1000} rateBoosters={3} {...handlers} {...props} />);
  return { ...utils, ...handlers };
}

describe('ShopModal', () => {
  it('renders nothing while closed', () => {
    const { container } = render(<ShopModal isOpen={false} onClose={vi.fn()} coins={0} rateBoosters={0} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the gacha shop when open', () => {
    renderModal();

    expect(screen.getByText('Open Booster Packs')).toBeInTheDocument();
    expect(screen.getByText('Shop & Multi-Pulls')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('closes from the close button', async () => {
    const { onClose } = renderModal();

    await userEvent.click(screen.getByTitle('Close Shop (ESC)'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes on backdrop click only', async () => {
    const { onClose, container } = renderModal();

    await userEvent.click(container.querySelector('.modal-panel-shop'));
    expect(onClose).not.toHaveBeenCalled();

    await userEvent.click(container.querySelector('.modal-backdrop'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes on Escape while open and ignores it while closed', async () => {
    const { onClose, unmount } = renderModal();
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
    unmount();

    const closedOnClose = vi.fn();
    render(<ShopModal isOpen={false} onClose={closedOnClose} coins={0} rateBoosters={0} />);
    await userEvent.keyboard('{Escape}');
    expect(closedOnClose).not.toHaveBeenCalled();
  });

  it('forwards shop actions to its handlers', async () => {
    const { onOpenPack, onBuyCoins, onBuyBooster } = renderModal();

    await userEvent.click(document.querySelector('.gold-pack .btn-pack-buy'));
    await userEvent.click(screen.getByRole('button', { name: 'Buy 1,500 Coins' }));
    await userEvent.click(screen.getByRole('button', { name: 'Unlock Booster' }));

    expect(onOpenPack).toHaveBeenCalledWith('gold', 1);
    expect(onBuyCoins).toHaveBeenCalledWith(1500);
    expect(onBuyBooster).toHaveBeenCalledTimes(1);
  });
});
