import React from 'react';
import BrandMark from './BrandMark.jsx';

export default function Navbar({ coins, onOpenShowcase, onOpenInventory, onOpenShop }) {
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="navbar-wrapper">
      <nav className="navbar-capsule" id="navbar">
        <BrandMark onClick={() => scrollToSection('home')} />

        <ul className="nav-menu">
          {[
            { label: 'Home', onClick: () => scrollToSection('home') },
            { label: 'Showcase Modal', onClick: onOpenShowcase, active: true },
            { label: 'Inventory', onClick: onOpenInventory },
            { label: 'Shop', onClick: onOpenShop }
          ].map(({ label, onClick, active }) => (
            <li key={label}>
              <button className={`nav-link${active ? ' active' : ''}`} onClick={onClick}>
                {label}
              </button>
            </li>
          ))}
        </ul>

        <div className="nav-actions">
          <div className="user-coins-badge" title="Current Coin Balance">
            <span className="coin-icon">⚙</span>
            <span>{coins.toLocaleString()} COINS</span>
          </div>
        </div>
      </nav>
    </div>
  );
}
