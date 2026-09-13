import React, { useState, useEffect, useRef } from 'react';
import './RightPanel.css';
import QuickStats from './QuickStats.jsx';
import DailyBonus from './DailyBonus.jsx';
import AudioControls from './AudioControls.jsx';
import SettingsButton from './SettingsButton.jsx';

export default function RightPanel({ inventory = [], allCards = [], audio, onOpenSettings, onClaimDaily }) {
  // Default selalu collapsed saat pertama load — user harus klik toggle untuk membukanya
  const [isOpen, setIsOpen] = useState(false);

  // Refleksikan status buka/tutup ke layout grid induk (.app)
  const panelRef = useRef(null);
  useEffect(() => {
    const appEl = panelRef.current?.closest('.app');
    if (appEl) appEl.classList.toggle('panel-collapsed', !isOpen);
  }, [isOpen]);

  return (
    <aside ref={panelRef} className={`right-panel ${isOpen ? '' : 'collapsed'}`}>
      <button
        type="button"
        className={`right-panel-toggle ${isOpen ? '' : 'collapsed'}`}
        onClick={() => setIsOpen(prev => !prev)}
        aria-label={isOpen ? 'Hide utilities panel' : 'Show utilities panel'}
        title={isOpen ? 'Hide utilities panel' : 'Show utilities panel'}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <div className="right-panel-content">
        <div className="right-panel-header">
          <span className="right-panel-title">Utilities</span>
        </div>

        <QuickStats inventory={inventory} allCards={allCards} />

        <DailyBonus onClaim={onClaimDaily} />

        <AudioControls audio={audio} />

        <SettingsButton onClick={onOpenSettings} />
      </div>
    </aside>
  );
}