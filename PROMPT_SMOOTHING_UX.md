# 🥷 Master UX/UI Polish: Pure CSS Smoothing & Animations

## Objective
Apply a complete layer of micro-interactions, modal animations, gacha card flips, and button feedback across the React application using pure CSS transition rules to ensure 0% breakage and 60 FPS performance.

---

## 1. Smooth Modal Open/Close (`Storm4Modal.jsx` & `ShowcaseModal.jsx`)
- Apply keyframe entry animations to the modal backdrop and modal box:
  ```css
  @keyframes modalFadeIn {
    from { opacity: 0; backdrop-filter: blur(0px); }
    to { opacity: 1; backdrop-filter: blur(8px); }
  }

  @keyframes modalPopIn {
    from { opacity: 0; transform: scale(0.92) translateY(15px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
  }

  .storm-modal-backdrop {
    animation: modalFadeIn 0.25s ease-out forwards;
  }

  .storm-modal-container {
    animation: modalPopIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }
2. Interactive Card Hover Effects (CardItem.jsx / Inventory / Showcase)
Add smooth lift, glow, and subtle scale-up on card hover:

CSS
.card-tile {
  transition: transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.25s ease;
  will-change: transform;
}

.card-tile:hover {
  transform: translateY(-8px) scale(1.03);
  box-shadow: 0 12px 25px rgba(226, 177, 68, 0.4), 0 0 15px rgba(0, 210, 211, 0.3);
  cursor: pointer;
}
3. Gacha Card Reveal 3D Flip (GachaResultModal.jsx)
Wrap gacha result cards in a 3D perspective wrapper with a smooth 180-degree flip effect when revealed:

CSS
.gacha-card-flip {
  perspective: 1000px;
}

@keyframes cardFlipReveal {
  0% { transform: rotateY(180deg) scale(0.8); opacity: 0; }
  50% { transform: rotateY(90deg) scale(1.1); }
  100% { transform: rotateY(0deg) scale(1); opacity: 1; }
}

.gacha-card-inner {
  animation: cardFlipReveal 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}
4. Button Tactile Feedback & Coin Counter Pulse
Add active click compression (scale: 0.95) for all buttons (SELL, UPGRADE, GACHA, CLOSE):

CSS
button, .btn-action, .close-btn {
  transition: transform 0.1s ease, filter 0.2s ease, box-shadow 0.2s ease !important;
}

button:active, .btn-action:active, .close-btn:active {
  transform: scale(0.95) !important; /* Mbalal/membal saat diklik */
}
Add a gentle pulse animation class for the Coin Badge whenever coins state updates:

CSS
@keyframes coinPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.15); box-shadow: 0 0 15px #f1c40f; }
  100% { transform: scale(1); }
}

.coin-pulse {
  animation: coinPulse 0.4s ease-in-out;
}
Agent Instructions
Append these CSS rules directly into App.css.

Ensure no JS libraries are installed or imported (use CSS Animations & Keyframes only).

Test Modal open/close, Gacha pulls, and Card hovers to confirm fluid 60 FPS transitions.