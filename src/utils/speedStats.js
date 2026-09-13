// speedStats.js
// Field SPD (Speed) untuk semua 227 kartu.
// Sumber: cross-reference dari database project lama (OFFICIAL_CHARACTER_DATA)
// berdasarkan kecocokan nama karakter. Kartu yang gak ada versi persis di
// project lama (terutama karakter Boruto-era baru & varian kartu spesifik)
// dikasih estimasi berdasarkan tier/rarity karakter yang mirip — ditandai
// komentar "(est)".
//
// Cara pakai: sama seperti characterMeta.js, tinggal import getSpeedStat(id)
// dan gabungkan ke processRawCards() di cardData.js.

export const SPD_BY_ID = {
  11: 65,   // Akatsuchi
  12: 80,   // Anko Mitarashi
  13: 76,   // Ao
  14: 81,   // Asuma Sarutobi
  15: 82,   // Boro (est)
  16: 78,   // Boruto
  17: 90,   // Boruto Karma (est)
  18: 84,   // Kagura Karatachi (est)
  19: 76,   // Sumire Genin (est)
  20: 74,   // Araya (est)
  21: 80,   // Chouchou Akimichi (est)
  22: 80,   // Inojin Yamanaka (est)
  23: 78,   // Shikadai Nara (est)
  24: 78,   // Shinki (est)
  25: 78,   // Yodo (est)
  26: 78,   // Cee
  27: 78,   // Lady Chiyo
  28: 68,   // Choji (Shippuden)
  29: 75,   // Choji (War Arc) (est)
  30: 58,   // Choji (Part 1)
  31: 84,   // Chojuro
  32: 82,   // Danzo Shimura
  33: 78,   // Darui (base) (est, lower than awakening)
  34: 85,   // Deidara
  35: 85,   // Deidara Reanimation (est)
  36: 86,   // Delta (est)
  37: 80,   // Foo Yamanaka
  38: 91,   // Fuu
  39: 91,   // Fuu Reanimation (est)
  40: 82,   // Gaara (War)
  41: 80,   // Gaara (5th Kazekage)
  42: 70,   // Gaara (Part 1)
  43: 92,   // Might Guy (Base)
  44: 99,   // Might Guy (8 Gates)
  45: 86,   // Haku
  46: 88,   // Haku Reanimation
  47: 85,   // Hanzo
  48: 84,   // Hanzo Reanimation
  49: 85,   // Han
  50: 85,   // Han Reanimation (est)
  51: 92,   // Hashirama (Sage)
  52: 88,   // Hashirama (Alive) (est)
  53: 80,   // Hidan
  54: 76,   // Hinata (Shippuden)
  55: 81,   // Hinata (Twin Lion)
  56: 68,   // Hinata (Part 1)
  57: 85,   // Hiruzen
  58: 85,   // Hiruzen Reanimation (est)
  59: 74,   // Ino (Shippuden)
  60: 65,   // Ino (Part 1)
  61: 76,   // Ino (War Arc)
  62: 95,   // Itachi (Akatsuki)
  63: 95,   // Itachi Reanimation (est)
  64: 95,   // Jigen (est)
  65: 89,   // Jiraiya
  66: 58,   // Jirobo
  67: 75,   // Jugo
  68: 82,   // Kabuto (Part 1)
  69: 93,   // Kabuto (Sage)
  70: 88,   // Kabuto (Snake Cloak)
  71: 99,   // Kaguya
  72: 75,   // Kakashi (Part 1) (est)
  73: 91,   // Kakashi Sharingan
  74: 97,   // Kakashi Double Sharingan
  75: 96,   // Kakashi 6th Hokage (est)
  76: 82,   // Kakuzu
  77: 82,   // Kakuzu Reanimation (est)
  78: 72,   // Kankuro (Shippuden)
  79: 76,   // Kankuro (War Arc)
  80: 65,   // Kankuro (Part 1)
  81: 75,   // Karin Uzumaki
  82: 85,   // Kawaki (est)
  83: 93,   // Kawaki Karma (est)
  84: 85,   // Kiba (War Arc)
  85: 72,   // Kiba (Part 1)
  86: 82,   // Kiba (Shippuden)
  87: 75,   // Kidomaru
  88: 90,   // Killer Bee
  89: 84,   // Kimimaro
  90: 88,   // Kinshiki
  91: 83,   // Kisame
  92: 90,   // Koji Kashin (est)
  93: 89,   // Konan
  94: 62,   // Konohamaru (Part 1)
  95: 78,   // Kurenai
  96: 78,   // Kurotsuchi
  97: 80,   // Kushina
  98: 94,   // Madara (Alive)
  99: 94,   // Madara Reanimation (est)
  100: 97,  // Madara (Six Paths)
  101: 84,  // Mei Terumi
  102: 89,  // Mifune
  103: 99,  // Minato (4th Hokage)
  104: 99,  // Minato Reanimation (est)
  105: 99,  // Minato (KCM) (est)
  106: 84,  // Mitsuki
  107: 97,  // Momoshiki
  108: 97,  // Nagato Reanimation (est)
  109: 81,  // Naruto (Base)
  110: 95,  // Ashura Otsutsuki
  111: 96,  // Indra Otsutsuki
  112: 99,  // Naruto Baryon Mode (est)
  113: 96,  // Naruto (Bijuu Mode)
  114: 97,  // Naruto (KCM Link)
  115: 72,  // Naruto (Part 1)
  116: 90,  // Naruto (Sage Mode)
  117: 99,  // Naruto (Six Paths)
  118: 96,  // Naruto (7th Hokage)
  119: 84,  // Neji (Shippuden)
  120: 86,  // Neji (War Arc)
  121: 76,  // Neji (Part 1)
  122: 88,  // Obito (Tobi)
  123: 91,  // Obito (Rampaging)
  124: 95,  // Obito (Ten-Tails)
  125: 94,  // Obito (Unmasked)
  126: 75,  // Ohnoki
  127: 89,  // Orochimaru
  128: 88,  // Orochimaru (Akatsuki)
  129: 90,  // Pain (Deva Path)
  130: 97,  // Ay (4th Raikage)
  131: 65,  // Rin Nohara
  132: 82,  // Rock Lee (Part 1)
  133: 90,  // Rock Lee (Shippuden)
  134: 96,  // Rock Lee (6 Gates)
  135: 80,  // Roshi
  136: 82,  // Sai (Base)
  137: 84,  // Sai (War Arc)
  138: 76,  // Sakon & Ukon
  139: 64,  // Sakura (Part 1)
  140: 78,  // Sakura (Shippuden)
  141: 80,  // Sakura (War Arc) (est)
  142: 85,  // Sakura Byakugo
  143: 67,  // Samurai
  144: 79,  // Sarada
  145: 85,  // Sarada Awakening (est)
  146: 82,  // Sasori
  147: 82,  // Sasori Reanimation (est)
  148: 75,  // Sasuke (Part 1)
  149: 89,  // Sasuke Hebi
  150: 95,  // Sasuke Black Custom (est)
  151: 91,  // Sasuke Taka
  152: 95,  // Sasuke War Arc
  153: 99,  // Sasuke Rinne Sharingan
  154: 99,  // Sasuke Support Kage
  155: 78,  // Shikamaru (Shippuden)
  156: 81,  // Shikamaru (War Arc)
  157: 70,  // Shikamaru (Part 1)
  158: 75,  // Shino (Shippuden)
  159: 77,  // Shino (War Arc)
  160: 67,  // Shino (Part 1)
  161: 98,  // Shisui
  162: 76,  // Shizune
  163: 79,  // Suigetsu
  164: 74,  // Tayuya
  165: 80,  // Temari (Shippuden)
  166: 82,  // Temari (War Arc)
  167: 72,  // Temari (Part 1)
  168: 78,  // Tenten (Shippuden)
  169: 68,  // Tenten (Part 1)
  170: 80,  // Tenten (Bashosen)
  171: 81,  // Rasa (4th Kazekage)
  172: 88,  // Gengetsu (2nd Mizukage)
  173: 90,  // Mu (2nd Tsuchikage)
  174: 92,  // A (3rd Raikage)
  175: 98,  // Tobirama (2nd Hokage)
  176: 98,  // Tobirama Reanimation (est)
  177: 88,  // Tobi (Akatsuki)
  178: 95,  // Tobi Great War (est)
  179: 95,  // Toneri
  180: 80,  // Torune
  181: 82,  // Tsunade
  182: 84,  // Utakata
  183: 84,  // Utakata Reanimation (est)
  184: 83,  // Yagura
  185: 83,  // Yagura Reanimation (est)
  186: 81,  // Yamato
  187: 89,  // Yugito Nii
  188: 89,  // Yugito Reanimation (est)
  189: 82,  // Zabuza
  190: 83,  // Zabuza Reanimation
  191: 92,  // Boruto Karma Progression (est)
  192: 84,  // Chojuro (6th Mizukage)
  193: 90,  // Code (est)
  194: 88,  // Daemon (est)
  195: 88,  // Darui (5th Raikage)
  196: 85,  // Deidara (Akatsuki Inception) (est)
  197: 85,  // Eida (est)
  198: 82,  // Hanabi Hyuga (Jounin) (est)
  199: 80,  // Hidan (Akatsuki Inception) (est)
  200: 83,  // Hinata Hyuga (Adult) (est)
  201: 85,  // Hinata Hyuga (The Last) (est)
  202: 78,  // Ino Yamanaka (Adult) (est)
  203: 97,  // Isshiki Otsutsuki (est)
  204: 95,  // Itachi Uchiha (Anbu)
  205: 85,  // Jiraiya (Sannin Era) (est)
  206: 89,  // Jiraiya (Sage Mode)
  207: 82,  // Kakuzu (Akatsuki Inception) (est)
  208: 78,  // Kankuro (Adult) (est)
  209: 94,  // Kawaki (Karma Progression) (est)
  210: 80,  // Gaara (Kazekage)
  211: 84,  // Kiba Inuzuka (Adult) (est)
  212: 82,  // Kurotsuchi (4th Tsuchikage)
  213: 85,  // Mangetsu Hozuki (est)
  214: 78,  // Mirai Sarutobi (est)
  215: 75,  // Mugino (est)
  216: 88,  // Naruto Uzumaki (The Last) (est)
  217: 89,  // Orochimaru (Sannin Era)
  218: 92,  // Rock Lee (Adult) (est)
  219: 84,  // Sai Yamanaka (Adult) (est)
  220: 82,  // Sakura Haruno (Adult) (est)
  221: 84,  // Sakura Haruno (The Last) (est)
  222: 82,  // Sasori (Akatsuki Inception) (est)
  223: 91,  // Sasuke Uchiha (Taka/Akatsuki)
  224: 93,  // Sasuke Uchiha (The Last) (est)
  225: 82,  // Shikamaru Nara (Adult) (est)
  226: 78,  // Shino Aburame (Adult) (est)
  227: 82,  // Temari (Adult) (est)
  228: 80,  // Tenten (Adult) (est)
  229: 82,  // Tsunade (Sannin Era)
  230: 82,  // Choji Akimichi (Butterfly Mode)
  231: 78,  // Choji Akimichi (Adult) (est)
  232: 98,  // Hagoromo Otsutsuki (est)
  233: 89,  // Konan (Akatsuki Inception)
  234: 88,  // Yahiko (Akatsuki Inception) (est)
  235: 85,  // Zetsu (est)
  236: 90,  // Nagato (Akatsuki Inception) (est)
  237: 90   // Sasuke Uchiha (Adult) (est)
};

export function getSpeedStat(id) {
  return SPD_BY_ID[id] !== undefined ? SPD_BY_ID[id] : 75;
}
