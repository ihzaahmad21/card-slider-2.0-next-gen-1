export function makeCard(id, name, rarityClass, stars, ovr) {
  return { id, name, rarityClass, stars, ovr };
}

export function makeInventoryItem(card, instanceId) {
  return { ...card, instanceId: instanceId || `${card.id}-123` };
}
