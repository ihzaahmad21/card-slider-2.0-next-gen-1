const fs = require('fs');
const cd = fs.readFileSync('src/utils/cardData.js', 'utf8');
const jutsuIds = new Set();
const re = /^\s+(\d+):\s*['\"].*?\3/gm;
let m;
while ((m = re.exec(cd)) !== null) { jutsuIds.add(parseInt(m[1])); }

const meta = fs.readFileSync('src/utils/characterMeta.js', 'utf8');
const metaIds = new Set();
const r2 = /^\s+(\d+):\s*\{/gm;
while ((m = r2.exec(meta)) !== null) { metaIds.add(parseInt(m[1])); }

const cards = JSON.parse(fs.readFileSync('src/data/cards.json', 'utf8'));
let missingJ = [], missingM = [];
for (let i = 11; i <= 251; i++) {
  if (!jutsuIds.has(i)) missingJ.push(i);
  if (!metaIds.has(i)) missingM.push(i);
}
console.log('Cards:', cards.length);
console.log('Missing jutsu:', missingJ.join(',') || 'NONE');
console.log('Missing meta:', missingM.join(',') || 'NONE');
const k = cards.find(c => c.id === 251);
console.log('New card id251:', k.name, 'OVR=' + k.ovr);
fs.unlinkSync('verify_fix.js');
