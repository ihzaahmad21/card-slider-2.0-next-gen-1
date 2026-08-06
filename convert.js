const fs = require('fs');
const path = require('path');

const csvContent = fs.readFileSync(path.join(__dirname, 'public', 'db.csv'), 'utf8');
const lines = csvContent.trim().split(/\r?\n/);

const cards = [];
for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;

  // Simple CSV parser handling quotes
  let parts = [];
  let current = '';
  let inQuotes = false;

  for (let j = 0; j < line.length; j++) {
    const char = line[j];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      parts.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  parts.push(current);

  if (parts.length >= 5) {
    const id = parseInt(parts[0]);
    const name = parts[1];
    const ovr = parseInt(parts[2]);
    const rarity = parts[3];
    let rawImg = parts[4].replace(/^\/?images\//, '');

    cards.push({
      id: id,
      name: name,
      ovr: ovr,
      rarity: rarity,
      image_url: 'images/' + rawImg
    });
  }
}

fs.writeFileSync(path.join(__dirname, 'cards.json'), JSON.stringify(cards, null, 2));
console.log(`Generated cards.json with ${cards.length} cards.`);
