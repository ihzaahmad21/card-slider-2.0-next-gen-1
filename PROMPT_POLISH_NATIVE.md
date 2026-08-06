# 🥷 Final Native Polish: Hero Auto-Carousel & Smooth Navbar Navigation

## Objective
Polishing the vanilla HTML/CSS/JS prototype to 100% completion before React migration. Add an auto-rotating Hero Card Carousel featuring top Gold cards and fix all Navbar section smooth-scrolling anchors.

---

## Technical Specifications

### 1. Hero Section Auto-Rotating Card Carousel (`script.js` & `style.css`)
- **Card Selection:** Filter top-tier cards from `cards.json` (where `rarity === 'GOLD RARE'` or `ovr >= 90`).
- **Rotation Interval:** Auto-switch the displayed Hero card every **4 seconds** (`4000ms`).
- **Transition Effects:**
  - Apply smooth opacity and scale transition CSS classes (`opacity: 0; transform: scale(0.95);` -> `opacity: 1; transform: scale(1);`).
  - Update card artwork, name, OVR badge, star rating, and jutsu stats dynamically during each rotation.
- **Hover Behavior:** Pause the auto-rotation timer when the user hovers over the Hero Card container (`mouseenter` / `mouseleave`).

### 2. Smooth Navigation Anchors (`index.html` & `script.js`)
- Ensure all Navbar pills properly navigate to their corresponding section IDs:
  - `Home` -> `#home`
  - `Showcase` -> `#showcase`
  - `Gacha System` / `Shop` -> `#shop`
  - `Inventory` -> `#inventory`
- Apply `html { scroll-behavior: smooth; }` in `style.css` or smooth scroll JS click handlers.

### 3. Image Fallback Safety
- Ensure any missing image or load error on cards gracefully defaults to a solid dark shinobi placeholder card or fallback image.

---

## Agent Action Required
1. Update `script.js` to implement `initHeroCarousel()` with auto-rotate timer and image load fallback handlers.
2. Update `style.css` to add smooth hero card keyframe fade animations and CSS `scroll-behavior: smooth`.
3. Update `index.html` navbar anchor links (`href="#home"`, `href="#showcase"`, `href="#shop"`, `href="#inventory"`).