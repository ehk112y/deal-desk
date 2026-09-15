const fs = require('fs'), p = require('path');
const puppeteer = require('D:/1. Workspace (AI)/2. Projects/Email/node_modules/puppeteer-core');
const DIR = __dirname, K = '#1B2021';
const chrome = ['C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(fs.existsSync);

const I1 = { body: '#E8927C', ink: '#98341B', tint: '#EBC9C0' };
const I2 = { body: '#9DBF9E', ink: '#256F27', tint: '#CBD9CB' };

/* ---- shared furniture: thin-line desk, sand dune at 55% ---- */
const desk = (x, prop) => `<g stroke="#E3DC95" stroke-opacity="0.55" stroke-width="3" stroke-linecap="round" fill="none">
    <path d="M${x - 74} 92 H${x + 74}"/>
    <path d="M${x - 66} 92 V114 M${x + 66} 92 V114"/>
    ${prop(x)}
  </g>`;

// intern 01 prop: a stack of clippings
const stack = x => `<rect x="${x + 32}" y="80" width="34" height="9" rx="2"/>
    <rect x="${x + 36}" y="73" width="26" height="7" rx="2"/>`;
// intern 02 prop: a monitor seen from behind
const monitor = x => `<rect x="${x + 30}" y="60" width="38" height="26" rx="3"/>
    <path d="M${x + 49} 86 V91 M${x + 40} 92 H${x + 58}"/>`;

/* ---- character parts, all sitting at the desk seen from behind ---- */
const armL = (x, c, a) => `<rect x="${x - 34}" y="50" width="10" height="42" rx="5" fill="${c.ink}" transform="rotate(${a} ${x - 29} 56)"/>`;
const armR = (x, c, a) => `<rect x="${x + 24}" y="50" width="10" height="42" rx="5" fill="${c.ink}" transform="rotate(${a} ${x + 29} 56)"/>`;
const bodyBack = (x, c) => `<rect x="${x - 27}" y="32" width="54" height="54" rx="12" fill="${c.body}" stroke="${c.ink}" stroke-width="3"/>`;

// paperclip antenna, same loop as the front view
const antenna = (x, c) => `<path d="M${x} 36 V26" stroke="${c.ink}" stroke-width="3" stroke-linecap="round" fill="none"/>
      <rect x="${x - 6.5}" y="8" width="13" height="18" rx="6.5" fill="none" stroke="${c.ink}" stroke-width="3"/>
      <rect x="${x - 2}" y="12.5" width="4" height="9" rx="2" fill="${c.ink}"/>`;
// pencil stowed behind the ear, tip tucked out of sight behind the head
const pencilEar = (x, c) => `<g transform="rotate(32 ${x + 20} 30)">
      <rect x="${x + 15}" y="6" width="10" height="24" rx="2" fill="${c.body}" stroke="${c.ink}" stroke-width="3"/>
      <path d="M${x + 15} 30 L${x + 20} 39 L${x + 25} 30 Z" fill="${c.ink}"/>
      <rect x="${x + 15}" y="15" width="10" height="3" fill="${c.ink}"/>
    </g>`;
const eyes = (x, c) => `<circle cx="${x - 15}" cy="56" r="5" fill="${c.ink}"/>
      <circle cx="${x - 2}" cy="56" r="5" fill="${c.ink}"/>`;

/* intern 01 - masthead bands wrap the back, fold crease down the middle */
const i1Back = x => `<g class="back">
    ${armL(x, I1, -10)}${armR(x, I1, 10)}
    ${antenna(x, I1)}
    ${bodyBack(x, I1)}
    <rect x="${x - 23}" y="40" width="46" height="5" rx="2.5" fill="${I1.ink}"/>
    <rect x="${x - 23}" y="49" width="46" height="3" rx="1.5" fill="${I1.tint}"/>
    <path d="M${x - 17} 64 H${x + 17}" stroke="${I1.tint}" stroke-width="3" stroke-linecap="round" fill="none"/>
    <path d="M${x} 68 V80" stroke="${I1.tint}" stroke-width="3" stroke-linecap="round" fill="none"/>
  </g>`;

const i1Turn = x => `<g class="turn" visibility="hidden">
    ${armL(x, I1, 4)}${armR(x, I1, 10)}
    <g transform="rotate(-7 ${x} 62) translate(-4 -3)">
      ${antenna(x, I1)}
      ${bodyBack(x, I1)}
      <rect x="${x + 2}" y="40" width="21" height="5" rx="2.5" fill="${I1.ink}"/>
      <rect x="${x + 2}" y="49" width="21" height="3" rx="1.5" fill="${I1.tint}"/>
      ${eyes(x, I1)}
      <path d="M${x + 6} 72 H${x + 20}" stroke="${I1.tint}" stroke-width="3" stroke-linecap="round" fill="none"/>
    </g>
  </g>`;

/* intern 02 - cell grid across the back, pencil behind the ear */
const i2Back = x => `<g class="back">
    ${armL(x, I2, -10)}${armR(x, I2, 10)}
    ${pencilEar(x, I2)}
    ${bodyBack(x, I2)}
    <path d="M${x - 24} 60 H${x + 24}" stroke="${I2.tint}" stroke-width="3" stroke-linecap="round" fill="none"/>
    <path d="M${x} 64 V80" stroke="${I2.tint}" stroke-width="3" stroke-linecap="round" fill="none"/>
  </g>`;

const i2Turn = x => `<g class="turn" visibility="hidden">
    ${armL(x, I2, 4)}${armR(x, I2, 10)}
    <g transform="rotate(-7 ${x} 62) translate(-4 -3)">
      ${pencilEar(x, I2)}
      ${bodyBack(x, I2)}
      ${eyes(x, I2)}
      <path d="M${x + 2} 70 H${x + 22}" stroke="${I2.tint}" stroke-width="3" stroke-linecap="round" fill="none"/>
      <path d="M${x + 12} 70 V80" stroke="${I2.tint}" stroke-width="3" stroke-linecap="round" fill="none"/>
    </g>
  </g>`;

const X1 = 120, X2 = 360;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 120" width="480" height="120" role="img" aria-label="Interns at their desks">
  ${desk(X1, stack)}
  ${desk(X2, monitor)}
  <g class="i1">
    ${i1Back(X1)}
    ${i1Turn(X1)}
  </g>
  <g class="i2">
    ${i2Back(X2)}
    ${i2Turn(X2)}
  </g>
</svg>
`;
fs.writeFileSync(p.join(DIR, 'desk-scene.svg'), svg);

const proof = `<!doctype html><html><head><meta charset="utf-8"><style>
body{margin:0;background:${K}} .f{width:480px;padding:0}</style></head>
<body><div class="f">${svg}</div></body></html>`;
fs.writeFileSync(p.join(DIR, 'desk-scene-proof.html'), proof);

(async () => {
  const b = await puppeteer.launch({ executablePath: chrome, headless: 'new' });
  const pg = await b.newPage();
  await pg.setViewport({ width: 480, height: 120, deviceScaleFactor: 2 });
  await pg.goto('file:///' + p.join(DIR, 'desk-scene-proof.html').replace(/\\/g, '/'));
  await (await pg.$('.f')).screenshot({ path: p.join(DIR, 'desk-scene.png') });

  await pg.evaluate(() => {
    document.querySelector('.i1 .back').setAttribute('visibility', 'hidden');
    document.querySelector('.i1 .turn').setAttribute('visibility', 'visible');
  });
  await (await pg.$('.f')).screenshot({ path: p.join(DIR, 'desk-scene-glance.png') });
  await b.close();
  console.log('scene done');
})();
