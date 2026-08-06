# 🥷 Emergency Fix: Hard-Lock Modal Dimensions & Force Contain Image

The modal character image is bypassing standard max-height rules and spilling full-screen. We need to hard-lock the modal container and enforce strict grid bounds.

## Agent Instructions
Replace or update the `Storm4Modal` CSS rules in `App.css` (or its component CSS) with the strict code block below:

```css
/* Hard Lock Modal Backdrop */
.storm-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  z-index: 99999 !important;
}

/* Hard Lock Main Modal Box (Split 2 Column Grid) */
.storm-modal-container {
  width: 900px !important;
  max-width: 90vw !important;
  height: 520px !important;
  max-height: 85vh !important;
  display: grid !important;
  grid-template-columns: 1fr 1fr !important; /* Left & Right split 50% */
  background: #12141a !important;
  border: 2px solid #e2b144 !important;
  border-radius: 16px !important;
  box-shadow: 0 0 30px rgba(226, 177, 68, 0.3) !important;
  overflow: hidden !important;
  position: relative !important;
}

/* Hard Lock Left Panel (Character HD View) */
.storm-modal-left {
  position: relative !important;
  width: 100% !important;
  height: 100% !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  overflow: hidden !important;
  background: radial-gradient(circle, rgba(226,177,68,0.15) 0%, rgba(0,0,0,0.6) 100%) !important;
  padding: 20px !important;
  box-sizing: border-box !important;
}

/* Hard Lock Character Image (NO MORE JUMPSCARE) */
.storm-modal-left img {
  max-width: 100% !important;
  max-height: 460px !important;
  width: auto !important;
  height: auto !important;
  object-fit: contain !important;
  object-position: center !important;
  filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.8)) !important;
}

/* Right Panel (Stats & Details) */
.storm-modal-right {
  padding: 25px !important;
  display: flex !important;
  flex-direction: column !important;
  justify-content: space-between !important;
  box-sizing: border-box !important;
  overflow-y: auto !important;
}