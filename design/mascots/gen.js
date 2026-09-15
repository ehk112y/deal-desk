const fs = require('fs'), p = require('path');
const DIR = __dirname;
const K = '#1B2021', P = '#F7F5EE';

/* ---------- colour maths ---------- */
const hex2rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const lin = c => (c /= 255) <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
const lum = h => { const [r, g, b] = hex2rgb(h); return .2126 * lin(r) + .7152 * lin(g) + .0722 * lin(b); };
const cr = (a, b) => { const x = lum(a) + .05, y = lum(b) + .05; return x > y ? x / y : y / x; };
const r2 = n => Math.round(n * 100) / 100;

const rgb2hsl = (hex) => {
  const [r, g, b] = hex2rgb(hex).map(v => v / 255);
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn, l = (mx + mn) / 2;
  if (!d) return [0, 0, l];
  const s = d / (1 - Math.abs(2 * l - 1));
  let h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [(h * 60 + 360) % 360, s, l];
};
const hsl2hex = (h, s, l) => {
  const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c / 2;
  const t = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x]
    : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return '#' + t.map(v => Math.round((v + m) * 255).toString(16).padStart(2, '0')).join('');
};
// ink: same hue, ~35% lightness, darkened further only if the eyes/stroke would not hold 3:1 on the body
const inkOf = (hex) => {
  const [h, s] = rgb2hsl(hex);
  for (let L = 0.35; L >= 0.18; L -= 0.02) {
    const c = hsl2hex(h, Math.max(s, 0.5), L);
    if (cr(c, hex) >= 3) return c;
  }
  return hsl2hex(h, Math.max(s, 0.5), 0.18);
};
// tint: lighter wash of the body hue, for belly grid / paper rules
const tintOf = (hex) => { const [h, s, l] = rgb2hsl(hex); return hsl2hex(h, s * 0.75, Math.min(0.9, l + 0.14)); };

/* ---------- the six characters, parameterised on (body, ink, tint) ---------- */
// shared DNA: body fill + 2px ink stroke, rx12 corners, stubby ink limbs rx4.5,
// two ink dot eyes r4.2, no mouth, faint detail in tint only.
function build(S, O, M) {
  const clip = (x, y) => `
  <path d="M50 ${y + 22} V${y + 14}" stroke="${O}" stroke-width="2" stroke-linecap="round" fill="none"/>
  <rect x="${x - 6}" y="${y - 1}" width="12" height="16" rx="6" fill="none" stroke="${O}" stroke-width="2"/>
  <rect x="${x - 2.5}" y="${y + 2.5}" width="5" height="11" rx="2.5" fill="none" stroke="${O}" stroke-width="2"/>`;

  const pencil = (t) => `<g transform="${t}">
  <rect x="46" y="7" width="8" height="15" rx="2" fill="${S}" stroke="${O}" stroke-width="2"/>
  <path d="M46 7 L50 1 L54 7 Z" fill="${O}"/>
  <rect x="46" y="16" width="8" height="2.5" fill="${M}"/></g>`;

  const C = {};

  C.newsrun_A = {
    name: 'Deadline',
    cap: 'Forward-leaning runner, folded paper tucked under the arm, paperclip antenna - already halfway to the next story.',
    svg: `
  <rect x="29" y="72" width="11" height="16" rx="5.5" fill="${O}"/>
  <rect x="57" y="74" width="11" height="14" rx="5.5" fill="${O}"/>
  <rect x="18" y="46" width="9" height="23" rx="4.5" fill="${O}" transform="rotate(14 22.5 48)"/>
  <g transform="rotate(7 50 80)">
    <rect x="24" y="28" width="52" height="50" rx="12" fill="${S}" stroke="${O}" stroke-width="2"/>
    <circle cx="41" cy="50" r="4.2" fill="${O}"/>
    <circle cx="61" cy="50" r="4.2" fill="${O}"/>${clip(50, 6)}
  </g>
  <g transform="rotate(-10 80 62)">
    <rect x="68" y="54" width="24" height="17" rx="2" fill="${S}" stroke="${O}" stroke-width="2"/>
    <path d="M80 55 V70" stroke="${O}" stroke-width="2"/>
    <path d="M71 60 H77 M71 65 H77 M83 60 H89 M83 65 H89" stroke="${M}" stroke-width="2"/>
  </g>
  <rect x="73" y="47" width="9" height="22" rx="4.5" fill="${O}" transform="rotate(-12 77.5 49)"/>`
  };

  C.newsrun_B = {
    name: 'Clipper',
    cap: 'Upright, one stubby arm raised with a fresh clipping - the "found you something" pose.',
    svg: `
  <rect x="32" y="72" width="12" height="16" rx="5.5" fill="${O}"/>
  <rect x="56" y="72" width="12" height="16" rx="5.5" fill="${O}"/>
  <rect x="13" y="50" width="9" height="22" rx="4.5" fill="${O}"/>
  <g transform="rotate(14 86 30)">
    <rect x="74" y="14" width="21" height="18" rx="2" fill="${S}" stroke="${O}" stroke-width="2"/>
    <path d="M78 20 H87 M78 24 H91 M78 28 H85" stroke="${M}" stroke-width="2"/>
  </g>
  <rect x="78" y="30" width="9" height="24" rx="4.5" fill="${O}" transform="rotate(16 82 52)"/>
  <rect x="23" y="32" width="54" height="46" rx="12" fill="${S}" stroke="${O}" stroke-width="2"/>
  <circle cx="40" cy="52" r="4.2" fill="${O}"/>
  <circle cx="60" cy="52" r="4.2" fill="${O}"/>${clip(50, 10)}`
  };

  C.newsrun_C = {
    name: 'Headline',
    cap: 'The body IS a folded broadsheet - masthead rule, crease, columns; mid-stride legs keep it quick.',
    svg: `
  <rect x="30" y="72" width="11" height="17" rx="5.5" fill="${O}"/>
  <rect x="58" y="74" width="11" height="14" rx="5.5" fill="${O}"/>
  <rect x="16" y="46" width="9" height="23" rx="4.5" fill="${O}" transform="rotate(12 20.5 48)"/>
  <rect x="75" y="46" width="9" height="23" rx="4.5" fill="${O}" transform="rotate(-12 79.5 48)"/>
  <rect x="23" y="26" width="54" height="52" rx="12" fill="${S}" stroke="${O}" stroke-width="2"/>
  <rect x="30" y="33" width="40" height="3.5" fill="${O}"/>
  <rect x="30" y="40" width="24" height="2" fill="${M}"/>
  <circle cx="40" cy="54" r="4.2" fill="${O}"/>
  <circle cx="60" cy="54" r="4.2" fill="${O}"/>
  <path d="M24 63 H76" stroke="${M}" stroke-width="2"/>
  <path d="M36 68 V76 M50 68 V76 M64 68 V76" stroke="${M}" stroke-width="2"/>${clip(50, 4)}`
  };

  C.financials_A = {
    name: 'Cell',
    cap: 'Squat spreadsheet-cell body with a faint four-pane grid on the belly, pencil under the arm, feet planted square.',
    svg: `
  <rect x="30" y="74" width="13" height="14" rx="4.5" fill="${O}"/>
  <rect x="57" y="74" width="13" height="14" rx="4.5" fill="${O}"/>
  <g transform="rotate(8 90 56)">
    <rect x="86" y="42" width="8" height="21" rx="2" fill="${S}" stroke="${O}" stroke-width="2"/>
    <path d="M86 63 L90 70 L94 63 Z" fill="${O}"/>
    <rect x="86" y="52" width="8" height="2.5" fill="${M}"/>
  </g>
  <rect x="20" y="32" width="60" height="46" rx="12" fill="${S}" stroke="${O}" stroke-width="2"/>
  <path d="M21 60 H79" stroke="${M}" stroke-width="2"/>
  <path d="M50 61 V77" stroke="${M}" stroke-width="2"/>
  <circle cx="39" cy="47" r="4.2" fill="${O}"/>
  <circle cx="61" cy="47" r="4.2" fill="${O}"/>
  <rect x="15" y="44" width="9" height="24" rx="4.5" fill="${O}"/>
  <rect x="76" y="44" width="9" height="24" rx="4.5" fill="${O}"/>`
  };

  C.financials_B = {
    name: 'Ledger',
    cap: 'Bound ledger clamped under one arm, three ruled cells across the chest, pencil antenna - carries the source with it.',
    svg: `
  <rect x="31" y="74" width="12" height="14" rx="4.5" fill="${O}"/>
  <rect x="57" y="74" width="12" height="14" rx="4.5" fill="${O}"/>
  <g transform="rotate(-8 16 66)">
    <rect x="3" y="57" width="24" height="19" rx="2" fill="${O}"/>
    <rect x="8" y="61" width="21" height="15" rx="1.5" fill="${S}" stroke="${O}" stroke-width="2"/>
  </g>
  <rect x="17" y="44" width="9" height="24" rx="4.5" fill="${O}"/>
  <rect x="77" y="44" width="9" height="24" rx="4.5" fill="${O}"/>
  <rect x="22" y="28" width="56" height="50" rx="12" fill="${S}" stroke="${O}" stroke-width="2"/>
  <circle cx="40" cy="46" r="4.2" fill="${O}"/>
  <circle cx="60" cy="46" r="4.2" fill="${O}"/>
  <rect x="30" y="58" width="40" height="13" fill="none" stroke="${M}" stroke-width="2"/>
  <path d="M43.3 58 V71 M56.6 58 V71" stroke="${M}" stroke-width="2"/>
  <path d="M50 28 V22" stroke="${O}" stroke-width="2" stroke-linecap="round"/>${pencil('rotate(0 50 14)')}`
  };

  C.financials_C = {
    name: 'Tally',
    cap: 'Dead-upright square body, full 3x3 faint grid belly, pencil stowed behind the ear - the meticulous one.',
    svg: `
  <rect x="32" y="74" width="12" height="14" rx="4.5" fill="${O}"/>
  <rect x="56" y="74" width="12" height="14" rx="4.5" fill="${O}"/>
  <rect x="17" y="42" width="9" height="26" rx="4.5" fill="${O}"/>
  <rect x="74" y="42" width="9" height="26" rx="4.5" fill="${O}"/>
  <rect x="24" y="26" width="52" height="52" rx="12" fill="${S}" stroke="${O}" stroke-width="2"/>
  <circle cx="40" cy="44" r="4.2" fill="${O}"/>
  <circle cx="60" cy="44" r="4.2" fill="${O}"/>
  <rect x="29" y="55" width="42" height="21" fill="none" stroke="${M}" stroke-width="2"/>
  <path d="M43 55 V76 M57 55 V76" stroke="${M}" stroke-width="2"/>
  <path d="M29 62 H71 M29 69 H71" stroke="${M}" stroke-width="2"/>${pencil('rotate(30 70 20) translate(20 6)')}`
  };
  return C;
}

const BASE = build('#E3DC95', '#51513D', '#C9C3A6');
const ids = Object.keys(BASE);
for (const id of ids) {
  const n = (BASE[id].svg.match(/<(rect|circle|path|line|polygon|ellipse)\b/g) || []).length;
  if (n > 30) throw new Error(id + ' has ' + n + ' shapes');
}

const writeSvgs = (C, suffix) => ids.forEach(id => fs.writeFileSync(
  p.join(DIR, id + suffix + '.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="200" height="200">${C[id].svg}\n</svg>\n`));

/* ---------- shared sheet chrome ---------- */
const CSS = `
  :root{--k:${K};--s:#E3DC95;--o:#51513D;--p:${P};--m:#C9C3A6}
  *{box-sizing:border-box}
  body{margin:0;width:1440px;background:var(--p);color:var(--k);
    font:14px/1.45 "Inter","Segoe UI",system-ui,sans-serif;-webkit-font-smoothing:antialiased}
  .wrap{padding:0 36px 56px}
  header{background:var(--k);color:var(--s);padding:26px 36px;margin-bottom:28px;
    display:flex;align-items:baseline;justify-content:space-between}
  header h1{margin:0;font-size:22px;letter-spacing:.14em;text-transform:uppercase;font-weight:700}
  header p{margin:0;color:var(--m);font-size:12px;letter-spacing:.06em}
  .pal{display:flex;gap:18px;margin:0 0 26px;flex-wrap:wrap}
  .pal span{display:flex;align-items:center;gap:6px;font-size:11px;color:var(--o);letter-spacing:.04em}
  .pal i{width:16px;height:16px;border:1px solid var(--m);display:block}
  h2{font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:var(--o);
    margin:34px 0 12px;padding-bottom:8px;border-bottom:1px solid var(--m)}
  .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
  .card{border:1px solid var(--m);background:#fff;padding:15px;min-width:0}
  .ch{font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:var(--o);margin-bottom:12px}
  .ch b{background:var(--k);color:var(--s);padding:2px 7px;margin-right:6px}
  .big{display:flex;gap:8px}
  .tile{display:flex;align-items:center;justify-content:center;flex:1}
  .pap{background:var(--p);border:1px solid var(--m)}
  .car{background:var(--k);border:1px solid var(--k)}
  .big .tile{height:200px}
  .mini{display:flex;gap:8px;margin-top:8px}
  .mini>div{flex:1;text-align:center}
  .s48{height:64px}
  .mini i{display:block;font-style:normal;font-size:10px;color:var(--o);margin-top:4px;letter-spacing:.05em}
  .cap{margin:12px 0 0;font-size:12px;line-height:1.5;color:#3a3a2e;min-height:54px}
  .pairs{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
  .pc{min-width:0}
  .pl{font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--o);margin-bottom:8px}
  .pl b{background:var(--k);color:var(--s);padding:2px 6px;margin-right:6px}
  .pairs .tile{height:152px;gap:4px;margin-bottom:8px}
  .p120 svg{flex:none}
  footer{margin-top:34px;font-size:11px;color:var(--o);letter-spacing:.05em}`;

const m = (id, s) => `<svg class="m" width="${s}" height="${s}" viewBox="0 0 100 100"><use href="#${id}" width="100" height="100"/></svg>`;
const page = (title, sub, body, sym) => `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>${title}</title><style>${CSS}</style></head><body>
<svg width="0" height="0" style="position:absolute" aria-hidden="true">${sym}</svg>
<header><h1>${title}</h1><p>${sub}</p></header>
<div class="wrap">${body}</div></body></html>`;

/* ================= SHEET 1 : shapes, site palette ================= */
{
  writeSvgs(BASE, '');
  const sym = ids.map(id => `<symbol id="${id}" viewBox="0 0 100 100">${BASE[id].svg}</symbol>`).join('\n');
  const L = { newsrun: 'Intern 01 &mdash; Newsrun Tracker', financials: 'Intern 02 &mdash; Financials (DART)' };
  const card = (id, letter) => `<div class="card">
  <div class="ch"><b>${letter}</b> <span>${BASE[id].name}</span></div>
  <div class="big"><div class="tile pap">${m(id, 200)}</div><div class="tile car">${m(id, 200)}</div></div>
  <div class="mini">
    <div><div class="tile pap s48">${m(id, 48)}</div><i>48 paper</i></div>
    <div><div class="tile car s48">${m(id, 48)}</div><i>48 carbon</i></div>
    <div><div class="tile pap s48">${m(id, 24)}</div><i>24 paper</i></div>
    <div><div class="tile car s48">${m(id, 24)}</div><i>24 carbon</i></div>
  </div><p class="cap">${BASE[id].cap}</p></div>`;
  const section = k => `<h2>${L[k]}</h2><div class="grid">
${['A', 'B', 'C'].map(x => card(k + '_' + x, x)).join('\n')}</div>`;
  const pairCell = x => `<div class="pc"><div class="pl"><b>${x}</b> ${BASE['newsrun_' + x].name} + ${BASE['financials_' + x].name}</div>
  <div class="tile pap p120">${m('newsrun_' + x, 120)}${m('financials_' + x, 120)}</div>
  <div class="tile car p120">${m('newsrun_' + x, 120)}${m('financials_' + x, 120)}</div></div>`;
  const smallRow = `<div id="smallrow">
${ids.map(id => `<div class="sc"><div class="tile pap s48">${m(id, 24)}</div><div class="tile car s48">${m(id, 24)}</div><div class="tile pap s48">${m(id, 48)}</div><div class="tile car s48">${m(id, 48)}</div><i>${id.startsWith('newsrun') ? '01' : '02'} &middot; ${BASE[id].name}</i></div>`).join('\n')}</div>`;
  const body = `<div class="pal">
  <span><i style="background:${K}"></i>Carbon ${K}</span>
  <span><i style="background:#E3DC95"></i>Sand Dune #E3DC95</span>
  <span><i style="background:#51513D"></i>Olive #51513D</span>
  <span><i style="background:${P}"></i>Paper ${P}</span>
  <span><i style="background:#C9C3A6"></i>Muted #C9C3A6</span></div>
${section('newsrun')}${section('financials')}
<h2>Pair check &mdash; 01 + 02 standing together at 120px</h2>
<div class="card pairs">${['A', 'B', 'C'].map(pairCell).join('\n')}</div>
<h2>Legibility strip &mdash; 24px and 48px, paper and carbon</h2>${smallRow}
<footer>Shared DNA: body fill / 2px ink stroke / rx12 corners / stubby ink limbs rx4.5 / two ink dot eyes r4.2 / no mouth. Faint detail in tint only.</footer>`;
  const extra = `<style>#smallrow{display:flex;gap:10px;background:#fff;border:1px solid var(--m);padding:14px}
  #smallrow .sc{flex:1;display:grid;grid-template-columns:repeat(4,1fr);gap:6px}
  #smallrow .sc i{grid-column:1/-1;font-style:normal;font-size:10px;text-align:center;color:var(--o);letter-spacing:.05em}
  #smallrow .tile{height:56px}</style>`;
  fs.writeFileSync(p.join(DIR, 'mascots.html'),
    page('Bankers&rsquo; Toolkit &middot; Intern Mascots', 'DRAFT CO-DESIGN SHEET &middot; 3 concepts per intern &middot; palette locked to 5', extra + body, sym));
}

/* ================= SHEET 2 : colour pairs ================= */
const PAIRS = [
  { id: 'P1', a: { label: 'Coral', hex: '#E8927C' }, b: { label: 'Sage', hex: '#9DBF9E' } },
  { id: 'P2', a: { label: 'Sky', hex: '#8FB8DE' }, b: { label: 'Mint', hex: '#8FCFB0' } },
  { id: 'P3', a: { label: 'Apricot', hex: '#F2B880' }, b: { label: 'Periwinkle', hex: '#9FA8DA' } },
];

const report = [];
for (const pr of PAIRS) for (const side of ['a', 'b']) {
  const c = pr[side];
  c.ink = inkOf(c.hex); c.tint = tintOf(c.hex);
  c.onPaper = cr(c.hex, P); c.onCarbon = cr(c.hex, K); c.eye = cr(c.ink, c.hex);
  c.pass = c.onPaper >= 1.4 && c.onCarbon >= 3;
  c.C = build(c.hex, c.ink, c.tint);
  report.push(`${pr.id} ${c.label.padEnd(11)} body ${c.hex} ink ${c.ink}  paper ${r2(c.onPaper)}:1  carbon ${r2(c.onCarbon)}:1  eye-on-body ${r2(c.eye)}:1  ${c.pass ? 'PASS' : 'FAIL'}`);
}
console.log(report.join('\n'));

{
  const P1 = PAIRS[0];
  writeSvgs(P1.a.C, '_P1'); // overwritten below for financials; newsrun keeps coral
  ids.filter(i => i.startsWith('financials')).forEach(id => fs.writeFileSync(
    p.join(DIR, id + '_P1.svg'),
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="200" height="200">${P1.b.C[id].svg}\n</svg>\n`));

  const sym = PAIRS.map(pr => ids.map(id => {
    const src = id.startsWith('newsrun') ? pr.a.C : pr.b.C;
    return `<symbol id="${pr.id}_${id}" viewBox="0 0 100 100">${src[id].svg}</symbol>`;
  }).join('\n')).join('\n');

  const chip = (c) => `<span><i style="background:${c.hex}"></i>${c.label} ${c.hex}</span><span><i style="background:${c.ink}"></i>ink ${c.ink}</span><span><i style="background:${c.tint}"></i>tint ${c.tint}</span>`;
  const row = (c) => `<div class="cx ${c.pass ? '' : 'bad'}"><b>${c.label} ${c.hex}</b>
    paper <em>${r2(c.onPaper)}:1</em> ${c.onPaper >= 1.4 ? 'pass' : 'FAIL &lt;1.4'} &middot;
    carbon <em>${r2(c.onCarbon)}:1</em> ${c.onCarbon >= 3 ? 'pass' : 'FAIL &lt;3'} &middot;
    ink on body <em>${r2(c.eye)}:1</em></div>`;

  const pairCard = (pr) => {
    const n = pr.id + '_newsrun_C', f = pr.id + '_financials_A';
    return `<div class="card">
  <div class="ch"><b>${pr.id}</b> <span>${pr.a.label} + ${pr.b.label}</span></div>
  <div class="pal small">${chip(pr.a)}</div><div class="pal small">${chip(pr.b)}</div>
  <div class="big"><div class="tile pap p120">${m(n, 200)}</div><div class="tile car p120">${m(n, 200)}</div></div>
  <div class="big" style="margin-top:8px"><div class="tile pap p120">${m(f, 200)}</div><div class="tile car p120">${m(f, 200)}</div></div>
  <div class="mini">
    <div><div class="tile pap s48">${m(n, 48)}${m(f, 48)}</div><i>48 paper</i></div>
    <div><div class="tile car s48">${m(n, 48)}${m(f, 48)}</div><i>48 carbon</i></div>
    <div><div class="tile pap s48">${m(n, 24)}${m(f, 24)}</div><i>24 paper</i></div>
    <div><div class="tile car s48">${m(n, 24)}${m(f, 24)}</div><i>24 carbon</i></div>
  </div>
  ${row(pr.a)}${row(pr.b)}</div>`;
  };

  const conceptCard = (id) => `<div class="card">
  <div class="ch"><b>${id.startsWith('newsrun') ? '01' : '02'}${id.slice(-1)}</b> <span>${BASE[id].name}</span></div>
  <div class="big"><div class="tile pap p120">${m('P1_' + id, 120)}</div><div class="tile car p120">${m('P1_' + id, 120)}</div></div></div>`;

  const body = `<h2>Section 1 &mdash; colour pairs on the recommended duo (01-C Headline + 02-A Cell)</h2>
<div class="grid">${PAIRS.map(pairCard).join('\n')}</div>
<h2>Section 2 &mdash; every concept in P1 (${PAIRS[0].a.label} / ${PAIRS[0].b.label}) at 120px</h2>
<div class="grid">${ids.map(conceptCard).join('\n')}</div>
<footer>Ink = same hue at ~35% lightness (stepped darker only where eye-on-body fell under 3:1). Tint = same hue, +14% lightness, for belly grid and paper rules.
Thresholds: body vs paper &ge; 1.4:1, body vs carbon &ge; 3:1. Site palette still owns the page chrome (carbon plate, sand wordmark, olive labels).</footer>`;

  const extra = `<style>.pal.small{gap:10px;margin:0 0 8px}
  .pal.small i{width:12px;height:12px}.pal.small span{font-size:10px}
  .big .tile{height:170px}.mini .tile{gap:4px}
  .cx{font-size:11px;color:var(--o);margin-top:8px;padding:5px 7px;background:var(--p);border-left:3px solid #4b7f4b}
  .cx.bad{border-left-color:#b3402a;background:#fdeee9}
  .cx b{display:block;color:var(--k);margin-bottom:2px;letter-spacing:.04em}
  .cx em{font-style:normal;font-weight:700;color:var(--k)}</style>`;

  fs.writeFileSync(p.join(DIR, 'mascots_color.html'),
    page('Bankers&rsquo; Toolkit &middot; Mascot Colour Pairs', 'DRAFT 2 &middot; one colour per intern &middot; measured contrast on paper and carbon', extra + body, sym));
}
console.log('written');
