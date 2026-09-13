import React, { useState, useEffect } from 'react';
import './Views.css';

export default function PatchNotesView() {
  const [timeLeft, setTimeLeft] = useState('07:21:33');

  useEffect(() => {
    let secondsLeft = 7 * 3600 + 21 * 60 + 33;
    const interval = setInterval(() => {
      if (secondsLeft <= 0) {
        clearInterval(interval);
        return;
      }
      secondsLeft--;
      const fmt = (n) => String(n).padStart(2, '0');
      const h = Math.floor(secondsLeft / 3600);
      const m = Math.floor((secondsLeft % 3600) / 60);
      const s = secondsLeft % 60;
      setTimeLeft(`${fmt(h)}:${fmt(m)}:${fmt(s)}`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="view active" id="view-patchnotes">
      <div className="section-heading">
        <h2>
          <span className="bar" /> News &amp; Patch Notes
        </h2>
      </div>

      <div className="promo-grid">
        <div className="promo-card notes">
          <span className="pill-tag">PATCH NOTES v2.1</span>
          <div className="promo-eyebrow">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#e2521f" strokeWidth="2">
              <path d="M14 4l6 6-11 11H3v-6z" />
            </svg>
            Patch Notes
          </div>
          <ul className="notes-list">
            <li>New legendary shinobi: chiyo reanimation</li>
            <li>New legendary shinobi: gaara kage summit</li>
          </ul>
          <a className="link-out" href="#">View full notes →</a>
        </div>

        <div className="promo-card event">
          <span className="pill-tag" style={{ alignSelf: 'center' }}>LIMITED EVENT</span>
          <svg className="kunai-icon" viewBox="0 0 64 64" fill="none">
            <path d="M32 4l4 20-4 4-4-4z" fill="#e2521f" />
            <path d="M32 60l-4-20 4-4 4 4z" fill="#e2521f" />
            <path d="M4 32l20-4 4 4-4 4z" fill="#e2521f" />
            <path d="M60 32l-20-4-4 4 4 4z" fill="#e2521f" />
            <circle cx="32" cy="32" r="6" fill="#f3e6c8" />
          </svg>
          <div className="event-title display">KUROGANE RATE-UP</div>
          <div className="event-sub">Featuring 3 new legendary shinobi</div>
          <div className="countdown">{timeLeft}</div>
        </div>

        <div className="promo-card community">
          <svg className="discord-icon" viewBox="0 0 24 24" fill="#4fd6c9">
            <path d="M20 6.5c-1.4-.7-2.9-1.1-4.4-1.4l-.2.4c1.3.3 2.5.8 3.6 1.5-2.2-1-4.6-1.5-7-1.5s-4.8.5-7 1.5c1.1-.7 2.3-1.2 3.6-1.5l-.2-.4C6.9 5.4 5.4 5.8 4 6.5 2 10 1.4 13.4 1.6 16.7c1.7 1.3 3.4 2 5 2.5l.6-1c-.9-.3-1.8-.8-2.6-1.3.2-.1.4-.3.6-.4 3.7 1.7 7.9 1.7 11.6 0 .2.1.4.3.6.4-.8.5-1.7 1-2.6 1.3l.6 1c1.6-.5 3.3-1.2 5-2.5.3-4-.7-7.4-2.4-10.2zM8.7 14.6c-.8 0-1.5-.8-1.5-1.7s.7-1.7 1.5-1.7 1.5.8 1.5 1.7-.7 1.7-1.5 1.7zm6.6 0c-.8 0-1.5-.8-1.5-1.7s.7-1.7 1.5-1.7 1.5.8 1.5 1.7-.7 1.7-1.5 1.7z" />
          </svg>
          <div className="community-title">Join the Community</div>
          <div className="community-sub">Join our official Discord and showcase your collection.</div>
        </div>
      </div>
    </section>
  );
}
