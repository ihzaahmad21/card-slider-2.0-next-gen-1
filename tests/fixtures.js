export function makeCard(overrides = {}) {
  return {
    id: 1,
    name: 'Naruto Uzumaki',
    ovr: 90,
    rarity: 'GOLD RARE',
    rarityClass: 'gold',
    stars: 5,
    img: '/images/naruto.webp',
    jutsu: 'Rasengan',
    summon: 'Nine-Tails Kurama',
    atk: 92,
    def: 80,
    chk: 85,
    ...overrides
  };
}

export function makeInventoryItem(overrides = {}) {
  const card = makeCard(overrides);
  return {
    quantity: 1,
    plusLevel: 0,
    instanceId: `${card.id}-inst-1`,
    ...card,
    ...overrides
  };
}
