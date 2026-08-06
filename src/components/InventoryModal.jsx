import React, { useEffect } from 'react';
import Inventory from './Inventory.jsx';

export default function InventoryModal({ isOpen, onClose, inventory, totalMasterCount, onSelectCard }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleCardClick = (card) => {
    onSelectCard(card);
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-panel">
        <button className="modal-close-btn" onClick={onClose} title="Close Inventory (ESC)">
          ✕
        </button>
        <Inventory
          inventory={inventory}
          totalMasterCount={totalMasterCount}
          onSelectCard={handleCardClick}
        />
      </div>
    </div>
  );
}
