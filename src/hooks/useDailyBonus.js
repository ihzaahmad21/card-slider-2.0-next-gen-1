import { useState, useCallback, useRef } from 'react';

const STORAGE_KEY = 'shinobi_daily_bonus';

const toDateKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const todayKey = () => toDateKey(new Date());

const yesterdaysKey = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return toDateKey(d);
};

// Reward curve: 150 coins Day 1, +50/day, capped at 1500.
export const rewardForStreak = (streak) =>
  Math.min(100 + (streak - 1) * 50, 1500);

export const readStoredBonus = () => {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return raw && typeof raw === 'object' ? raw : null;
  } catch {
    return null;
  }
};

// Pure state derivation, fully testable.
export const computeBonus = (saved, todayStr, yesterdayStr) => {
  const totalClaims = Number(saved?.totalClaims) || 0;

  if (!saved || !saved.lastClaimDate) {
    return { streak: 1, totalClaims, canClaim: true, claimedToday: false };
  }
  if (saved.lastClaimDate === todayStr) {
    return { streak: Number(saved.streak) || 1, totalClaims, canClaim: false, claimedToday: true };
  }
  if (saved.lastClaimDate === yesterdayStr) {
    return { streak: (Number(saved.streak) || 0) + 1, totalClaims, canClaim: true, claimedToday: false };
  }
  return { streak: 1, totalClaims, canClaim: true, claimedToday: false };
};

const computeState = () => computeBonus(readStoredBonus(), todayKey(), yesterdaysKey());

export const useDailyBonus = () => {
  const [state, setState] = useState(computeState);
  const stateRef = useRef(state);
  stateRef.current = state;

  const claim = useCallback(() => {
    const current = stateRef.current;
    if (!current.canClaim) {
      return null;
    }

    const streak = current.streak;
    const reward = rewardForStreak(streak);

    setState({
      streak,
      totalClaims: current.totalClaims + 1,
      canClaim: false,
      claimedToday: true
    });

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          lastClaimDate: todayKey(),
          streak,
          totalClaims: current.totalClaims + 1
        })
      );
    } catch (err) {
      console.warn('[ShinobiTCG] Daily bonus save warning:', err);
    }

    return { streak, reward };
  }, []);

  return {
    ...state,
    reward: rewardForStreak(state.streak),
    claim
  };
};