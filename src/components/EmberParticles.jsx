import React, { useEffect, useRef } from 'react';
import './EmberParticles.css';

export default function EmberParticles({ count = 22 }) {
  const embersRef = useRef(null);

  useEffect(() => {
    const host = embersRef.current;
    if (!host) return;

    // Clear any existing children to prevent duplicates on strict mode remount
    host.innerHTML = '';

    const fragment = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
      const e = document.createElement('div');
      e.className = 'ember';
      e.style.left = Math.random() * 100 + '%';
      e.style.animationDuration = (6 + Math.random() * 8) + 's';
      e.style.animationDelay = (Math.random() * 8) + 's';
      e.style.opacity = (0.3 + Math.random() * 0.5);
      fragment.appendChild(e);
    }
    host.appendChild(fragment);

    return () => {
      if (host) host.innerHTML = '';
    };
  }, [count]);

  return (
    <>
      <div className="grain" />
      <div className="embers" ref={embersRef} />
    </>
  );
}
