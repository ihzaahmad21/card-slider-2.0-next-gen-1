import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { getJutsuDetails, calculateChakraCost } from '../src/utils/cards.js';
import Storm4Modal from '../src/components/Storm4Modal.jsx';
import masterCardsData from '../src/data/cards.json';

describe('Jutsu Library & System Integration', () => {
  describe('getJutsuDetails helper function', () => {
    it('retrieves accurate Rasengan details from jutsuLibrary.json', () => {
      const rasengan = getJutsuDetails('jutsu-rasengan-01');
      expect(rasengan).toBeDefined();
      expect(rasengan.name).toBe('Rasengan');
      expect(rasengan.type).toBe('NINJUTSU');
      expect(rasengan.element).toBe('WIND');
      expect(rasengan.baseDamage).toBe(350);
      expect(rasengan.critRate).toBe(0.15);
      expect(rasengan.baseChakraCost).toBe(40);
      expect(rasengan.target).toBe('SINGLE');
      expect(rasengan.description).toBe('Serangan bola chakra berputar intensitas tinggi.');
    });

    it('retrieves accurate Chidori details from jutsuLibrary.json', () => {
      const chidori = getJutsuDetails('jutsu-chidori-01');
      expect(chidori).toBeDefined();
      expect(chidori.name).toBe('Chidori: One Thousand Birds');
      expect(chidori.type).toBe('NINJUTSU');
      expect(chidori.element).toBe('LIGHTNING');
      expect(chidori.baseDamage).toBe(380);
      expect(chidori.critRate).toBe(0.25);
      expect(chidori.baseChakraCost).toBe(45);
      expect(chidori.target).toBe('SINGLE');
      expect(chidori.description).toBe('Tusukan petir berkecepatan tinggi dengan peluang Critical tinggi.');
    });

    it("retrieves accurate Indra's Arrow details from jutsuLibrary.json", () => {
      const indra = getJutsuDetails('jutsu-indras-arrow-01');
      expect(indra).toBeDefined();
      expect(indra.name).toBe("Indra's Arrow");
      expect(indra.type).toBe('NINJUTSU');
      expect(indra.element).toBe('LIGHTNING');
      expect(indra.baseDamage).toBe(600);
      expect(indra.critRate).toBe(0.20);
      expect(indra.baseChakraCost).toBe(80);
      expect(indra.target).toBe('AOE');
      expect(indra.description).toBe('Panah petir terkuat Susanoo Sasuke.');
    });

    it('gracefully handles missing/unknown jutsu without error', () => {
      const unknown = getJutsuDetails('jutsu-unknown-custom-99');
      expect(unknown).toBeDefined();
      expect(unknown.name).toBe('Unknown Custom');
      expect(unknown.baseChakraCost).toBeGreaterThan(0);

      const nullJutsu = getJutsuDetails(null);
      expect(nullJutsu).toBeDefined();
      expect(nullJutsu.name).toBe('Secret Ninja Art');
    });
  });

  describe('calculateChakraCost helper function', () => {
    it('calculates chakra cost using Math.max(5, Math.round(baseCost * (1 - (chkStat / 200))))', () => {
      // baseCost = 40, chkStat = 50 -> 40 * (1 - 0.25) = 30
      expect(calculateChakraCost(40, 50)).toBe(30);

      // baseCost = 80, chkStat = 100 -> 80 * (1 - 0.5) = 40
      expect(calculateChakraCost(80, 100)).toBe(40);

      // baseCost = 45, chkStat = 80 -> 45 * (1 - 0.4) = 45 * 0.6 = 27
      expect(calculateChakraCost(45, 80)).toBe(27);
    });

    it('enforces a minimum chakra cost of 5 even with very high CHK', () => {
      // baseCost = 40, chkStat = 195 -> 40 * (1 - 0.975) = 1 -> Math.max(5, 1) = 5
      expect(calculateChakraCost(40, 195)).toBe(5);

      // baseCost = 20, chkStat = 250 -> negative / zero -> Math.max(5, ...) = 5
      expect(calculateChakraCost(20, 250)).toBe(5);
    });
  });

  describe('cards.json data structure', () => {
    it('has equippedJutsu array and awakeningId for Sasuke Rinne Sharinggan (id: 153)', () => {
      const sasukeRinne = masterCardsData.find(c => c.id === 153);
      expect(sasukeRinne).toBeDefined();
      expect(sasukeRinne.name).toContain('Sasuke');
      expect(Array.isArray(sasukeRinne.equippedJutsu)).toBe(true);
      expect(sasukeRinne.equippedJutsu).toContain('jutsu-chidori-01');
      expect(sasukeRinne.equippedJutsu).toContain('jutsu-indras-arrow-01');
      expect(sasukeRinne.awakeningId).toBe('awakening-susanoo-01');
    });
  });

  describe('Storm4Modal UI rendering', () => {
    it('automatically reads and renders jutsu names from equippedJutsu using helper functions', () => {
      const mockCard = {
        id: 153,
        name: 'Sasuke Rinne Sharinggan',
        ovr: 99,
        stars: 5,
        atk: 99,
        def: 95,
        spd: 99,
        chk: 100,
        img: 'images/sasuke (6) rinne sharinggan.webp',
        equippedJutsu: ['jutsu-chidori-01', 'jutsu-indras-arrow-01'],
        awakeningId: 'awakening-susanoo-01'
      };

      render(
        <Storm4Modal
          card={mockCard}
          onClose={() => {}}
          inventory={[]}
          coins={1000}
        />
      );

      // Verify jutsu names are rendered
      expect(screen.getByText('Chidori: One Thousand Birds')).toBeInTheDocument();
      expect(screen.getByText("Indra's Arrow")).toBeInTheDocument();

      // Verify calculated chakra cost is displayed (chk = 100 -> 50% discount)
      // Chidori base 45 -> 45 * 0.5 = 23 CHK
      // Indra's Arrow base 80 -> 80 * 0.5 = 40 CHK
      expect(screen.getByText('⚡23 CHK')).toBeInTheDocument();
      expect(screen.getByText('⚡40 CHK')).toBeInTheDocument();

      // Verify awakening indicator is rendered
      expect(screen.getByText('⚡ AWAKENED')).toBeInTheDocument();
    });
  });
});
