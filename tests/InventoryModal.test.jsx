import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InventoryModal from '../src/components/InventoryModal.jsx';
import { makeInventoryItem } from './fixtures.js';

const item = makeInventoryItem({ name: 'Neji', instanceId: 'neji-1' });

function renderModal(props = {}) {
  const onClose = vi.fn();
  const onSelectCard = vi.fn();
  const utils = render(
    <InventoryModal
      isOpen
      onClose={onClose}
      inventory={[item]}
      totalMasterCount={190}
      onSelectCard={onSelectCard}
      {...props}
    />
  );
  return { ...utils, onClose, onSelectCard };
}

describe('InventoryModal', () => {
  it('renders nothing while closed', () => {
    const { container } = render(
      <InventoryModal isOpen={false} onClose={vi.fn()} inventory={[item]} totalMasterCount={190} onSelectCard={vi.fn()} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the inventory section when open', () => {
    renderModal();

    expect(screen.getByText('Your Shinobi Inventory')).toBeInTheDocument();
    expect(screen.getByText('Collection: 1 / 190 Shinobi Unlocked')).toBeInTheDocument();
    expect(document.querySelector('.inventory-card-meta h4')).toHaveTextContent('Neji');
  });

  it('closes from the close button', async () => {
    const { onClose } = renderModal();

    await userEvent.click(screen.getByTitle('Close Inventory (ESC)'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes on backdrop click only', async () => {
    const { onClose, container } = renderModal();

    await userEvent.click(container.querySelector('.modal-panel'));
    expect(onClose).not.toHaveBeenCalled();

    await userEvent.click(container.querySelector('.modal-backdrop'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes on Escape while open', async () => {
    const { onClose } = renderModal();

    await userEvent.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('ignores Escape while closed', async () => {
    const onClose = vi.fn();
    render(
      <InventoryModal isOpen={false} onClose={onClose} inventory={[item]} totalMasterCount={190} onSelectCard={vi.fn()} />
    );

    await userEvent.keyboard('{Escape}');

    expect(onClose).not.toHaveBeenCalled();
  });

  it('stops listening for Escape after unmount', async () => {
    const { onClose, unmount } = renderModal();

    unmount();
    await userEvent.keyboard('{Escape}');

    expect(onClose).not.toHaveBeenCalled();
  });

  it('forwards card selection', async () => {
    const { onSelectCard } = renderModal();

    await userEvent.click(document.querySelector('.inventory-card-wrapper'));

    expect(onSelectCard).toHaveBeenCalledWith(item);
  });
});
