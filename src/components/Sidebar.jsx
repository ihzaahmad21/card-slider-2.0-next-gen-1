import React, { useState, useEffect, useRef } from 'react';
import './Sidebar.css';
import logoImg from '/images/case/logo.png'; // Atau logo.webp

export default function Sidebar({ activeView, setActiveView }) {
  const [isOpen, setIsOpen] = useState(false);
  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 11l9-8 9 8" />
          <path d="M5 10v10h14V10" />
        </svg>
      )
    },
    {
      id: 'gacha',
      label: 'Gacha / Shop',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 8V6a6 6 0 1112 0v2" />
          <rect x="4" y="8" width="16" height="13" rx="2" />
        </svg>
      )
    },
    {
      id: 'inventory',
      label: 'Inventory',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="7" width="18" height="14" rx="2" />
          <path d="M8 7V5a4 4 0 018 0v2" />
        </svg>
      )
    },
    {
      id: 'showcase',
      label: 'Showcase',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z" />
        </svg>
      )
    },
    {
      id: 'codex',
      label: 'Codex',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      )
    },
    {
      id: 'lore',
      label: 'Character Codex',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    },
    {
      id: 'market',
      label: 'Market',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
      )
    },
    {
      id: 'deck',
      label: 'Deck Builder',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <line x1="9" y1="3" x2="9" y2="21" />
        </svg>
      )
    },
    {
      id: 'battle',
      label: 'Battle Arena',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14.5 17.5L3 6V3h3l11.5 11.5" />
          <path d="M13 19l6 2 2-2-2-6" />
          <path d="M9.5 6.5L21 18v3h-3L6.5 9.5" />
          <path d="M11 5L5 3 3 5l2 6" />
        </svg>
      )
    },
    {
      id: 'utilities',
      label: 'Utilities',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      )
    },
    {
      id: 'patchnotes',
      label: 'Patch Notes',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 4h16v16H4z" />
          <path d="M8 9h8M8 13h8M8 17h5" />
        </svg>
      )
    }
  ];

  const toggle = () => setIsOpen(prev => !prev);

  // Refleksikan status buka/tutup ke layout grid induk (.app)
  const asideRef = useRef(null);
  useEffect(() => {
    const appEl = asideRef.current?.closest('.app');
    if (appEl) appEl.classList.toggle('sidebar-collapsed', !isOpen);
  }, [isOpen]);

  return (
    <aside ref={asideRef} className={`sidebar ${isOpen ? '' : 'collapsed'}`}>
      <div className="brand">
        <img
          src={logoImg}
          alt="Shinobi TCG Logo"
          style={{ width: '36px', height: '36px', objectFit: 'contain' }}
        />
        <div className="brand-text">
          <span className="k1">CARD GAME GACHA</span>
          <span className="k2">SHINOBI TCG</span>
        </div>
      </div>

      <nav className="nav">
        {navItems.map(item => (
          <button
            key={item.id}
            type="button"
            className={`nav-item ${activeView === item.id ? 'active' : ''}`}
            onClick={() => setActiveView(item.id)}
          >
            {item.icon}
            <span className="label">{item.label}</span>
          </button>
        ))}
      </nav>

      <button
        type="button"
        className={`sidebar-toggle ${isOpen ? '' : 'collapsed'}`}
        onClick={toggle}
        aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        title={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 19l-7-7 7-7" />
        </svg>
        <span className="label">Collapse</span>
      </button>
    </aside>
  );
}