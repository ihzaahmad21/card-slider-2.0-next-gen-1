import { expect, test } from 'vitest';
import { getReferencePrice, buildBotListings, createPlayerListing, buyListing, removePlayerListing } from '../src/utils/market.js';
import { makeCard, makeInventoryItem } from './fixtures.js';

test('getReferencePrice calculates correct price', () => {
  const bronze = makeCard(1, 'A', 'bronze', 1, 50);
  const silver = makeCard(2, 'B', 'silver', 3, 70);
  
  // bronze: 30 * 3 = 90
  expect(getReferencePrice(bronze)).toBe(90);
  // silver: 150 * 4 = 600
  expect(getReferencePrice(silver)).toBe(600);
});

test('createPlayerListing creates correct structure', () => {
  const item = makeInventoryItem(makeCard(1, 'A', 'bronze', 1, 50), 'inst-1');
  const listing = createPlayerListing(item, 500);
  
  expect(listing.seller).toBe('player');
  expect(listing.price).toBe(500);
  expect(listing.listingId).toMatch(/player-inst-1-/);
});

test('removePlayerListing removes listing and returns card', () => {
  const listing = { listingId: 'player-1', seller: 'player', id: 1 };
  const listings = [listing];
  
  const result = removePlayerListing(listings, 'player-1');
  expect(result.success).toBe(true);
  expect(result.newListings.length).toBe(0);
  expect(result.card.id).toBe(1);
});
