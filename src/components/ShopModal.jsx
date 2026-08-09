import React from 'react';
import GachaShop from './GachaShop.jsx';
import ModalShell from './ModalShell.jsx';

export default function ShopModal({
  isOpen,
  onClose,
  coins,
  rateBoosters,
  onOpenPack,
  onBuyCoins,
  onBuyBooster
}) {
  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      closeTitle="Close Shop (ESC)"
      panelClassName="modal-panel-shop"
    >
      <GachaShop
        coins={coins}
        rateBoosters={rateBoosters}
        onOpenPack={onOpenPack}
        onBuyCoins={onBuyCoins}
        onBuyBooster={onBuyBooster}
      />
    </ModalShell>
  );
}
