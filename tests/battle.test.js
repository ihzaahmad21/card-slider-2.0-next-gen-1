import { expect, test, describe } from 'vitest';
import {
  validateSquad,
  calculateSquadAvgOvr,
  generateBotSquad,
  simulateClashRound,
  MIN_SQUAD_SIZE,
  MAX_SQUAD_SIZE
} from '../src/utils/battle.js';
import { getBaseCharacterName } from '../src/utils/cards.js';
import { makeCard, makeInventoryItem } from './fixtures.js';

describe('Battle System Utilities', () => {
  describe('validateSquad', () => {
    test('rejects empty or null squad', () => {
      expect(validateSquad([]).valid).toBe(false);
      expect(validateSquad(null).valid).toBe(false);
      expect(validateSquad([null, null]).valid).toBe(false);
    });

    test('rejects squad with less than MIN_SQUAD_SIZE (3)', () => {
      const squad1 = [makeInventoryItem(makeCard(1, 'Naruto', 'gold', 4, 88), 'inst-1')];
      const res1 = validateSquad(squad1);
      expect(res1.valid).toBe(false);
      expect(res1.count).toBe(1);

      const squad2 = [
        makeInventoryItem(makeCard(1, 'Naruto', 'gold', 4, 88), 'inst-1'),
        makeInventoryItem(makeCard(2, 'Sasuke', 'gold', 4, 88), 'inst-2')
      ];
      const res2 = validateSquad(squad2);
      expect(res2.valid).toBe(false);
      expect(res2.count).toBe(2);
    });

    test('accepts squad with 3 to 6 shinobi', () => {
      const squad3 = [
        makeInventoryItem(makeCard(1, 'Naruto', 'gold', 4, 88), 'inst-1'),
        makeInventoryItem(makeCard(2, 'Sasuke', 'gold', 4, 88), 'inst-2'),
        makeInventoryItem(makeCard(3, 'Sakura', 'silver', 3, 80), 'inst-3')
      ];
      const res3 = validateSquad(squad3);
      expect(res3.valid).toBe(true);
      expect(res3.count).toBe(3);

      const squad6 = [
        ...squad3,
        makeInventoryItem(makeCard(4, 'Kakashi', 'gold', 4, 90), 'inst-4'),
        makeInventoryItem(makeCard(5, 'Jiraiya', 'gold', 4, 91), 'inst-5'),
        makeInventoryItem(makeCard(6, 'Tsunade', 'gold', 4, 89), 'inst-6')
      ];
      const res6 = validateSquad(squad6);
      expect(res6.valid).toBe(true);
      expect(res6.count).toBe(6);
    });
  });

  describe('calculateSquadAvgOvr', () => {
    test('returns 0 for empty array', () => {
      expect(calculateSquadAvgOvr([])).toBe(0);
      expect(calculateSquadAvgOvr(null)).toBe(0);
    });

    test('calculates correct rounded average OVR', () => {
      const squad = [
        { ovr: 80 },
        { ovr: 90 },
        { ovr: 85 }
      ];
      expect(calculateSquadAvgOvr(squad)).toBe(85);

      const squadUneven = [
        { ovr: 70 },
        { ovr: 71 },
        { ovr: 71 }
      ];
      // (70 + 71 + 71) / 3 = 70.67 -> 71
      expect(calculateSquadAvgOvr(squadUneven)).toBe(71);
    });
  });

  describe('generateBotSquad', () => {
    const mockMasterCards = [
      { id: 101, name: 'Naruto Uzumaki', ovr: 85, atk: 85, def: 85, chk: 85, spd: 85, image_url: 'naruto.webp', jutsu: 'Rasengan' },
      { id: 102, name: 'Naruto Uzumaki (Sage Mode)', ovr: 92, atk: 92, def: 92, chk: 92, spd: 92, image_url: 'naruto_sage.webp', jutsu: 'Wind Style Rasenshuriken' },
      { id: 103, name: 'Sasuke Uchiha', ovr: 85, atk: 85, def: 85, chk: 85, spd: 85, image_url: 'sasuke.webp', jutsu: 'Chidori' },
      { id: 104, name: 'Sakura Haruno', ovr: 82, atk: 82, def: 82, chk: 82, spd: 82, image_url: 'sakura.webp', jutsu: 'Cherry Blossom' },
      { id: 105, name: 'Kakashi Hatake', ovr: 88, atk: 88, def: 88, chk: 88, spd: 88, image_url: 'kakashi.webp', jutsu: 'Raikiri' },
      { id: 106, name: 'Itachi Uchiha', ovr: 90, atk: 90, def: 90, chk: 90, spd: 90, image_url: 'itachi.webp', jutsu: 'Amaterasu' },
      { id: 107, name: 'Gaara', ovr: 84, atk: 84, def: 84, chk: 84, spd: 84, image_url: 'gaara.webp', jutsu: 'Sand Tsunami' },
      { id: 108, name: 'Rock Lee', ovr: 81, atk: 81, def: 81, chk: 81, spd: 81, image_url: 'lee.webp', jutsu: 'Primary Lotus' },
      { id: 109, name: 'Neji Hyuga', ovr: 83, atk: 83, def: 83, chk: 83, spd: 83, image_url: 'neji.webp', jutsu: 'Eight Trigrams' },
      { id: 110, name: 'Shikamaru Nara', ovr: 80, atk: 80, def: 80, chk: 80, spd: 80, image_url: 'shikamaru.webp', jutsu: 'Shadow Possession' },
      { id: 111, name: 'Jiraiya', ovr: 89, atk: 89, def: 89, chk: 89, spd: 89, image_url: 'jiraiya.webp', jutsu: 'Giant Rasengan' }
    ];

    test('generates bot squad matching target size', () => {
      const playerTeam = [{ ovr: 85 }, { ovr: 85 }, { ovr: 85 }];
      const result = generateBotSquad(playerTeam, mockMasterCards, { teamSize: 3 });

      expect(result.squad).toHaveLength(3);
      expect(result.botName).toBeDefined();
      expect(typeof result.avgOvr).toBe('number');
    });

    test('maintains balanced average OVR within margin of player squad', () => {
      const targetOvr = 85;
      const playerTeam = [{ ovr: 85 }, { ovr: 85 }, { ovr: 85 }, { ovr: 85 }];
      const result = generateBotSquad(playerTeam, mockMasterCards, { teamSize: 4 });

      expect(result.squad).toHaveLength(4);
      // Average OVR should be within ±5 of target
      expect(Math.abs(result.avgOvr - targetOvr)).toBeLessThanOrEqual(5);
    });

    test('prevents duplicate base character names in bot squad', () => {
      const result = generateBotSquad(85, mockMasterCards, { teamSize: 5 });
      const baseNames = result.squad.map(c => getBaseCharacterName(c.name).toLowerCase());
      const uniqueBases = new Set(baseNames);
      expect(uniqueBases.size).toBe(result.squad.length);
    });

    test('attaches unique instanceId and isBot tag to each bot card', () => {
      const result = generateBotSquad(85, mockMasterCards, { teamSize: 3 });
      result.squad.forEach(card => {
        expect(card.instanceId).toBeDefined();
        expect(card.isBot).toBe(true);
      });
    });

    test('applies dynamic plusLevel when facing high tier player squad to diversify roster', () => {
      const highOvrSquad = [{ ovr: 95 }, { ovr: 95 }, { ovr: 95 }, { ovr: 95 }];
      const result = generateBotSquad(highOvrSquad, mockMasterCards, { teamSize: 4 });
      expect(result.squad).toHaveLength(4);
      expect(Math.abs(result.avgOvr - 95)).toBeLessThanOrEqual(5);
      // Cards should utilize plusLevel to compete with high tier
      const hasUpgraded = result.squad.some(c => (c.plusLevel || 0) > 0);
      expect(hasUpgraded).toBe(true);
    });
  });

  describe('simulateClashRound', () => {
    test('correctly awards uncontested win if one side is missing', () => {
      const pCard = { name: 'Naruto', ovr: 85, atk: 85, def: 85, chk: 85, spd: 85 };
      const res = simulateClashRound(pCard, null, {}, 1);
      expect(res.winner).toBe('player');
      expect(res.playerDmg).toBe(100);

      const res2 = simulateClashRound(null, pCard, {}, 1);
      expect(res2.winner).toBe('bot');
      expect(res2.botDmg).toBe(100);
    });

    test('simulates damage and generates informative log', () => {
      const pCard = { name: 'Naruto', ovr: 90, atk: 92, def: 88, chk: 95, spd: 90, jutsu: 'Rasengan' };
      const bCard = { name: 'Sasuke', ovr: 90, atk: 90, def: 89, chk: 93, spd: 91, jutsu: 'Chidori' };

      const res = simulateClashRound(pCard, bCard, { atk: 5, def: 5, chk: 5 }, 1);
      expect(['player', 'bot', 'draw']).toContain(res.winner);
      expect(res.playerDmg).toBeGreaterThan(0);
      expect(res.botDmg).toBeGreaterThan(0);
      expect(typeof res.log).toBe('string');
      expect(res.log.length).toBeGreaterThan(10);
    });
  });
});
