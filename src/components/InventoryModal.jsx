import React from 'react';
import Inventory from './Inventory.jsx';
import ModalShell from './ModalShell.jsx';

export default function InventoryModal({ isOpen, onClose, inventory, totalMasterCount, onSelectCard }) {
  return (
    <ModalShell isOpen={isOpen} onClose={onClose} closeTitle="Close Inventory (ESC)">
      <Inventory
        inventory={inventory}
        totalMasterCount={totalMasterCount}
        onSelectCard={onSelectCard}
      />
    </ModalShell>
  );
}
