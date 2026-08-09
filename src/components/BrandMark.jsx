import React from 'react';

export default function BrandMark({ onClick }) {
  return (
    <div className="nav-brand" onClick={onClick}>
      <div className="brand-icon">忍</div>
      <div className="brand-text">SHINOBI<span>TCG</span></div>
    </div>
  );
}
