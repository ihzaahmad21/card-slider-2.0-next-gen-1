// characterMeta.js
// Database tag tambahan per kartu (di luar jutsu/summon yang sudah ada di cardData.js).
//
// category (tags): array, boleh lebih dari satu per kartu.
//   'jinchuriki' | 'kage' | 'genin' | 'warArc' | 'godLevel' | 'edoTensei' | 'awakening'
// team: array nama tim/organisasi (boleh lebih dari satu, mis. Sasuke Taka+Akatsuki)
// village: string asal desa, atau null jika tidak berdesa/tidak diketahui
// clan: string nama clan, atau null jika tidak ada clan
//
// Catatan: ini hasil tagging awal berdasarkan lore Naruto/Boruto secara umum.
// Silakan koreksi entry yang menurutmu kurang tepat — tinggal edit object di bawah,
// tidak perlu ubah struktur/kode lain.

export const CATEGORY_LABELS = {
  jinchuriki: 'Jinchuriki',
  kage: 'Kage',
  genin: 'Genin',
  warArc: 'War Arc',
  godLevel: 'God Level',
  edoTensei: 'Edo Tensei',
  awakening: 'Awakening'
};


export const ELEMENT_META = {
  fire: { id: 'fire', label: 'Fire', kanji: '\u706B', symbol: '\uD83D\uDD25', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.18)', border: 'rgba(239, 68, 68, 0.45)' },
  wind: { id: 'wind', label: 'Wind', kanji: '\u98A8', symbol: '\uD83C\uDF2A\uFE0F', color: '#10b981', bg: 'rgba(16, 185, 129, 0.18)', border: 'rgba(16, 185, 129, 0.45)' },
  lightning: { id: 'lightning', label: 'Lightning', kanji: '\u96F7', symbol: '\u26A1', color: '#eab308', bg: 'rgba(234, 179, 8, 0.18)', border: 'rgba(234, 179, 8, 0.45)' },
  earth: { id: 'earth', label: 'Earth', kanji: '\u571F', symbol: '\uD83E\uDEA8', color: '#b45309', bg: 'rgba(180, 83, 9, 0.18)', border: 'rgba(180, 83, 9, 0.45)' },
  water: { id: 'water', label: 'Water', kanji: '\u6C34', symbol: '\uD83D\uDCA7', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.18)', border: 'rgba(59, 130, 246, 0.45)' },
  yin: { id: 'yin', label: 'Yin-Yang', kanji: '\u9670\u967D', symbol: '\u262F\uFE0F', color: '#a855f7', bg: 'rgba(168, 85, 247, 0.18)', border: 'rgba(168, 85, 247, 0.45)' },
  neutral: { id: 'neutral', label: 'Neutral', kanji: '\u7121', symbol: '\u26AA', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.18)', border: 'rgba(148, 163, 184, 0.45)' }
};
export const CHARACTER_META = {
  11: { tags: ['warArc'], team: [], village: 'Iwagakure', clan: null , element: 'earth'}, // Akatsuchi
  12: { tags: [], team: [], village: 'Konohagakure', clan: null , element: 'fire'}, // Anko Mitarashi
  13: { tags: [], team: [], village: 'Kirigakure', clan: null , element: 'water'}, // Ao
  14: { tags: [], team: ['Team Asuma'], village: 'Konohagakure', clan: 'Sarutobi' , element: 'wind'}, // Asuma Sarutobi
  15: { tags: [], team: ['Kara'], village: null, clan: null , element: 'neutral'}, // Boro
  16: { tags: ['genin'], team: ['Team Konohamaru'], village: 'Konohagakure', clan: 'Uzumaki' , element: 'lightning'}, // Boruto
  17: { tags: ['awakening'], team: ['Team Konohamaru'], village: 'Konohagakure', clan: 'Uzumaki' , element: 'lightning'}, // Boruto Karma
  18: { tags: [], team: [], village: 'Kirigakure', clan: null , element: 'water'}, // Kagura Karatachi
  19: { tags: ['genin'], team: [], village: 'Konohagakure', clan: null , element: 'water'}, // Sumire Genin
  20: { tags: ['genin'], team: [], village: 'Sunagakure', clan: null , element: 'neutral'}, // Araya
  21: { tags: ['genin'], team: ['Team 10 (Boruto)'], village: 'Konohagakure', clan: 'Akimichi' , element: 'neutral'}, // Chouchou Akimichi
  22: { tags: ['genin'], team: ['Team 10 (Boruto)'], village: 'Konohagakure', clan: 'Yamanaka' , element: 'yin'}, // Inojin Yamanaka
  23: { tags: ['genin'], team: ['Team 10 (Boruto)'], village: 'Konohagakure', clan: 'Nara' , element: 'yin'}, // Shikadai Nara
  24: { tags: ['genin'], team: [], village: 'Sunagakure', clan: null , element: 'earth'}, // Shinki
  25: { tags: ['genin'], team: [], village: 'Sunagakure', clan: null , element: 'wind'}, // Yodo
  26: { tags: [], team: [], village: 'Kumogakure', clan: null , element: 'lightning'}, // Cee
  27: { tags: [], team: [], village: 'Sunagakure', clan: null , element: 'neutral'}, // Lady Chiyo
  28: { tags: [], team: ['Team Asuma'], village: 'Konohagakure', clan: 'Akimichi' , element: 'neutral'}, // Choji (Shippuden)
  29: { tags: ['warArc'], team: ['Team Asuma'], village: 'Konohagakure', clan: 'Akimichi' , element: 'neutral'}, // Choji (War Arc)
  30: { tags: ['genin'], team: ['Team Asuma'], village: 'Konohagakure', clan: 'Akimichi' , element: 'neutral'}, // Choji (Part 1)
  31: { tags: ['warArc'], team: ['Seven Ninja Swordsmen'], village: 'Kirigakure', clan: null , element: 'water'}, // Chojuro
  32: { tags: ['kage'], team: ['Root/Anbu'], village: 'Konohagakure', clan: null , element: 'wind'}, // Danzo Shimura
  33: { tags: ['warArc'], team: [], village: 'Kumogakure', clan: null , element: 'lightning'}, // Darui
  34: { tags: [], team: ['Akatsuki'], village: 'Iwagakure', clan: null , element: 'earth'}, // Deidara
  35: { tags: ['warArc', 'edoTensei'], team: ['Akatsuki'], village: 'Iwagakure', clan: null , element: 'earth'}, // Deidara Reanimation
  36: { tags: [], team: ['Kara'], village: null, clan: null , element: 'neutral'}, // Delta
  37: { tags: [], team: ['Root/Anbu'], village: 'Konohagakure', clan: 'Yamanaka' , element: 'yin'}, // Foo Yamanaka
  38: { tags: ['jinchuriki'], team: [], village: 'Takigakure', clan: null, summons: ['chomei'] , element: 'wind'}, // Fuu
  39: { tags: ['jinchuriki', 'edoTensei', 'warArc'], team: [], village: 'Takigakure', clan: null, summons: ['chomei'] , element: 'wind'}, // Fuu Reanimation
  40: { tags: ['kage', 'warArc'], team: [], village: 'Sunagakure', clan: null, summons: ['shukaku'] , element: 'earth'}, // Gaara (War)
  41: { tags: ['jinchuriki', 'kage'], team: [], village: 'Sunagakure', clan: null, summons: ['shukaku'] , element: 'earth'}, // Gaara (5th Kazekage)
  42: { tags: ['jinchuriki'], team: [], village: 'Sunagakure', clan: null, summons: ['shukaku'] , element: 'earth'}, // Gaara (Part 1)
  43: { tags: [], team: ['Team Guy'], village: 'Konohagakure', clan: null , element: 'neutral'}, // Might Guy (Base)
  44: { tags: ['warArc', 'awakening'], team: ['Team Guy'], village: 'Konohagakure', clan: null , element: 'fire'}, // Might Guy (8 Gates)
  45: { tags: [], team: [], village: 'Kirigakure', clan: null , element: 'water'}, // Haku
  46: { tags: ['edoTensei', 'warArc'], team: [], village: 'Kirigakure', clan: null , element: 'water'}, // Haku Reanimation
  47: { tags: [], team: [], village: 'Amegakure', clan: null , element: 'water'}, // Hanzo
  48: { tags: ['edoTensei', 'warArc'], team: [], village: 'Amegakure', clan: null , element: 'water'}, // Hanzo Reanimation
  49: { tags: ['jinchuriki'], team: [], village: 'Iwagakure', clan: null, summons: ['kokuo'] , element: 'fire'}, // Han
  50: { tags: ['jinchuriki', 'edoTensei', 'warArc'], team: [], village: 'Iwagakure', clan: null, summons: ['kokuo'] , element: 'fire'}, // Han Reanimation
  51: { tags: ['kage', 'godLevel', 'edoTensei'], team: [], village: 'Konohagakure', clan: 'Senju' , element: 'earth'}, // Hashirama (Sage)
  52: { tags: ['kage', 'godLevel'], team: [], village: 'Konohagakure', clan: 'Senju' , element: 'earth'}, // Hashirama (Alive)
  53: { tags: [], team: ['Akatsuki'], village: 'Yugakure', clan: null , element: 'yin'}, // Hidan
  54: { tags: [], team: ['Team Kurenai'], village: 'Konohagakure', clan: 'Hyuga' , element: 'neutral'}, // Hinata (Shippuden)
  55: { tags: ['warArc'], team: ['Team Kurenai'], village: 'Konohagakure', clan: 'Hyuga' , element: 'neutral'}, // Hinata (Twin Lion)
  56: { tags: ['genin'], team: ['Team Kurenai'], village: 'Konohagakure', clan: 'Hyuga' , element: 'neutral'}, // Hinata (Part 1)
  57: { tags: ['kage'], team: [], village: 'Konohagakure', clan: 'Sarutobi' , element: 'fire'}, // Hiruzen
  58: { tags: ['kage', 'edoTensei', 'warArc'], team: [], village: 'Konohagakure', clan: 'Sarutobi' , element: 'fire'}, // Hiruzen Reanimation
  59: { tags: [], team: ['Team Asuma'], village: 'Konohagakure', clan: 'Yamanaka' , element: 'yin'}, // Ino (Shippuden)
  60: { tags: ['genin'], team: ['Team Asuma'], village: 'Konohagakure', clan: 'Yamanaka' , element: 'yin'}, // Ino (Part 1)
  61: { tags: ['warArc'], team: ['Team Asuma'], village: 'Konohagakure', clan: 'Yamanaka' , element: 'yin'}, // Ino (War Arc)
  62: { tags: [], team: ['Akatsuki'], village: 'Konohagakure', clan: 'Uchiha', summons: ['crow', 'Itachi First Susanoo', 'Itachi Perfect Susanoo'] , element: 'fire'}, // Itachi (Akatsuki)
  63: { tags: ['edoTensei', 'warArc'], team: ['Akatsuki'], village: 'Konohagakure', clan: 'Uchiha', summons: ['crow', 'Itachi Perfect Susanoo'] , element: 'fire'}, // Itachi Reanimation
  64: { tags: ['godLevel'], team: ['Kara'], village: null, clan: null , element: 'neutral'}, // Jigen
  65: { tags: [], team: ['Sannin'], village: 'Konohagakure', clan: null, summons: ['gamabunta', 'gamakichi'] , element: 'fire'}, // Jiraiya
  66: { tags: [], team: ['Sound Four'], village: 'Otogakure', clan: null , element: 'earth'}, // Jirobo
  67: { tags: [], team: ['Team Taka'], village: 'Otogakure', clan: null , element: 'neutral'}, // Jugo
  68: { tags: [], team: [], village: 'Otogakure', clan: null , element: 'water'}, // Kabuto (Part 1)
  69: { tags: ['awakening', 'warArc'], team: [], village: 'Otogakure', clan: null , element: 'earth'}, // Kabuto (Sage)
  70: { tags: ['awakening', 'warArc'], team: [], village: 'Otogakure', clan: null , element: 'earth'}, // Kabuto (Snake Cloak)
  71: { tags: ['godLevel'], team: [], village: null, clan: 'Otsutsuki', summons: ['juubi'] , element: 'yin'}, // Kaguya
  72: { tags: [], team: ['Team Minato'], village: 'Konohagakure', clan: null , element: 'lightning'}, // Kakashi (Part 1)
  73: { tags: ['warArc'], team: ['Team 7'], village: 'Konohagakure', clan: null , element: 'lightning'}, // Kakashi Sharingan
  74: { tags: ['awakening', 'warArc'], team: ['Team 7'], village: 'Konohagakure', clan: null, summons: ['Kakashi Perfect Susanoo'] , element: 'lightning'}, // Kakashi Double Sharingan
  75: { tags: ['kage'], team: [], village: 'Konohagakure', clan: null, summons: ['Kakashi Perfect Susanoo'] , element: 'lightning'}, // Kakashi 6th Hokage
  76: { tags: [], team: ['Akatsuki'], village: 'Takigakure', clan: null , element: 'earth'}, // Kakuzu
  77: { tags: ['edoTensei', 'warArc'], team: ['Akatsuki'], village: 'Takigakure', clan: null , element: 'earth'}, // Kakuzu Reanimation
  78: { tags: [], team: [], village: 'Sunagakure', clan: null , element: 'neutral'}, // Kankuro (Shippuden)
  79: { tags: ['warArc'], team: [], village: 'Sunagakure', clan: null , element: 'neutral'}, // Kankuro (War Arc)
  80: { tags: ['genin'], team: [], village: 'Sunagakure', clan: null , element: 'neutral'}, // Kankuro (Part 1)
  81: { tags: [], team: ['Team Taka'], village: 'Otogakure', clan: 'Uzumaki' , element: 'neutral'}, // Karin Uzumaki
  82: { tags: [], team: [], village: 'Konohagakure', clan: null , element: 'fire'}, // Kawaki
  83: { tags: ['awakening'], team: [], village: 'Konohagakure', clan: null , element: 'fire'}, // Kawaki Karma
  84: { tags: ['warArc'], team: ['Team Kurenai'], village: 'Konohagakure', clan: 'Inuzuka' , element: 'neutral'}, // Kiba (War Arc)
  85: { tags: ['genin'], team: ['Team Kurenai'], village: 'Konohagakure', clan: 'Inuzuka' , element: 'neutral'}, // Kiba (Part 1)
  86: { tags: [], team: ['Team Kurenai'], village: 'Konohagakure', clan: 'Inuzuka' , element: 'neutral'}, // Kiba (Shippuden)
  87: { tags: [], team: ['Sound Four'], village: 'Otogakure', clan: null , element: 'neutral'}, // Kidomaru
  88: { tags: ['jinchuriki', 'warArc'], team: [], village: 'Kumogakure', clan: null, summons: ['gyuki'] , element: 'lightning'}, // Killer Bee
  89: { tags: [], team: [], village: 'Otogakure', clan: 'Kaguya' , element: 'neutral'}, // Kimimaro
  90: { tags: ['godLevel'], team: ['Otsutsuki'], village: null, clan: 'Otsutsuki' , element: 'neutral'}, // Kinshiki
  91: { tags: [], team: ['Akatsuki', 'Seven Ninja Swordsmen'], village: 'Kirigakure', clan: null , element: 'water'}, // Kisame
  92: { tags: [], team: ['Kara'], village: null, clan: null , element: 'fire'}, // Koji Kashin
  93: { tags: [], team: ['Akatsuki'], village: 'Amegakure', clan: null , element: 'wind'}, // Konan
  94: { tags: ['genin'], team: [], village: 'Konohagakure', clan: 'Sarutobi' , element: 'fire'}, // Konohamaru (Part 1)
  95: { tags: [], team: ['Team Kurenai'], village: 'Konohagakure', clan: null , element: 'yin'}, // Kurenai
  96: { tags: ['warArc'], team: [], village: 'Iwagakure', clan: null , element: 'earth'}, // Kurotsuchi
  97: { tags: ['jinchuriki'], team: [], village: 'Konohagakure', clan: 'Uzumaki' , element: 'neutral'}, // Kushina
  98: { tags: ['godLevel'], team: [], village: 'Konohagakure', clan: 'Uchiha', summons: ['Madara Perfect Susanoo'] , element: 'fire'}, // Madara (Alive)
  99: { tags: ['edoTensei', 'godLevel', 'warArc'], team: [], village: 'Konohagakure', clan: 'Uchiha', summons: ['Madara Perfect Susanoo'] , element: 'fire'}, // Madara Reanimation
  100: { tags: ['godLevel', 'awakening', 'warArc'], team: [], village: 'Konohagakure', clan: 'Uchiha', summons: ['Madara Perfect Susanoo', 'juubi'] , element: 'yin'}, // Madara (Six Paths)
  101: { tags: ['kage', 'warArc'], team: [], village: 'Kirigakure', clan: null , element: 'water'}, // Mei Terumi
  102: { tags: ['warArc'], team: [], village: null, clan: null , element: 'neutral'}, // Mifune
  103: { tags: ['kage'], team: ['Team Minato'], village: 'Konohagakure', clan: null, summons: ['gamabunta', 'gamakichi'] , element: 'wind'}, // Minato (4th Hokage)
  104: { tags: ['kage', 'edoTensei', 'warArc'], team: [], village: 'Konohagakure', clan: null, summons: ['gamabunta', 'gamakichi'] , element: 'wind'}, // Minato Reanimation
  105: { tags: ['kage', 'awakening', 'warArc'], team: [], village: 'Konohagakure', clan: null, summons: ['gamabunta', 'gamakichi'] , element: 'wind'}, // Minato (KCM)
  106: { tags: ['genin'], team: ['Team Konohamaru'], village: 'Konohagakure', clan: null , element: 'wind'}, // Mitsuki
  107: { tags: ['godLevel'], team: [], village: null, clan: 'Otsutsuki' , element: 'yin'}, // Momoshiki
  108: { tags: ['edoTensei', 'godLevel', 'warArc'], team: ['Akatsuki'], village: 'Amegakure', clan: null, summons: ['gedomazo'] , element: 'yin'}, // Nagato Reanimation
  109: { tags: ['jinchuriki'], team: ['Team 7'], village: 'Konohagakure', clan: 'Uzumaki', summons: ['kurama', 'gamakichi'] , element: 'wind'}, // Naruto (Base)
  110: { tags: ['godLevel'], team: [], village: null, clan: 'Otsutsuki' , element: 'wind'}, // Ashura Otsutsuki
  111: { tags: ['godLevel'], team: [], village: null, clan: 'Otsutsuki' , element: 'lightning'}, // Indra Otsutsuki
  112: { tags: ['jinchuriki', 'awakening', 'godLevel'], team: [], village: 'Konohagakure', clan: 'Uzumaki', summons: ['kurama'] , element: 'wind'}, // Naruto Baryon Mode
  113: { tags: ['jinchuriki', 'awakening', 'warArc'], team: ['Team 7'], village: 'Konohagakure', clan: 'Uzumaki', summons: ['kurama', 'gamabunta', 'gamakichi'] , element: 'wind'}, // Naruto (Bijuu Mode)
  114: { tags: ['jinchuriki', 'awakening', 'warArc'], team: ['Team 7'], village: 'Konohagakure', clan: 'Uzumaki', summons: ['kurama', 'gamabunta', 'gamakichi'] , element: 'wind'}, // Naruto (KCM Link)
  115: { tags: ['jinchuriki', 'genin'], team: ['Team 7'], village: 'Konohagakure', clan: 'Uzumaki', summons: ['kurama'] , element: 'wind'}, // Naruto (Part 1)
  116: { tags: ['jinchuriki', 'awakening'], team: ['Team 7'], village: 'Konohagakure', clan: 'Uzumaki', summons: ['kurama', 'gamabunta', 'gamakichi'] , element: 'wind'}, // Naruto (Sage Mode)
  117: { tags: ['jinchuriki', 'awakening', 'godLevel', 'warArc'], team: ['Team 7'], village: 'Konohagakure', clan: 'Uzumaki', summons: ['kurama'] , element: 'yin'}, // Naruto (Six Paths)
  118: { tags: ['jinchuriki', 'kage', 'godLevel'], team: [], village: 'Konohagakure', clan: 'Uzumaki', summons: ['kurama', 'gamabunta', 'gamakichi'] , element: 'wind'}, // Naruto (7th Hokage)
  119: { tags: [], team: ['Team Guy'], village: 'Konohagakure', clan: 'Hyuga' , element: 'neutral'}, // Neji (Shippuden)
  120: { tags: ['warArc'], team: ['Team Guy'], village: 'Konohagakure', clan: 'Hyuga' , element: 'neutral'}, // Neji (War Arc)
  121: { tags: ['genin'], team: ['Team Guy'], village: 'Konohagakure', clan: 'Hyuga' , element: 'neutral'}, // Neji (Part 1)
  122: { tags: ['genin'], team: ['Team Minato'], village: 'Konohagakure', clan: 'Uchiha' , element: 'fire'}, // Obito (Tobi)
  123: { tags: [], team: [], village: 'Konohagakure', clan: 'Uchiha' , element: 'fire'}, // Obito (Rampaging)
  124: { tags: ['godLevel', 'awakening'], team: [], village: 'Konohagakure', clan: 'Uchiha', summons: ['juubi'] , element: 'yin'}, // Obito (Ten-Tails)
  125: { tags: ['warArc'], team: [], village: 'Konohagakure', clan: 'Uchiha' , element: 'fire'}, // Obito (Unmasked)
  126: { tags: ['kage', 'warArc'], team: [], village: 'Iwagakure', clan: null , element: 'earth'}, // Ohnoki
  127: { tags: [], team: ['Sannin'], village: 'Otogakure', clan: null, summons: ['manda'] , element: 'wind'}, // Orochimaru
  128: { tags: [], team: ['Akatsuki'], village: 'Konohagakure', clan: null, summons: ['manda'] , element: 'wind'}, // Orochimaru (Akatsuki)
  129: { tags: ['godLevel'], team: ['Akatsuki'], village: 'Amegakure', clan: null, summons: ['gedomazo'] , element: 'yin'}, // Pain (Deva Path)
  130: { tags: ['kage', 'warArc'], team: [], village: 'Kumogakure', clan: null , element: 'lightning'}, // Ay (4th Raikage)
  131: { tags: ['genin'], team: ['Team Minato'], village: 'Konohagakure', clan: null , element: 'water'}, // Rin Nohara
  132: { tags: ['genin'], team: ['Team Guy'], village: 'Konohagakure', clan: null , element: 'neutral'}, // Rock Lee (Part 1)
  133: { tags: [], team: ['Team Guy'], village: 'Konohagakure', clan: null , element: 'neutral'}, // Rock Lee (Shippuden)
  134: { tags: ['warArc'], team: ['Team Guy'], village: 'Konohagakure', clan: null , element: 'neutral'}, // Rock Lee (6 Gates)
  135: { tags: ['jinchuriki'], team: [], village: 'Iwagakure', clan: null, summons: ['songoku'] , element: 'fire'}, // Roshi
  136: { tags: [], team: ['Team 7', 'Root/Anbu'], village: 'Konohagakure', clan: null , element: 'yin'}, // Sai (Base)
  137: { tags: ['warArc'], team: ['Team 7'], village: 'Konohagakure', clan: null , element: 'yin'}, // Sai (War Arc)
  138: { tags: [], team: ['Sound Four'], village: 'Otogakure', clan: null , element: 'neutral'}, // Sakon & Ukon
  139: { tags: ['genin'], team: ['Team 7'], village: 'Konohagakure', clan: null , element: 'earth'}, // Sakura (Part 1)
  140: { tags: [], team: ['Team 7'], village: 'Konohagakure', clan: null, summons: ['katsuyu'] , element: 'earth'}, // Sakura (Shippuden)
  141: { tags: ['warArc'], team: ['Team 7'], village: 'Konohagakure', clan: null, summons: ['katsuyu'] , element: 'earth'}, // Sakura (War Arc)
  142: { tags: ['awakening', 'warArc'], team: ['Team 7'], village: 'Konohagakure', clan: null, summons: ['katsuyu'] , element: 'earth'}, // Sakura Byakugo
  143: { tags: ['warArc'], team: [], village: null, clan: null , element: 'neutral'}, // Samurai
  144: { tags: ['genin'], team: ['Team Konohamaru'], village: 'Konohagakure', clan: 'Uchiha' , element: 'fire'}, // Sarada
  145: { tags: ['awakening'], team: ['Team Konohamaru'], village: 'Konohagakure', clan: 'Uchiha' , element: 'lightning'}, // Sarada Awakening
  146: { tags: [], team: ['Akatsuki'], village: 'Sunagakure', clan: null , element: 'neutral'}, // Sasori
  147: { tags: ['edoTensei', 'warArc'], team: ['Akatsuki'], village: 'Sunagakure', clan: null , element: 'neutral'}, // Sasori Reanimation
  148: { tags: ['genin'], team: ['Team 7'], village: 'Konohagakure', clan: 'Uchiha', summons: [] , element: 'lightning'}, // Sasuke (Part 1)
  149: { tags: [], team: ['Team Taka'], village: 'Otogakure', clan: 'Uchiha', summons: [] , element: 'lightning'}, // Sasuke Hebi
  150: { tags: [], team: ['Team Taka'], village: 'Otogakure', clan: 'Uchiha', summons: [] , element: 'lightning'}, // Sasuke Black Custom
  151: { tags: [], team: ['Team Taka'], village: 'Otogakure', clan: 'Uchiha', summons: ['Susanoo First'] , element: 'lightning'}, // Sasuke Taka
  152: { tags: ['warArc'], team: ['Team Taka'], village: 'Otogakure', clan: 'Uchiha', summons: ['Susanoo Second'] , element: 'lightning'}, // Sasuke War Arc
  153: { tags: ['godLevel', 'awakening', 'warArc'], team: ['Team 7'], village: 'Konohagakure', clan: 'Uchiha', summons: ['Perfect Susanoo', 'Indra Susanoo'] , element: 'lightning'}, // Sasuke Rinne Sharingan
  154: { tags: ['godLevel'], team: [], village: 'Konohagakure', clan: 'Uchiha', summons: ['Perfect Susanoo'] , element: 'lightning'}, // Sasuke Support Kage
  155: { tags: [], team: ['Team Asuma'], village: 'Konohagakure', clan: 'Nara' , element: 'yin'}, // Shikamaru (Shippuden)
  156: { tags: ['warArc'], team: ['Team Asuma'], village: 'Konohagakure', clan: 'Nara' , element: 'yin'}, // Shikamaru (War Arc)
  157: { tags: ['genin'], team: ['Team Asuma'], village: 'Konohagakure', clan: 'Nara' , element: 'yin'}, // Shikamaru (Part 1)
  158: { tags: [], team: ['Team Kurenai'], village: 'Konohagakure', clan: 'Aburame' , element: 'neutral'}, // Shino (Shippuden)
  159: { tags: ['warArc'], team: ['Team Kurenai'], village: 'Konohagakure', clan: 'Aburame' , element: 'neutral'}, // Shino (War Arc)
  160: { tags: ['genin'], team: ['Team Kurenai'], village: 'Konohagakure', clan: 'Aburame' , element: 'neutral'}, // Shino (Part 1)
  161: { tags: [], team: ['Root/Anbu'], village: 'Konohagakure', clan: 'Uchiha', summons: ['Shisui Perfect Susanoo'] , element: 'fire'}, // Shisui
  162: { tags: [], team: [], village: 'Konohagakure', clan: null , element: 'neutral'}, // Shizune
  163: { tags: [], team: ['Team Taka', 'Seven Ninja Swordsmen'], village: 'Kirigakure', clan: 'Hozuki' , element: 'water'}, // Suigetsu
  164: { tags: [], team: ['Sound Four'], village: 'Otogakure', clan: null , element: 'yin'}, // Tayuya
  165: { tags: [], team: [], village: 'Sunagakure', clan: null , element: 'wind'}, // Temari (Shippuden)
  166: { tags: ['warArc'], team: [], village: 'Sunagakure', clan: null , element: 'wind'}, // Temari (War Arc)
  167: { tags: ['genin'], team: [], village: 'Sunagakure', clan: null , element: 'wind'}, // Temari (Part 1)
  168: { tags: [], team: ['Team Guy'], village: 'Konohagakure', clan: null , element: 'neutral'}, // Tenten (Shippuden)
  169: { tags: ['genin'], team: ['Team Guy'], village: 'Konohagakure', clan: null , element: 'neutral'}, // Tenten (Part 1)
  170: { tags: ['warArc'], team: ['Team Guy'], village: 'Konohagakure', clan: null , element: 'wind'}, // Tenten (Bashosen)
  171: { tags: ['kage', 'edoTensei', 'warArc'], team: [], village: 'Sunagakure', clan: null , element: 'earth'}, // Rasa (4th Kazekage)
  172: { tags: ['kage', 'edoTensei', 'warArc'], team: [], village: 'Kirigakure', clan: null , element: 'water'}, // Gengetsu (2nd Mizukage)
  173: { tags: ['kage', 'edoTensei', 'warArc'], team: [], village: 'Iwagakure', clan: null , element: 'earth'}, // Mu (2nd Tsuchikage)
  174: { tags: ['kage', 'edoTensei', 'warArc'], team: [], village: 'Kumogakure', clan: null , element: 'lightning'}, // A (3rd Raikage)
  175: { tags: ['kage'], team: [], village: 'Konohagakure', clan: 'Senju' , element: 'water'}, // Tobirama (2nd Hokage)
  176: { tags: ['kage', 'edoTensei', 'warArc'], team: [], village: 'Konohagakure', clan: 'Senju' , element: 'water'}, // Tobirama Reanimation
  177: { tags: [], team: ['Akatsuki'], village: 'Konohagakure', clan: 'Uchiha' , element: 'fire'}, // Tobi (Akatsuki)
  178: { tags: ['warArc', 'godLevel'], team: [], village: 'Konohagakure', clan: 'Uchiha' , element: 'fire'}, // Tobi Great War
  179: { tags: ['godLevel'], team: [], village: null, clan: 'Otsutsuki' , element: 'yin'}, // Toneri
  180: { tags: [], team: ['Root/Anbu'], village: 'Konohagakure', clan: null , element: 'neutral'}, // Torune
  181: { tags: ['kage', 'warArc'], team: ['Sannin'], village: 'Konohagakure', clan: null, summons: ['katsuyu'] , element: 'neutral'}, // Tsunade
  182: { tags: ['jinchuriki'], team: [], village: 'Kirigakure', clan: null, summons: ['saiken'] , element: 'water'}, // Utakata
  183: { tags: ['jinchuriki', 'edoTensei', 'warArc'], team: [], village: 'Kirigakure', clan: null, summons: ['saiken'] , element: 'water'}, // Utakata Reanimation
  184: { tags: ['jinchuriki', 'kage'], team: [], village: 'Kirigakure', clan: null, summons: ['isobu'] , element: 'water'}, // Yagura
  185: { tags: ['jinchuriki', 'kage', 'edoTensei', 'warArc'], team: [], village: 'Kirigakure', clan: null, summons: ['isobu'] , element: 'water'}, // Yagura Reanimation
  186: { tags: [], team: ['Team 7'], village: 'Konohagakure', clan: null , element: 'earth'}, // Yamato
  187: { tags: ['jinchuriki'], team: [], village: 'Kumogakure', clan: null, summons: ['matatabi'] , element: 'fire'}, // Yugito Nii
  188: { tags: ['jinchuriki', 'edoTensei', 'warArc'], team: [], village: 'Kumogakure', clan: null, summons: ['matatabi'] , element: 'fire'}, // Yugito Reanimation
  189: { tags: [], team: ['Seven Ninja Swordsmen'], village: 'Kirigakure', clan: null , element: 'water'}, // Zabuza
  190: { tags: ['edoTensei', 'warArc'], team: ['Seven Ninja Swordsmen'], village: 'Kirigakure', clan: null , element: 'water'}, // Zabuza Reanimation
  191: { tags: ['awakening', 'godLevel'], team: [], village: 'Konohagakure', clan: 'Uzumaki' , element: 'lightning'}, // Boruto Karma Progression
  192: { tags: ['kage'], team: ['Seven Ninja Swordsmen'], village: 'Kirigakure', clan: null , element: 'water'}, // Chojuro (6th Mizukage)
  193: { tags: ['godLevel'], team: ['Kara'], village: null, clan: null , element: 'neutral'}, // Code
  194: { tags: ['godLevel'], team: ['Kara'], village: null, clan: null , element: 'neutral'}, // Daemon
  195: { tags: ['kage'], team: [], village: 'Kumogakure', clan: null , element: 'lightning'}, // Darui (5th Raikage)
  196: { tags: [], team: ['Akatsuki'], village: 'Iwagakure', clan: null , element: 'earth'}, // Deidara (Akatsuki Inception)
  197: { tags: ['godLevel'], team: ['Kara'], village: null, clan: null , element: 'neutral'}, // Eida
  198: { tags: [], team: [], village: 'Konohagakure', clan: 'Hyuga' , element: 'neutral'}, // Hanabi Hyuga (Jounin)
  199: { tags: [], team: ['Akatsuki'], village: 'Yugakure', clan: null , element: 'yin'}, // Hidan (Akatsuki Inception)
  200: { tags: [], team: [], village: 'Konohagakure', clan: 'Hyuga' , element: 'neutral'}, // Hinata Hyuga (Adult)
  201: { tags: [], team: [], village: 'Konohagakure', clan: 'Hyuga' , element: 'neutral'}, // Hinata Hyuga (The Last)
  202: { tags: [], team: [], village: 'Konohagakure', clan: 'Yamanaka' , element: 'yin'}, // Ino Yamanaka (Adult)
  203: { tags: ['godLevel'], team: [], village: null, clan: 'Otsutsuki' , element: 'yin'}, // Isshiki Otsutsuki
  204: { tags: [], team: ['Root/Anbu'], village: 'Konohagakure', clan: 'Uchiha', summons: ['crow'] , element: 'fire'}, // Itachi Uchiha (Anbu)
  205: { tags: [], team: ['Sannin'], village: 'Konohagakure', clan: null, summons: ['gamabunta', 'gamakichi'] , element: 'fire'}, // Jiraiya (Sannin Era)
  206: { tags: ['awakening'], team: ['Sannin'], village: 'Konohagakure', clan: null, summons: ['gamabunta', 'gamakichi'] , element: 'fire'}, // Jiraiya (Sage Mode)
  207: { tags: [], team: ['Akatsuki'], village: 'Takigakure', clan: null , element: 'earth'}, // Kakuzu (Akatsuki Inception)
  208: { tags: [], team: [], village: 'Sunagakure', clan: null , element: 'neutral'}, // Kankuro (Adult)
  209: { tags: ['awakening', 'godLevel'], team: [], village: 'Konohagakure', clan: null , element: 'fire'}, // Kawaki (Karma Progression)
  210: { tags: ['kage'], team: [], village: 'Sunagakure', clan: null, summons: ['shukaku'] , element: 'earth'}, // Gaara (Kazekage)
  211: { tags: [], team: [], village: 'Konohagakure', clan: 'Inuzuka' , element: 'neutral'}, // Kiba Inuzuka (Adult)
  212: { tags: ['kage'], team: [], village: 'Iwagakure', clan: null , element: 'earth'}, // Kurotsuchi (4th Tsuchikage)
  213: { tags: ['warArc'], team: ['Seven Ninja Swordsmen'], village: 'Kirigakure', clan: 'Hozuki' , element: 'water'}, // Mangetsu Hozuki
  214: { tags: [], team: [], village: 'Konohagakure', clan: 'Sarutobi' , element: 'wind'}, // Mirai Sarutobi
  215: { tags: [], team: [], village: 'Konohagakure', clan: null , element: 'earth'}, // Mugino
  216: { tags: ['jinchuriki', 'godLevel'], team: [], village: 'Konohagakure', clan: 'Uzumaki', summons: ['kurama', 'gamabunta', 'gamakichi'] , element: 'wind'}, // Naruto Uzumaki (The Last)
  217: { tags: [], team: ['Sannin'], village: 'Konohagakure', clan: null, summons: ['manda'] , element: 'wind'}, // Orochimaru (Sannin Era)
  218: { tags: [], team: [], village: 'Konohagakure', clan: null , element: 'neutral'}, // Rock Lee (Adult)
  219: { tags: [], team: [], village: 'Konohagakure', clan: 'Yamanaka' , element: 'yin'}, // Sai Yamanaka (Adult)
  220: { tags: [], team: [], village: 'Konohagakure', clan: null, summons: ['katsuyu'] , element: 'earth'}, // Sakura Haruno (Adult)
  221: { tags: [], team: [], village: 'Konohagakure', clan: null, summons: ['katsuyu'] , element: 'earth'}, // Sakura Haruno (The Last)
  222: { tags: [], team: ['Akatsuki'], village: 'Sunagakure', clan: null , element: 'neutral'}, // Sasori (Akatsuki Inception)
  223: { tags: [], team: ['Team Taka', 'Akatsuki'], village: 'Otogakure', clan: 'Uchiha', summons: ['Susanoo First'] , element: 'lightning'}, // Sasuke Uchiha (Taka/Akatsuki)
  224: { tags: ['godLevel'], team: [], village: 'Konohagakure', clan: 'Uchiha', summons: ['Perfect Susanoo'] , element: 'lightning'}, // Sasuke Uchiha (The Last)
  225: { tags: [], team: [], village: 'Konohagakure', clan: 'Nara' , element: 'yin'}, // Shikamaru Nara (Adult)
  226: { tags: [], team: [], village: 'Konohagakure', clan: 'Aburame' , element: 'neutral'}, // Shino Aburame (Adult)
  227: { tags: [], team: [], village: 'Sunagakure', clan: null , element: 'wind'}, // Temari (Adult)
  228: { tags: [], team: [], village: 'Konohagakure', clan: null , element: 'neutral'}, // Tenten (Adult)
  229: { tags: [], team: ['Sannin'], village: 'Konohagakure', clan: null, summons: ['katsuyu'] , element: 'neutral'}, // Tsunade (Sannin Era)
  230: { tags: ['warArc', 'awakening'], team: ['Team Asuma'], village: 'Konohagakure', clan: 'Akimichi' , element: 'neutral'}, // Choji Akimichi (Butterfly Mode)
  231: { tags: [], team: [], village: 'Konohagakure', clan: 'Akimichi' , element: 'neutral'}, // Choji Akimichi (Adult)
  232: { tags: ['godLevel'], team: [], village: null, clan: 'Otsutsuki' , element: 'yin'}, // Hagoromo Otsutsuki
  233: { tags: [], team: ['Akatsuki'], village: 'Amegakure', clan: null , element: 'wind'}, // Konan (Akatsuki Inception)
  234: { tags: [], team: ['Akatsuki'], village: 'Amegakure', clan: null , element: 'water'}, // Yahiko (Akatsuki Inception)
  235: { tags: [], team: ['Akatsuki'], village: null, clan: null , element: 'earth'}, // Zetsu
  236: { tags: [], team: ['Akatsuki'], village: 'Amegakure', clan: null, summons: ['gedomazo'] , element: 'yin'}, // Nagato (Akatsuki Inception)
  237: { tags: ['godLevel'], team: [], village: 'Konohagakure', clan: 'Uchiha', summons: ['Perfect Susanoo'] , element: 'lightning'}, // Sasuke Uchiha (Adult)
  238: { tags: ['edoTensei'], team: ['Team Asuma'], village: 'Konohagakure', clan: 'Sarutobi' , element: 'wind'}, // Asuma (Reanimation)
  239: { tags: ['edoTensei'], team: [], village: 'Kumogakure', clan: null , element: 'lightning'}, // Ginkaku (Reanimation)
  240: { tags: [], team: ['Team Guy'], village: 'Konohagakure', clan: null , element: 'neutral'}, // Might Guy (Shippuden)
  241: { tags: ['godLevel', 'edoTensei'], team: [], village: 'Konohagakure', clan: 'Senju' , element: 'earth'}, // Hashirama (Edo Tensei)
  242: { tags: [], team: ['Team 7'], village: 'Konohagakure', clan: null , element: 'lightning'}, // Kakashi Hatake (Shippuden)
  243: { tags: [], team: [], village: 'Sunagakure', clan: null , element: 'neutral'}, // Kankuro (Five Kage Summit)
  244: { tags: ['jinchuriki'], team: [], village: 'Kumogakure', clan: null, summons: ['gyuki'] , element: 'lightning'}, // Killer Bee
  245: { tags: ['edoTensei'], team: [], village: 'Kumogakure', clan: null , element: 'lightning'}, // Kinkaku (Reanimation)
  246: { tags: [], team: ['Team Konohamaru'], village: 'Konohagakure', clan: 'Sarutobi' , element: 'fire'}, // Konohamaru Sarutobi
  247: { tags: [], team: [], village: null, clan: 'Uchiha' , element: 'fire'}, // Masked Man (Obito)
  248: { tags: [], team: ['Team Minato'], village: 'Konohagakure', clan: null , element: 'wind'}, // Minato Namikaze (Jounin)
  249: { tags: ['awakening'], team: [], village: 'Otogakure', clan: 'Uchiha', summons: [] , element: 'lightning'}, // Sasuke (Cursed Seal Stage 2)
  250: { tags: [], team: [], village: 'Sunagakure', clan: null , element: 'wind'}, // Temari (Five Kage Summit)
  251: { tags: ['edoTensei'], team: [], village: 'Sunagakure', clan: null , element: 'neutral'}, // Lady Chiyo
  252: { tags: ['jinchuriki', 'genin'], team: ['Team 7'], village: 'Konohagakure', clan: 'Uzumaki', summons: ['kurama', 'gamabunta', 'gamakichi'] , element: 'wind'}, // Naruto (chunin)
  253: { tags: ['jinchuriki', 'genin', 'awakening'], team: ['Team 7'], village: 'Konohagakure', clan: 'Uzumaki', summons: ['kurama', 'gamabunta', 'gamakichi'] , element: 'wind'},
  254: { tags: ['genin', 'awakening'], team: ['Team 7'], village: 'Konohagakure', clan: 'Uchiha', summons: [] , element: 'lightning'}, // Sasuke cursed mark


};

export function getCharacterMeta(id) {
  return CHARACTER_META[id] || { tags: [], team: [], village: null, clan: null, element: 'neutral' };
}

