const fs = require('fs'), p = require('path');
const puppeteer = require('D:/1. Workspace (AI)/2. Projects/Email/node_modules/puppeteer-core');
const DIR = __dirname, K = '#1B2021', P = '#F7F5EE';
const chrome = ['C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(fs.existsSync);

const read = f => fs.readFileSync(p.join(DIR, f), 'utf8').replace(/<\?xml.*?\?>/, '').trim();
const at = (svg, s) => svg.replace(/width="\d+"\s+height="\d+"/, `width="${s}" height="${s}"`);

const chars = [
  { n: '01', t: 'Headline &middot; Coral', full: read('intern-01.svg'), ico: read('intern-01-favicon.svg') },
  { n: '02', t: 'Cell &middot; Sage', full: read('intern-02.svg'), ico: read('intern-02-favicon.svg') },
];

const strip = (svg, bg) => `<div class="tile ${bg}">${[96, 48, 24].map(s => at(svg, s)).join('')}</div>`;

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
  body{margin:0;background:${P};font:12px/1.4 "Inter","Segoe UI",system-ui,sans-serif;color:#51513D}
  .sheet{display:inline-block;padding:16px}
  h3{margin:0 0 8px;font-size:11px;letter-spacing:.16em;text-transform:uppercase}
  .row{display:flex;gap:10px;margin-bottom:12px;align-items:flex-start}
  .tile{display:flex;align-items:flex-end;gap:12px;padding:12px 16px}
  .pap{background:${P};border:1px solid #C9C3A6}
  .car{background:${K};border:1px solid ${K}}
  .ico{align-items:center}
  i{font-style:normal;font-size:10px;letter-spacing:.06em}
</style></head><body><div class="sheet">
${chars.map(c => `<h3>Intern ${c.n} &mdash; ${c.t} &mdash; 96 / 48 / 24 px</h3>
<div class="row">${strip(c.full, 'pap')}${strip(c.full, 'car')}
<div class="tile pap ico">${at(c.ico, 32)}</div><div class="tile car ico">${at(c.ico, 32)}</div>
<i>favicon 32</i></div>`).join('\n')}
</div></body></html>`;

fs.writeFileSync(p.join(DIR, 'final_pair.html'), html);

(async () => {
  const b = await puppeteer.launch({ executablePath: chrome, headless: 'new' });
  const pg = await b.newPage();
  await pg.setViewport({ width: 900, height: 400, deviceScaleFactor: 3 });
  await pg.goto('file:///' + p.join(DIR, 'final_pair.html').replace(/\\/g, '/'));
  await (await pg.$('.sheet')).screenshot({ path: p.join(DIR, 'final_pair.png') });
  await b.close();
  console.log('final_pair.png done');
})();
