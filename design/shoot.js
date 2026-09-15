const puppeteer = require('D:/1. Workspace (AI)/2. Projects/Email/node_modules/puppeteer-core');
const OUT = __dirname + '/', BASE = 'http://localhost:8090/', errs = [];
const watch = (p, t) => {
  p.on('pageerror', e => errs.push(t + ' pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push(t + ' console: ' + m.text()); });
  p.on('requestfailed', r => errs.push(t + ' reqfail: ' + r.url()));
};
const wait = ms => new Promise(r => setTimeout(r, ms));
const fillOwner = p => p.evaluate(() => {
  document.getElementById('nav-email').textContent = 'ehk112y@gmail.com';
  document.getElementById('stat-newsrun').textContent = '3 requests \u00b7 3 done';
  document.getElementById('stat-financials').textContent = '1 request \u00b7 1 done';
  document.getElementById('acl').classList.remove('hidden');
  const row = document.createElement('div'); row.className = 'dd-acl-row';
  const s = document.createElement('span'); s.textContent = 'ehk112y@gmail.com';
  row.append(s); document.getElementById('acl-list').replaceChildren(row);
});
(async () => {
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: 'new', args: ['--disable-lcd-text'] });
  for (const [w, h, name, theme] of [[1440,900,'signin_light','deal'],[1440,900,'signin_dark','deal-dark'],[400,800,'signin_mobile','deal']]) {
    const p = await b.newPage(); watch(p, name);
    await p.setViewport({ width: w, height: h });
    await p.evaluateOnNewDocument(t => { try { localStorage.nrTheme = t; } catch {} }, theme);
    await p.goto(BASE, { waitUntil: 'networkidle0' }); await wait(2200);
    await p.screenshot({ path: OUT + name + '.png' }); await p.close();
  }
  for (const [w, h, name, theme] of [[1440,900,'home_light','deal'],[400,800,'home_mobile','deal']]) {
    const p = await b.newPage(); watch(p, name);
    await p.setViewport({ width: w, height: h });
    await p.evaluateOnNewDocument(t => { try { localStorage.nrTheme = t; } catch {} }, theme);
    await p.goto(BASE + '?demo=1', { waitUntil: 'networkidle0' }); await wait(900);
    await fillOwner(p); await wait(500);
    await p.screenshot({ path: OUT + name + '.png' }); await p.close();
  }
  for (const w of [1440, 1280, 400]) {
    const p = await b.newPage(); watch(p, 'measure' + w);
    await p.setViewport({ width: w, height: 900 });
    await p.goto(BASE, { waitUntil: 'networkidle0' }); await wait(2000);
    console.log('measure' + w, JSON.stringify(await p.evaluate(() => {
      const wm = document.querySelector('.dd-wordmark'), pl = document.querySelector('.dd-plate');
      const r = wm.getBoundingClientRect(), pr = pl.getBoundingClientRect();
      const range = document.createRange(); range.selectNodeContents(wm);
      const cs = getComputedStyle(wm);
      return { wordmarkW: Math.round(r.width), lines: range.getClientRects().length,
        fontSize: cs.fontSize, whiteSpace: cs.whiteSpace,
        plateW: Math.round(pr.width), plateContentW: Math.round(pr.width) - 128,
        fitsInset: Math.round(r.width) <= Math.round(pr.width) - 128 || getComputedStyle(pl).flexDirection === 'row',
        stacked: getComputedStyle(pl).flexDirection === 'row',
        scroll: [document.documentElement.scrollWidth, document.documentElement.clientWidth] };
    })));
    await p.close();
  }
  await b.close();
  console.log('ERRORS:', errs.length ? errs : 'none');
})();
