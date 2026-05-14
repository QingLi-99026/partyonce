const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const outDir = path.resolve(__dirname, '../public/party-assets/venues/restaurant-a');
const packageOutDir = path.resolve(__dirname, '../public/party-assets/packages');

const variants = [
  { slug: 'original', title: 'Restaurant A Original', theme: 'neutral', tier: 'original' },
  { slug: 'castle-basic', title: 'Castle Princess Basic', theme: 'castle', tier: 'basic' },
  { slug: 'castle-standard', title: 'Castle Princess Standard', theme: 'castle', tier: 'standard' },
  { slug: 'castle-premium', title: 'Castle Princess Premium', theme: 'castle', tier: 'premium' },
  { slug: 'space-basic', title: 'Space Explorer Basic', theme: 'space', tier: 'basic' },
  { slug: 'space-standard', title: 'Space Explorer Standard', theme: 'space', tier: 'standard' },
  { slug: 'space-premium', title: 'Space Explorer Premium', theme: 'space', tier: 'premium' },
  { slug: 'forest-basic', title: 'Forest Adventure Basic', theme: 'forest', tier: 'basic' },
  { slug: 'forest-standard', title: 'Forest Adventure Standard', theme: 'forest', tier: 'standard' },
  { slug: 'forest-premium', title: 'Forest Adventure Premium', theme: 'forest', tier: 'premium' }
];

const palettes = {
  neutral: {
    wall: '#f6efe5',
    accent: '#c5a47e',
    secondary: '#7e6a55',
    table: '#eee3d6',
    light: '#fff7e6',
    floor: '#d6b98d',
    text: '#5b4938'
  },
  castle: {
    wall: '#fff0f7',
    accent: '#f69ac8',
    secondary: '#b888ff',
    table: '#ffe0ef',
    light: '#fff4c2',
    floor: '#e8c8d9',
    text: '#6f3f74'
  },
  space: {
    wall: '#14294e',
    accent: '#65d8ff',
    secondary: '#bfc8dc',
    table: '#243a63',
    light: '#d7f9ff',
    floor: '#273a5a',
    text: '#eaf8ff'
  },
  forest: {
    wall: '#eaf5e5',
    accent: '#6ebd72',
    secondary: '#8b653e',
    table: '#d8e8c8',
    light: '#ffe0a3',
    floor: '#b9905c',
    text: '#35553a'
  }
};

function esc(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));
}

function chair(x, y, color = '#92734f') {
  return `<g>
    <rect x="${x - 2}" y="${y + 20}" width="24" height="26" rx="6" fill="#3f3024" opacity="0.18"/>
    <rect x="${x}" y="${y}" width="20" height="26" rx="6" fill="${color}" opacity="0.96"/>
    <rect x="${x + 3}" y="${y + 21}" width="14" height="23" rx="4" fill="#5d4634" opacity="0.34"/>
    <line x1="${x + 4}" y1="${y + 8}" x2="${x + 16}" y2="${y + 8}" stroke="#fff" stroke-width="2" opacity="0.24"/>
  </g>`;
}

function table(x, y, palette, label) {
  const chairColor = palette.chair || '#92734f';
  const chairs = [
    chair(x + 20, y - 34, chairColor), chair(x + 70, y - 34, chairColor), chair(x + 120, y - 34, chairColor), chair(x + 170, y - 34, chairColor),
    chair(x + 20, y + 80, chairColor), chair(x + 70, y + 80, chairColor), chair(x + 120, y + 80, chairColor), chair(x + 170, y + 80, chairColor)
  ].join('');
  const placeSettings = [36, 84, 132, 180].map((offset) => `
    <g opacity="0.9">
      <circle cx="${x + offset}" cy="${y + 28}" r="9" fill="#fff" opacity="0.86"/>
      <circle cx="${x + offset}" cy="${y + 28}" r="5" fill="${palette.accent}" opacity="0.22"/>
      <rect x="${x + offset - 10}" y="${y + 51}" width="20" height="5" rx="2" fill="#fff" opacity="0.7"/>
    </g>`).join('');

  return `<g>
    ${chairs}
    <ellipse cx="${x + 110}" cy="${y + 95}" rx="132" ry="30" fill="#392817" opacity="0.12"/>
    <rect x="${x}" y="${y}" width="220" height="82" rx="20" fill="#6f503b" opacity="0.30"/>
    <rect x="${x + 4}" y="${y + 4}" width="212" height="74" rx="18" fill="${palette.table}"/>
    <rect x="${x + 16}" y="${y + 16}" width="188" height="50" rx="14" fill="#ffffff" opacity="0.20"/>
    <line x1="${x + 22}" y1="${y + 41}" x2="${x + 198}" y2="${y + 41}" stroke="${palette.accent}" stroke-width="2" opacity="0.45"/>
    ${placeSettings}
    <g>
      <rect x="${x + 96}" y="${y + 18}" width="28" height="36" rx="10" fill="${palette.secondary}" opacity="0.48"/>
      <circle cx="${x + 110}" cy="${y + 15}" r="14" fill="${palette.accent}" opacity="0.64"/>
      <circle cx="${x + 96}" cy="${y + 24}" r="8" fill="${palette.light}" opacity="0.68"/>
      <circle cx="${x + 124}" cy="${y + 24}" r="8" fill="${palette.light}" opacity="0.68"/>
    </g>
    <text x="${x + 110}" y="${y + 51}" text-anchor="middle" font-family="Inter, Arial" font-size="15" font-weight="700" fill="${palette.text}" opacity="0.75">${label}</text>
  </g>`;
}

function baseRoom(palette) {
  return `<svg width="1440" height="900" viewBox="0 0 1440 900" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${palette.wall}"/>
        <stop offset="1" stop-color="#ffffff"/>
      </linearGradient>
      <linearGradient id="floor" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${palette.floor}"/>
        <stop offset="1" stop-color="#f5dfbd"/>
      </linearGradient>
      <linearGradient id="ambient" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${palette.accent}" stop-opacity="0.20"/>
        <stop offset="0.5" stop-color="#ffffff" stop-opacity="0"/>
        <stop offset="1" stop-color="${palette.secondary}" stop-opacity="0.16"/>
      </linearGradient>
      <pattern id="floorBoards" width="72" height="72" patternUnits="userSpaceOnUse">
        <path d="M0 0 H72 M0 36 H72 M36 0 V72" stroke="#6f503b" stroke-width="2" opacity="0.12"/>
      </pattern>
      <filter id="softShadow" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="14" stdDeviation="18" flood-color="#392817" flood-opacity="0.18"/>
      </filter>
      <filter id="glow" x="-70%" y="-70%" width="240%" height="240%">
        <feGaussianBlur stdDeviation="8" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
    <rect width="1440" height="900" fill="url(#wall)"/>
    <rect width="1440" height="900" fill="url(#ambient)"/>
    <g opacity="0.24">
      <rect x="90" y="92" width="300" height="170" rx="24" fill="none" stroke="${palette.secondary}" stroke-width="3"/>
      <rect x="525" y="84" width="390" height="186" rx="28" fill="none" stroke="${palette.secondary}" stroke-width="3"/>
      <rect x="1050" y="92" width="300" height="170" rx="24" fill="none" stroke="${palette.secondary}" stroke-width="3"/>
    </g>
    <path d="M110 210 H1330 V760 Q720 880 110 760 Z" fill="url(#floor)" opacity="0.96"/>
    <path d="M110 210 H1330 V760 Q720 880 110 760 Z" fill="url(#floorBoards)" opacity="0.58"/>
    <g opacity="0.16" stroke="#6f503b" stroke-width="3">
      <path d="M210 226 L90 760"/>
      <path d="M470 220 L350 805"/>
      <path d="M720 216 V856"/>
      <path d="M970 220 L1090 805"/>
      <path d="M1230 226 L1350 760"/>
    </g>
    <path d="M110 210 H1330" stroke="#9b7e5c" stroke-width="6" opacity="0.28"/>
    <g opacity="0.95">
      <rect x="184" y="104" width="192" height="132" rx="18" fill="#ffffff" opacity="0.44"/>
      <rect x="190" y="110" width="180" height="120" rx="14" fill="#e8f6ff" stroke="#a9c2d3" stroke-width="7"/>
      <line x1="280" y1="110" x2="280" y2="230" stroke="#a9c2d3" stroke-width="5"/>
      <line x1="190" y1="170" x2="370" y2="170" stroke="#a9c2d3" stroke-width="5"/>
      <path d="M205 210 C242 185 286 188 356 210" fill="none" stroke="#fff" stroke-width="8" opacity="0.36"/>
      <rect x="1064" y="104" width="192" height="132" rx="18" fill="#ffffff" opacity="0.44"/>
      <rect x="1070" y="110" width="180" height="120" rx="14" fill="#e8f6ff" stroke="#a9c2d3" stroke-width="7"/>
      <line x1="1160" y1="110" x2="1160" y2="230" stroke="#a9c2d3" stroke-width="5"/>
      <line x1="1070" y1="170" x2="1250" y2="170" stroke="#a9c2d3" stroke-width="5"/>
      <path d="M1085 210 C1122 185 1166 188 1236 210" fill="none" stroke="#fff" stroke-width="8" opacity="0.36"/>
    </g>
    <g filter="url(#softShadow)">
      <rect x="647" y="105" width="146" height="165" rx="18" fill="#6a4b38" opacity="0.88"/>
      <rect x="682" y="143" width="76" height="127" rx="38" fill="#3e3026" opacity="0.48"/>
      <circle cx="760" cy="190" r="6" fill="${palette.light}"/>
    </g>
    <g filter="url(#glow)" opacity="0.76">
      <circle cx="420" cy="96" r="24" fill="${palette.light}"/>
      <circle cx="720" cy="82" r="30" fill="${palette.light}"/>
      <circle cx="1020" cy="96" r="24" fill="${palette.light}"/>
    </g>
    <path d="M166 706 C355 635 494 637 700 706 C896 773 1055 773 1274 707" fill="none" stroke="#fff8ea" stroke-width="64" opacity="0.34"/>
    <g filter="url(#softShadow)">
      ${table(245, 410, palette, 'Table 1')}
      ${table(610, 420, palette, 'Table 2')}
      ${table(975, 410, palette, 'Table 3')}
    </g>
    <path d="M260 740 C450 700 990 700 1180 740" fill="none" stroke="${palette.accent}" stroke-width="8" opacity="0.18"/>`;
}

function balloon(cx, cy, color, scale = 1) {
  return `<g>
    <ellipse cx="${cx}" cy="${cy}" rx="${18 * scale}" ry="${24 * scale}" fill="${color}" opacity="0.92"/>
    <path d="M${cx} ${cy + 23 * scale} C${cx - 10 * scale} ${cy + 55 * scale}, ${cx + 10 * scale} ${cy + 70 * scale}, ${cx} ${cy + 95 * scale}" fill="none" stroke="#ffffff" stroke-width="${2 * scale}" opacity="0.75"/>
  </g>`;
}

function star(x, y, r, fill) {
  const points = Array.from({ length: 10 }, (_, i) => {
    const angle = -Math.PI / 2 + i * Math.PI / 5;
    const radius = i % 2 === 0 ? r : r * 0.42;
    return `${x + Math.cos(angle) * radius},${y + Math.sin(angle) * radius}`;
  }).join(' ');
  return `<polygon points="${points}" fill="${fill}" opacity="0.9"/>`;
}

function tierSeal(x, y, tier, palette) {
  const labels = {
    basic: 'Basic styling',
    standard: 'Standard party set',
    premium: 'Premium immersive set',
    original: 'Original room'
  };
  return `<g filter="url(#softShadow)">
    <rect x="${x}" y="${y}" width="246" height="54" rx="18" fill="#ffffff" opacity="0.90"/>
    <circle cx="${x + 30}" cy="${y + 27}" r="15" fill="${palette.accent}" opacity="0.86"/>
    <text x="${x + 52}" y="${y + 34}" font-family="Inter, Arial" font-size="18" font-weight="800" fill="${palette.text}">${labels[tier] || tier}</text>
  </g>`;
}

function dessertStack(x, y, palette, label) {
  return `<g filter="url(#softShadow)">
    <rect x="${x}" y="${y}" width="176" height="72" rx="20" fill="#fff" opacity="0.92"/>
    <rect x="${x + 16}" y="${y + 18}" width="44" height="34" rx="10" fill="${palette.accent}" opacity="0.62"/>
    <rect x="${x + 68}" y="${y + 12}" width="42" height="42" rx="10" fill="${palette.secondary}" opacity="0.54"/>
    <rect x="${x + 118}" y="${y + 20}" width="38" height="30" rx="9" fill="${palette.light}" opacity="0.9"/>
    <text x="${x + 88}" y="${y + 96}" text-anchor="middle" font-family="Inter, Arial" font-size="16" font-weight="800" fill="${palette.text}">${label}</text>
  </g>`;
}

function castleDecor(tier, palette) {
  const base = `
    <text x="720" y="55" text-anchor="middle" font-family="Georgia, serif" font-size="28" font-weight="700" fill="${palette.text}">Castle Princess</text>
    ${tierSeal(96, 44, tier, palette)}
    <g transform="translate(110,250)">${balloon(0, 0, '#f69ac8')}${balloon(34, 20, '#ffd166', 0.82)}${balloon(-30, 28, '#b888ff', 0.78)}</g>
    <g transform="translate(1320,250)">${balloon(0, 0, '#b888ff')}${balloon(-34, 20, '#ffd166', 0.82)}${balloon(30, 28, '#f69ac8', 0.78)}</g>
    <polygon points="694,320 710,285 728,320" fill="#ffd166"/><rect x="686" y="318" width="50" height="38" rx="8" fill="#f69ac8"/>
    <text x="711" y="346" text-anchor="middle" font-size="23" fill="#fff">♛</text>
    <rect x="292" y="438" width="128" height="10" rx="5" fill="#ffd166" opacity="0.55"/>
    <rect x="656" y="448" width="128" height="10" rx="5" fill="#ffd166" opacity="0.55"/>
    <rect x="1021" y="438" width="128" height="10" rx="5" fill="#ffd166" opacity="0.55"/>`;
  if (tier === 'basic') return base;
  const standard = `${base}
    <path d="M526 310 Q720 162 914 310" fill="none" stroke="#f69ac8" stroke-width="22" stroke-linecap="round"/>
    <path d="M548 320 Q720 198 892 320" fill="none" stroke="#ffd166" stroke-width="10" stroke-linecap="round"/>
    <rect x="560" y="300" width="320" height="90" rx="24" fill="#fff1f8" stroke="#ffd166" stroke-width="6"/>
    <text x="720" y="356" text-anchor="middle" font-family="Georgia, serif" font-size="30" font-weight="700" fill="#8a4d9d">Royal Dessert Table</text>
    <circle cx="326" cy="443" r="13" fill="#ffd166"/><circle cx="690" cy="453" r="13" fill="#ffd166"/><circle cx="1055" cy="443" r="13" fill="#ffd166"/>
    ${dessertStack(632, 606, palette, 'Princess sweets')}`;
  if (tier === 'standard') return standard;
  return `${standard}
    <path d="M170 310 C270 220, 380 220, 480 310" fill="none" stroke="#b888ff" stroke-width="18" stroke-linecap="round"/>
    <path d="M960 310 C1060 220, 1170 220, 1270 310" fill="none" stroke="#b888ff" stroke-width="18" stroke-linecap="round"/>
    <g opacity="0.92">${star(190, 360, 18, '#ffd166')}${star(1250, 360, 18, '#ffd166')}${star(720, 170, 28, '#ffd166')}</g>
    <rect x="86" y="585" width="170" height="105" rx="24" fill="#fff1f8" stroke="#f69ac8" stroke-width="8"/>
    <text x="171" y="641" text-anchor="middle" font-size="24" font-weight="700" fill="#8a4d9d">Photo Castle</text>
    <rect x="1184" y="585" width="170" height="105" rx="24" fill="#fff1f8" stroke="#f69ac8" stroke-width="8"/>
    <text x="1269" y="641" text-anchor="middle" font-size="24" font-weight="700" fill="#8a4d9d">Crown Wall</text>
    <rect x="170" y="250" width="1100" height="475" rx="55" fill="none" stroke="#ffd166" stroke-width="10" opacity="0.38"/>
    <path d="M210 270 C396 230, 572 230, 720 270 C868 230, 1044 230, 1230 270" fill="none" stroke="#fff4c2" stroke-width="6" opacity="0.68"/>
    <g filter="url(#glow)"><circle cx="270" cy="268" r="8" fill="#fff4c2"/><circle cx="500" cy="250" r="8" fill="#fff4c2"/><circle cx="720" cy="270" r="8" fill="#fff4c2"/><circle cx="940" cy="250" r="8" fill="#fff4c2"/><circle cx="1170" cy="268" r="8" fill="#fff4c2"/></g>`;
}

function spaceDecor(tier, palette) {
  const base = `
    <text x="720" y="55" text-anchor="middle" font-family="Inter, Arial" font-size="28" font-weight="800" fill="${palette.text}">Space Explorer</text>
    ${tierSeal(96, 44, tier, palette)}
    ${star(228, 310, 15, '#d7f9ff')}${star(1240, 330, 15, '#d7f9ff')}${star(720, 155, 18, '#65d8ff')}
    <circle cx="720" cy="330" r="42" fill="#65d8ff" opacity="0.28"/><circle cx="720" cy="330" r="22" fill="#bfc8dc"/>
    <path d="M683 337 Q720 372 758 337" fill="none" stroke="#65d8ff" stroke-width="5"/>
    <path d="M118 255 L155 210 L188 255 L173 255 L173 310 L133 310 L133 255 Z" fill="#bfc8dc" stroke="#65d8ff" stroke-width="4"/>
    <rect x="292" y="438" width="128" height="10" rx="5" fill="#65d8ff" opacity="0.55"/>
    <rect x="656" y="448" width="128" height="10" rx="5" fill="#65d8ff" opacity="0.55"/>
    <rect x="1021" y="438" width="128" height="10" rx="5" fill="#65d8ff" opacity="0.55"/>`;
  if (tier === 'basic') return base;
  const standard = `${base}
    <path d="M515 310 Q720 206 925 310" fill="none" stroke="#65d8ff" stroke-width="18" stroke-linecap="round"/>
    <rect x="566" y="300" width="308" height="90" rx="20" fill="#203457" stroke="#65d8ff" stroke-width="5"/>
    <text x="720" y="356" text-anchor="middle" font-size="30" font-weight="800" fill="#eaf8ff">Mission Dessert Station</text>
    <path d="M1020 255 C1060 220,1110 225,1140 260 S1230 304,1270 250" fill="none" stroke="#bfc8dc" stroke-width="8" opacity="0.8"/>
    <circle cx="1120" cy="260" r="30" fill="#ffcc66"/><ellipse cx="1120" cy="260" rx="54" ry="13" fill="none" stroke="#eaf8ff" stroke-width="5"/>
    ${dessertStack(632, 606, palette, 'Mission treats')}`;
  if (tier === 'standard') return standard;
  return `${standard}
    <rect x="120" y="255" width="1200" height="450" rx="50" fill="none" stroke="#65d8ff" stroke-width="8" opacity="0.42"/>
    <g opacity="0.9">${Array.from({ length: 28 }, (_, i) => star(190 + (i * 41) % 1050, 245 + (i * 73) % 360, 6 + (i % 3), i % 2 ? '#d7f9ff' : '#65d8ff')).join('')}</g>
    <rect x="74" y="580" width="190" height="110" rx="24" fill="#203457" stroke="#65d8ff" stroke-width="8"/>
    <text x="169" y="642" text-anchor="middle" font-size="22" font-weight="800" fill="#eaf8ff">Launch Photo Bay</text>
    <rect x="1176" y="580" width="190" height="110" rx="24" fill="#203457" stroke="#65d8ff" stroke-width="8"/>
    <text x="1271" y="642" text-anchor="middle" font-size="22" font-weight="800" fill="#eaf8ff">LED Star Wall</text>
    <path d="M210 270 C396 230, 572 230, 720 270 C868 230, 1044 230, 1230 270" fill="none" stroke="#65d8ff" stroke-width="5" opacity="0.72"/>
    <g filter="url(#glow)"><circle cx="270" cy="268" r="7" fill="#65d8ff"/><circle cx="500" cy="250" r="7" fill="#65d8ff"/><circle cx="720" cy="270" r="7" fill="#65d8ff"/><circle cx="940" cy="250" r="7" fill="#65d8ff"/><circle cx="1170" cy="268" r="7" fill="#65d8ff"/></g>`;
}

function forestDecor(tier, palette) {
  const vine = (x, y, flip = 1) => `<path d="M${x} ${y} C${x + 35 * flip} ${y - 45}, ${x - 20 * flip} ${y - 80}, ${x + 42 * flip} ${y - 126}" fill="none" stroke="#4f9a55" stroke-width="7" stroke-linecap="round"/>
    <ellipse cx="${x + 20 * flip}" cy="${y - 43}" rx="18" ry="8" fill="#6ebd72" transform="rotate(${25 * flip} ${x + 20 * flip} ${y - 43})"/>
    <ellipse cx="${x + 5 * flip}" cy="${y - 88}" rx="16" ry="8" fill="#8ccf82" transform="rotate(${-20 * flip} ${x + 5 * flip} ${y - 88})"/>`;
  const base = `
    <text x="720" y="55" text-anchor="middle" font-family="Georgia, serif" font-size="28" font-weight="700" fill="${palette.text}">Forest Adventure</text>
    ${tierSeal(96, 44, tier, palette)}
    ${vine(150, 330)}${vine(1290, 330, -1)}
    <rect x="668" y="305" width="104" height="68" rx="16" fill="#8b653e"/>
    <text x="720" y="349" text-anchor="middle" font-size="27" fill="#ffe0a3">Trail</text>
    <circle cx="338" cy="445" r="13" fill="#6ebd72"/><circle cx="702" cy="455" r="13" fill="#6ebd72"/><circle cx="1066" cy="445" r="13" fill="#6ebd72"/>
    <rect x="292" y="438" width="128" height="10" rx="5" fill="#6ebd72" opacity="0.55"/>
    <rect x="656" y="448" width="128" height="10" rx="5" fill="#6ebd72" opacity="0.55"/>
    <rect x="1021" y="438" width="128" height="10" rx="5" fill="#6ebd72" opacity="0.55"/>`;
  if (tier === 'basic') return base;
  const standard = `${base}
    <path d="M516 310 Q720 202 924 310" fill="none" stroke="#6ebd72" stroke-width="20" stroke-linecap="round"/>
    <path d="M540 326 Q720 240 900 326" fill="none" stroke="#8b653e" stroke-width="9" stroke-linecap="round"/>
    <rect x="560" y="300" width="320" height="90" rx="24" fill="#eef7e7" stroke="#8b653e" stroke-width="6"/>
    <text x="720" y="356" text-anchor="middle" font-family="Georgia, serif" font-size="30" font-weight="700" fill="#35553a">Woodland Treat Table</text>
    <circle cx="1120" cy="270" r="28" fill="#8b653e"/><circle cx="1135" cy="255" r="14" fill="#8b653e"/><circle cx="1105" cy="255" r="14" fill="#8b653e"/>
    <circle cx="1110" cy="270" r="4" fill="#fff"/><circle cx="1130" cy="270" r="4" fill="#fff"/>
    ${dessertStack(632, 606, palette, 'Woodland bites')}`;
  if (tier === 'standard') return standard;
  return `${standard}
    <rect x="115" y="250" width="1210" height="465" rx="58" fill="none" stroke="#6ebd72" stroke-width="10" opacity="0.45"/>
    ${vine(280, 720)}${vine(1160, 720, -1)}
    <g filter="url(#glow)" opacity="0.88"><circle cx="260" cy="298" r="10" fill="#ffe0a3"/><circle cx="470" cy="255" r="10" fill="#ffe0a3"/><circle cx="970" cy="255" r="10" fill="#ffe0a3"/><circle cx="1180" cy="298" r="10" fill="#ffe0a3"/></g>
    <rect x="84" y="585" width="182" height="105" rx="28" fill="#eef7e7" stroke="#6ebd72" stroke-width="8"/>
    <text x="175" y="641" text-anchor="middle" font-size="23" font-weight="700" fill="#35553a">Camp Photo Nook</text>
    <rect x="1174" y="585" width="182" height="105" rx="28" fill="#eef7e7" stroke="#6ebd72" stroke-width="8"/>
    <text x="1265" y="641" text-anchor="middle" font-size="23" font-weight="700" fill="#35553a">Forest Backdrop</text>
    <path d="M210 270 C396 230, 572 230, 720 270 C868 230, 1044 230, 1230 270" fill="none" stroke="#ffe0a3" stroke-width="5" opacity="0.74"/>
    <g filter="url(#glow)"><circle cx="270" cy="268" r="8" fill="#ffe0a3"/><circle cx="500" cy="250" r="8" fill="#ffe0a3"/><circle cx="720" cy="270" r="8" fill="#ffe0a3"/><circle cx="940" cy="250" r="8" fill="#ffe0a3"/><circle cx="1170" cy="268" r="8" fill="#ffe0a3"/></g>`;
}

function sceneSvg(variant) {
  const palette = palettes[variant.theme];
  const decor = variant.theme === 'castle'
    ? castleDecor(variant.tier, palette)
    : variant.theme === 'space'
      ? spaceDecor(variant.tier, palette)
      : variant.theme === 'forest'
        ? forestDecor(variant.tier, palette)
        : `<text x="720" y="55" text-anchor="middle" font-family="Inter, Arial" font-size="28" font-weight="800" fill="${palette.text}">Restaurant A Reference Scene</text>
           <rect x="562" y="304" width="316" height="86" rx="22" fill="#fff8ea" stroke="#c5a47e" stroke-width="5"/>
           <text x="720" y="356" text-anchor="middle" font-size="28" font-weight="700" fill="${palette.text}">Original layout</text>`;

  return `${baseRoom(palette)}
    <g>${decor}</g>
    <g>
      <rect x="1034" y="766" width="314" height="58" rx="20" fill="#ffffff" opacity="0.86"/>
      <text x="1191" y="802" text-anchor="middle" font-family="Inter, Arial" font-size="22" font-weight="800" fill="${palette.text}">${esc(variant.title)}</text>
    </g>
  </svg>`;
}

function htmlFor(svg) {
  return `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <style>
        html, body { margin: 0; width: 1440px; height: 900px; background: #fff; }
        body { overflow: hidden; }
        svg { display: block; width: 1440px; height: 900px; }
      </style>
    </head>
    <body>${svg}</body>
  </html>`;
}

function imageDataUrl(filePath) {
  const bytes = fs.readFileSync(filePath);
  return `data:image/png;base64,${bytes.toString('base64')}`;
}

function packageMatrixHtml() {
  const rows = [
    { theme: 'Castle Princess', color: '#f69ac8', variants: ['castle-basic', 'castle-standard', 'castle-premium'] },
    { theme: 'Space Explorer', color: '#65d8ff', variants: ['space-basic', 'space-standard', 'space-premium'] },
    { theme: 'Forest Adventure', color: '#6ebd72', variants: ['forest-basic', 'forest-standard', 'forest-premium'] }
  ];
  const tiers = ['Basic', 'Standard', 'Premium'];
  const cards = rows.map((row) => row.variants.map((slug, index) => {
    const filePath = path.join(outDir, `restaurant-a-${slug}.png`);
    return `<article>
      <img src="${imageDataUrl(filePath)}" alt="${row.theme} ${tiers[index]}">
      <div class="card-copy">
        <span style="background:${row.color}">${tiers[index]}</span>
        <strong>${row.theme}</strong>
        <small>${index === 0 ? '基础桌布、少量气球、小主题牌' : index === 1 ? '气球拱门、甜品台、主题背景板' : '沉浸式拱门、灯光、拍照区'}</small>
      </div>
    </article>`;
  }).join('')).join('');

  return `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <style>
        * { box-sizing: border-box; }
        html, body { margin: 0; width: 1800px; height: 1440px; background: #fff7fb; font-family: Inter, Arial, sans-serif; }
        body {
          padding: 54px;
          background:
            radial-gradient(circle at 10% 10%, rgba(246,154,200,.22), transparent 28%),
            radial-gradient(circle at 92% 12%, rgba(101,216,255,.20), transparent 30%),
            linear-gradient(135deg, #fff7fb, #f7fbff 55%, #f7fff9);
        }
        header { display: flex; justify-content: space-between; align-items: end; margin-bottom: 28px; }
        h1 { margin: 0; font-size: 50px; line-height: 1; color: #172033; letter-spacing: -1px; }
        p { margin: 12px 0 0; font-size: 21px; color: #5d6678; max-width: 860px; line-height: 1.45; }
        .legend { display: flex; gap: 12px; color: #334155; font-size: 18px; font-weight: 800; }
        .legend span { padding: 10px 16px; border-radius: 999px; background: rgba(255,255,255,.75); border: 1px solid rgba(148,163,184,.25); }
        main { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        article {
          overflow: hidden;
          border-radius: 28px;
          background: rgba(255,255,255,.88);
          border: 1px solid rgba(148,163,184,.26);
          box-shadow: 0 28px 80px rgba(15,23,42,.12);
        }
        img { display: block; width: 100%; height: 262px; object-fit: cover; }
        .card-copy { display: grid; gap: 8px; padding: 20px; }
        .card-copy span { justify-self: start; padding: 7px 11px; border-radius: 999px; color: #172033; font-size: 13px; font-weight: 900; }
        strong { color: #172033; font-size: 24px; }
        small { color: #5d6678; font-size: 16px; line-height: 1.45; }
        footer { margin-top: 24px; color: #64748b; font-size: 18px; }
      </style>
    </head>
    <body>
      <header>
        <div>
          <h1>Restaurant A Theme Package Matrix</h1>
          <p>Same room, same tables, same chairs. Only the decoration layer changes across Castle, Space and Forest packages.</p>
        </div>
        <div class="legend"><span>Basic</span><span>Standard</span><span>Premium</span></div>
      </header>
      <main>${cards}</main>
      <footer>Local/staging visual asset. Final commercial quotes require venue and supplier confirmation.</footer>
    </body>
  </html>`;
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  fs.mkdirSync(packageOutDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });

  for (const variant of variants) {
    await page.setContent(htmlFor(sceneSvg(variant)), { waitUntil: 'networkidle' });
    const filename = `restaurant-a-${variant.slug}.png`;
    const filePath = path.join(outDir, filename);
    await page.screenshot({ path: filePath, fullPage: false, type: 'png' });
    const stat = fs.statSync(filePath);
    if (stat.size <= 0) {
      throw new Error(`Generated empty image: ${filePath}`);
    }
    console.log(`${filename}\t${stat.size}`);
  }

  await page.setViewportSize({ width: 1800, height: 1440 });
  await page.setContent(packageMatrixHtml(), { waitUntil: 'networkidle' });
  const matrixPath = path.join(packageOutDir, 'package-tier-matrix.png');
  await page.screenshot({ path: matrixPath, fullPage: false, type: 'png' });
  const matrixStat = fs.statSync(matrixPath);
  if (matrixStat.size <= 0) {
    throw new Error(`Generated empty image: ${matrixPath}`);
  }
  console.log(`package-tier-matrix.png\t${matrixStat.size}`);

  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
