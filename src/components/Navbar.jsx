import React from 'react';

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
        <div className="nav-brand" onClick={() => scrollToSection('home')}>
          <div className="brand-icon">忍</div>
          <div className="brand-text">SHINOBI<span>TCG</span></div>
        </div>

        <ul className="nav-menu">
          <li>
            <button className="nav-link" onClick={() => scrollToSection('home')}>
              Home
            </button>
          </li>
          <li>
            <button className="nav-link active" onClick={onOpenShowcase}>
              Showcase Modal
            </button>
          </li>
          <li>
            <button className="nav-link" onClick={onOpenInventory}>
              Inventory
            </button>
          </li>
          <li>
            <button className="nav-link" onClick={onOpenShop}>
              Shop
            </button>
          </li>
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
