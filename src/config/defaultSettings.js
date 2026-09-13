export const DEFAULT_SETTINGS = {
  // Audio Settings
  audio: {
    enabled: true,
    volume: 0.5,
    muted: false,
    currentTrack: 'title-theme'
  },

  // Display Settings
  display: {
    cardAnimationSpeed: 'normal', // slow, normal, fast
    cardQuality: 'high', // low, medium, high
    reduceMotion: false,
    showTooltips: true
  },

  // Game Settings
  game: {
    autoSave: true,
    confirmPurchases: true,
    showCardValues: true,
    defaultSortOrder: 'rarity' // rarity, name, value, recent
  },

  // Notifications
  notifications: {
    enabled: true,
    packOpening: true,
    achievements: true,
    dailyRewards: true
  }
};

export const ANIMATION_SPEEDS = {
  slow: 1.5,
  normal: 1,
  fast: 0.5
};

export const ANIMATION_SPEED_OPTIONS = [
  { value: 'slow', label: 'Slow' },
  { value: 'normal', label: 'Normal' },
  { value: 'fast', label: 'Fast' }
];

export const CARD_QUALITY_OPTIONS = [
  { value: 'low', label: 'Low (Better Performance)', description: 'Reduced image quality' },
  { value: 'medium', label: 'Medium (Balanced)', description: 'Standard quality' },
  { value: 'high', label: 'High (Best Quality)', description: 'Maximum detail' }
];

export const DEFAULT_SORT_OPTIONS = [
  { value: 'rarity', label: 'Rarity' },
  { value: 'name', label: 'Name (A-Z)' },
  { value: 'value', label: 'OVR' },
  { value: 'recent', label: 'Recently Added' }
];