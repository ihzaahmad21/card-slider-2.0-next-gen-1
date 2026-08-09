import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const csvPath = path.join(scriptDir, 'public', 'db.csv');

let csvContent;
try {
  csvContent = fs.readFileSync(csvPath, 'utf8');
} catch (err) {
  throw new Error(`Failed to read source CSV at ${csvPath}: ${err.message}`, { cause: err });
}

const lines = csvContent.trim().split(/\r?\n/);

const cards = [];
const rowErrors = [];
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

  if (parts.length < 5) {
    rowErrors.push(`line ${i + 1}: expected at least 5 columns, got ${parts.length}`);
    continue;
  }

  const id = parseInt(parts[0], 10);
  const name = parts[1];
  const ovr = parseInt(parts[2], 10);
  const rarity = parts[3];
  const rawImg = parts[4].replace(/^\/?images\//, '');

  if (!Number.isInteger(id)) rowErrors.push(`line ${i + 1}: invalid id ${JSON.stringify(parts[0])}`);
  if (!name) rowErrors.push(`line ${i + 1}: missing name`);
  if (!Number.isInteger(ovr)) rowErrors.push(`line ${i + 1}: invalid ovr ${JSON.stringify(parts[2])}`);
  if (!rarity) rowErrors.push(`line ${i + 1}: missing rarity`);
  if (!rawImg) rowErrors.push(`line ${i + 1}: missing image path`);

  cards.push({
    id: id,
    name: name,
    ovr: ovr,
    rarity: rarity,
    image_url: 'images/' + rawImg
  });
}

// Fail loudly instead of writing a silently corrupt cards.json
if (rowErrors.length > 0) {
  console.error(`Refusing to write cards.json: ${rowErrors.length} malformed row(s) in ${csvPath}`);
  rowErrors.forEach(msg => console.error(`  - ${msg}`));
  process.exit(1);
}

const outPath = path.join(scriptDir, 'cards.json');
try {
  fs.writeFileSync(outPath, JSON.stringify(cards, null, 2));
} catch (err) {
  throw new Error(`Failed to write ${outPath}: ${err.message}`, { cause: err });
}
console.log(`Generated cards.json with ${cards.length} cards.`);
