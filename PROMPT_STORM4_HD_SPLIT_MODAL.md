# 🥷 Redesign Specification: Storm 4 Split-Layout Modal & Dual-Image System

## Objective
Refactor the `Storm4Modal.jsx` component and modal CSS to adopt a side-by-side (Horizontal Split) Storm 4 Character Select layout. Seamlessly switch image source from lightweight `.webp` (grid) to high-resolution PNG (`public/images/HD/`) inside the detail view.

---

## Technical Specifications

### 1. Dual-Image Strategy Logic (`Storm4Modal.jsx`)
- **Grid/Thumbnail Image:** Uses `/images/[character].webp` (lightweight, rapid load).
- **Modal High-Res Image:** 
  - Dynamically replace the card image path inside the modal to point to `public/images/HD/` directory.
  - Example logic: 
    ```javascript
    // Convert filename from /images/boruto.webp -> /images/HD/boruto.png
    const hdImagePath = card.image
      .replace('/images/', '/images/HD/')
      .replace('.webp', '.png');
    ```
  - Provide fallback to default `card.image` if HD asset fails to load.

### 2. Horizontal Split-Layout Structure (`style.css` / Modal Styles)
- Change Modal Layout to `display: flex; flex-direction: row;` with wider bounds (e.g., `width: 850px; height: 520px;`).
- **Left Column (Character Showcase ~55% Width):**
  - Displays the full-body character artwork from `public/images/HD/` in maximum height & scale.
  - Set `object-fit: contain;` and generous height so the character appears bold, detailed, and prominent.
  - Subtle dark gradient or parchment texture background underneath.
- **Right Column (Stats & Control Panel ~45% Width):**
  - **Top:** Storm 4 Logo Header / Card Title & Character Name.
  - **Middle:** OVR Badge (e.g., `92 OVR`), Star Rating (`★ ★ ★ ★ ★`), Jutsu Name, and ATK/DEF/CHK Stat progress bars.
  - **Bottom:** Action control buttons (`UPGRADE`, `SELL`, `CLOSE`).

---

## Agent Action Required
1. Update `Storm4Modal.jsx` to parse and load the high-res PNG path from `public/images/HD/`.
2. Restructure the modal layout from vertical stack to horizontal split view (Character on Left, Stats on Right).
3. Update `App.css` to accommodate the wider modal dimensions and smooth entrance animations.