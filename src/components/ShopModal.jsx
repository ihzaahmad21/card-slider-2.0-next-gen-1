import React, { useEffect } from 'react';
import GachaShop from './GachaShop.jsx';

export default function ShopModal({
  isOpen,
  onClose,
  coins,
  rateBoosters,
  onOpenPack,
  onBuyCoins,
  onBuyBooster
}) {
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

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-panel modal-panel-shop">
        <button className="modal-close-btn" onClick={onClose} title="Close Shop (ESC)">
          ✕
        </button>
        <GachaShop
          coins={coins}
          rateBoosters={rateBoosters}
          onOpenPack={onOpenPack}
          onBuyCoins={onBuyCoins}
          onBuyBooster={onBuyBooster}
        />
      </div>
    </div>
  );
}
