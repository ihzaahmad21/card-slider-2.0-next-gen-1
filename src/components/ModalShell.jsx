import React from 'react';
import useEscapeKey from '../hooks/useEscapeKey.js';
import { createBackdropClickHandler } from '../utils/modal.js';

// Shared backdrop + panel + close button used by the fullscreen feature modals
export default function ModalShell({ isOpen, onClose, closeTitle, panelClassName = '', children }) {
  useEscapeKey(onClose, isOpen);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={createBackdropClickHandler(onClose)}>
      <div className={`modal-panel ${panelClassName}`.trim()}>
        <button className="modal-close-btn" onClick={onClose} title={closeTitle}>
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}
