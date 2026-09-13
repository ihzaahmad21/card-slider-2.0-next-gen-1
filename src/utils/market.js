import { getSellValue, buildInventoryInstance, getAttributeColorClass } from './cards.js';

export function getReferencePrice(card) {
  const sellValue = getSellValue(card);
  let multiplier = 2;
  if (card.rarityClass === 'bronze') multiplier = 3;
  if (card.rarityClass === 'silver') multiplier = 4;
  if (card.rarityClass === 'gold') multiplier = 5;
  if (card.rarityClass === 'diamond') multiplier = 8;
  if (card.rarityClass === 'mythic') multiplier = 12;
  return sellValue * multiplier;
}

export function buildBotListings(allCards, inventory, count = 6) {
  const ownedIds = new Set(inventory.map(c => c.id));
  const unownedCards = allCards.filter(c => !ownedIds.has(c.id));
  
  // Jika punya semua kartu, random dari seluruh kartu
  const pool = unownedCards.length > 0 ? unownedCards : allCards;
  
  const listings = [];
  const tempPool = [...pool];
  
  for (let i = 0; i < count && tempPool.length > 0; i++) {
    const rIdx = Math.floor(Math.random() * tempPool.length);
    const card = tempPool.splice(rIdx, 1)[0];
    
    listings.push({
      ...card,
      listingId: `bot-${card.id}-${Date.now()}-${i}`,
      seller: 'bot',
      price: getReferencePrice(card)
    });
  }
  return listings;
}

export function createPlayerListing(inventoryItem, price) {
  return {
    ...inventoryItem,
    listingId: `player-${inventoryItem.instanceId}-${Date.now()}`,
    seller: 'player',
    price: price
  };
}

export function buyListing(listings, inventory, coins, listingId) {
  const listingIndex = listings.findIndex(l => l.listingId === listingId);
  if (listingIndex === -1) return { error: 'Listing not found', newListings: listings, newInventory: inventory, newCoins: coins };
  
  const listing = listings[listingIndex];
  if (coins < listing.price) {
    return { error: 'Not enough coins', newListings: listings, newInventory: inventory, newCoins: coins };
  }
  
  // Bikin instance baru jika dibeli dari bot. 
  // Jika dari player listing, tetap bikin instance baru (atau pakai yang lama). 
  // Sesuai plan: tambah kartu ke inventory (buildInventoryInstance)
  const newInstance = buildInventoryInstance(listing, listing.plusLevel || 0);
  
  const newListings = [...listings];
  newListings.splice(listingIndex, 1);
  
  const newInventory = [...inventory, newInstance];
  const newCoins = coins - listing.price;
  
  return {
    success: true,
    card: newInstance,
    newListings,
    newInventory,
    newCoins
  };
}

export function removePlayerListing(listings, listingId) {
  const listingIndex = listings.findIndex(l => l.listingId === listingId);
  if (listingIndex === -1) return { error: 'Listing not found', newListings: listings, card: null };
  
  const listing = listings[listingIndex];
  const newListings = [...listings];
  newListings.splice(listingIndex, 1);
  
  return {
    success: true,
    card: listing,
    newListings
  };
}
