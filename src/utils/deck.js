export const DECK_SIZE = 6;
export const MAX_DECK_PRESETS = 3;
export const DEFAULT_PRESET_NAMES = ['Preset 1', 'Preset 2', 'Preset 3'];

export function createDefaultPresets(initialDeck = []) {
  return [
    { id: 'preset-1', name: 'Preset 1', deck: Array.isArray(initialDeck) ? initialDeck.slice(0, DECK_SIZE) : [] },
    { id: 'preset-2', name: 'Preset 2', deck: [] },
    { id: 'preset-3', name: 'Preset 3', deck: [] }
  ];
}

export function normalizeDeckPresets(storedData) {
  if (!storedData) {
    return createDefaultPresets();
  }

  // Case 1: Legacy format (Array of string instanceIds)
  if (Array.isArray(storedData)) {
    if (storedData.length === 0 || typeof storedData[0] === 'string') {
      return createDefaultPresets(storedData);
    }
  }

  // Case 2: Object with presets property or direct array of presets
  const rawPresets = Array.isArray(storedData)
    ? storedData
    : (Array.isArray(storedData.presets) ? storedData.presets : []);

  const presets = [];
  for (let i = 0; i < MAX_DECK_PRESETS; i++) {
    const defaultId = `preset-${i + 1}`;
    const defaultName = DEFAULT_PRESET_NAMES[i];
    const existing = rawPresets[i];

    if (existing && typeof existing === 'object') {
      presets.push({
        id: existing.id || defaultId,
        name: existing.name || defaultName,
        deck: Array.isArray(existing.deck)
          ? existing.deck.filter(id => typeof id === 'string').slice(0, DECK_SIZE)
          : []
      });
    } else {
      presets.push({
        id: defaultId,
        name: defaultName,
        deck: []
      });
    }
  }

  return presets;
}

export function toggleCardInDeck(deck, instanceId) {
  const currentDeck = Array.isArray(deck) ? deck : [];
  const index = currentDeck.indexOf(instanceId);
  if (index !== -1) {
    // Card is already in deck, remove it
    const newDeck = [...currentDeck];
    newDeck.splice(index, 1);
    return newDeck;
  } else {
    // Card not in deck, add if there is space
    if (currentDeck.length >= DECK_SIZE) {
      return currentDeck;
    }
    return [...currentDeck, instanceId];
  }
}

// Clean up single deck if cards are sold/removed from inventory
export function sanitizeDeck(deck, inventory) {
  if (!Array.isArray(deck)) return [];
  const validInstanceIds = new Set(inventory.map(item => item.instanceId));
  return deck.filter(id => validInstanceIds.has(id));
}

// Clean up all presets if cards are sold/removed from inventory
export function sanitizeAllPresets(presets, inventory) {
  if (!Array.isArray(presets)) return createDefaultPresets();
  const validInstanceIds = new Set(inventory.map(item => item.instanceId));
  return presets.map(preset => ({
    ...preset,
    deck: Array.isArray(preset.deck) ? preset.deck.filter(id => validInstanceIds.has(id)) : []
  }));
}

// Helper untuk kalkulasi OVR
export function calculateDeckStats(deck, inventory) {
  const currentDeck = Array.isArray(deck) ? deck : [];
  const deckCards = currentDeck.map(id => inventory.find(item => item.instanceId === id)).filter(Boolean);
  
  const totalOvr = deckCards.reduce((sum, card) => sum + (card.ovr || 0), 0);
  const avgOvr = deckCards.length > 0 ? Math.round(totalOvr / deckCards.length) : 0;
  
  return { totalOvr, avgOvr, deckCards };
}
