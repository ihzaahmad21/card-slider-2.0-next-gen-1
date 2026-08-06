# 🥷 Shinobi TCG - Master Project Specification & Agent Roadmap

## 📌 Project Overview
This document specifies the complete requirements for building the **Shinobi Card Slider 2.0 TCG Application**. The prototyping approach uses **vanilla HTML5 & CSS3 first** (modularly section-by-section) to lock down visual dimensions, scaling, and assets before migrating to React.

---

## 🎨 Asset & Background References
1. **Base Card Background:** Parchment/Ink texture (Ninja Storm 4 Style).
2. **Card Packs (Gacha System):**
   - **Bronze Pack (100 Coins):** Bronze Metallic Pattern.
   - **Silver Pack (500 Coins):** Silver Metallic Pattern.
   - **Gold Pack (1000 Coins):** Gold Ninja Pattern.

---

## 🗺️ Execution Roadmap

### 📋 PHASE 1: Native HTML/CSS Base Structure & Scale Fix
- [ ] **Main Page Skeleton:** Floating Pill Navigation Bar, Hero Section with split CTA & Card Showcase.
- [ ] **Base Card Scale Fix:** Strict aspect-ratio `2:3` container (e.g., `240px x 360px`).
- [ ] **Card Design Layout:**
  - Overall Stats / OVR Badge.
  - Character Image (`object-fit: contain`).
  - Ninja Details: Jutsu Name, Summoning Type, Jutsu Stats.
  - Rarity Stars (1 to 5 Stars Max).
  - Background Texture Integration.

### 🎒 PHASE 2: Core TCG Systems (Account & Economy)
- [ ] **Gacha System:** 3 Pack Tier Selection (Bronze - 100, Silver - 500, Gold - 1000 Coins) with pack opening animations.
- [ ] **Coins Economy:** Coin balance display, shop mechanics (buy/sell cards).
- [ ] **Inventory System:** User collection showcase.
- [ ] **Upgrade & Trading System:** Card leveling, star rating upgrades (Up to Max 5 Stars), OVR stats boosting.

---

## 🛠️ Step 1 Agent Prompt: Building `index.html` & `style.css`

Agent must generate the initial prototype focusing **ONLY on the Main Landing Page & Base Card Component layout**.

### File Requirements:
- `index.html`
- `style.css`

### Section Specifications (`index.html`):

1. **Floating Capsule Navbar (`#navbar`)**:
   - Centered, fixed top position (`top: 20px`).
   - Glassmorphism effect (`backdrop-filter: blur(12px)`).
   - Links: `Home`, `About`, `Showcase`, `Gacha System`, `Inventory`, `Shop`.

2. **Hero Section (`#home`)**:
   - **Left:** Title *"Collect & Upgrade Shinobi Cards"*, subtitle, CTAs (*Gacha Now*, *View Showcase*).
   - **Right:** Live preview of a single **Gold Base Card** displaying Naruto (Baryon Mode / Kurama Mode) to verify scale.

3. **Base Card Component Architecture (`.card-container`)**:
   - **Dimensions:** Width `240px`, Aspect Ratio `2 / 3` (Height `360px`).
   - **Background:** Parchment/paper texture style (`#1e293b` fallback).
   - **Card Elements:**
     - Top Bar: Character Name + OVR Badge (`95 OVR`).
     - Image Window: Centered artwork with drop shadow.
     - Details Panel: Jutsu Name (e.g., *"Rasengan / Baryon Tail"*), Jutsu Stats, Summoning info.
     - Bottom Bar: 5-Star Rating (`★ ★ ★ ★ ★`) + Rarity Label (`GOLD RARE`).

4. **Showcase Section (`#showcase`)**:
   - Grid layout showcasing Gold, Silver, and Bronze card variants side-by-side.

5. **Gacha Pack Section (`#gacha`)**:
   - Preview container displaying 3 Pack Tiers:
     - Bronze Pack (Cost: 100 Coins)
     - Silver Pack (Cost: 500 Coins)
     - Gold Pack (Cost: 1000 Coins)

---

## 🤖 Instructions for AI Agent
Read `PROMPT_MAIN_CANVAS.md` and generate the clean HTML5 (`index.html`) and CSS3 (`style.css`) files. Ensure styles are fully responsive, modern dark-themed, and pixel-perfect according to the 2:3 card scale.