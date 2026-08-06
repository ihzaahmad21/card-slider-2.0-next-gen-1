const d = require('./cards.json');

// Check GOLD RARE cards with low OVR
var goldLow = d.filter(c => c.rarity === 'GOLD RARE' && c.ovr < 90);
console.log('GOLD RARE cards with OVR < 90:');
goldLow.forEach(c => console.log('  ' + c.name + ' - OVR: ' + c.ovr));

// Check BRONZE cards
var bronzeHigh = d.filter(c => c.rarity === 'BRONZE' && c.ovr > 80);
console.log('\nBRONZE cards with OVR > 80:');
bronzeHigh.forEach(c => console.log('  ' + c.name + ' - OVR: ' + c.ovr));

// Check star distribution for each tier
console.log('\n--- Star distribution check for processDataset logic ---');
d.forEach(c => {
  var stars = 3;
  var rarityClass = 'bronze';
  if (c.ovr >= 90 || c.rarity === 'GOLD RARE') { stars = 5; rarityClass = 'gold'; }
  else if (c.ovr >= 82 || c.rarity === 'SILVER RARE') { stars = 4; rarityClass = 'silver'; }
  else if (c.ovr <= 70) { stars = 1; }
  else if (c.ovr <= 74) { stars = 2; }

  // Check for mismatch: rarity says BRONZE but OVR logic says something else
  if (c.rarity === 'BRONZE' && rarityClass !== 'bronze') {
    console.log('MISMATCH: ' + c.name + ' rarity=' + c.rarity + ' ovr=' + c.ovr + ' -> computed=' + rarityClass);
  }
  if (c.rarity === 'SILVER RARE' && rarityClass !== 'silver') {
    console.log('MISMATCH: ' + c.name + ' rarity=' + c.rarity + ' ovr=' + c.ovr + ' -> computed=' + rarityClass);
  }
  if (c.rarity === 'GOLD RARE' && rarityClass !== 'gold') {
    console.log('MISMATCH: ' + c.name + ' rarity=' + c.rarity + ' ovr=' + c.ovr + ' -> computed=' + rarityClass);
  }
});
console.log('Done.');
