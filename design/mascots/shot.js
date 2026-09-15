const fs = require('fs'), p = require('path');
const puppeteer = require('D:/1. Workspace (AI)/2. Projects/Email/node_modules/puppeteer-core');
const DIR = __dirname;
const chrome = ['C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(fs.existsSync);

(async () => {
  const b = await puppeteer.launch({ executablePath: chrome, headless: 'new' });
  const pg = await b.newPage();
  await pg.setViewport({ width: 1440, height: 1200, deviceScaleFactor: 1 });
  await pg.goto('file:///' + p.join(DIR, 'mascots.html').replace(/\\/g, '/'));
  await pg.screenshot({ path: p.join(DIR, 'mascots.png'), fullPage: true });

  await pg.setViewport({ width: 1440, height: 400, deviceScaleFactor: 3 });
  const el = await pg.$('#smallrow');
  await el.screenshot({ path: p.join(DIR, 'mascots_small.png') });

  await pg.setViewport({ width: 1440, height: 1200, deviceScaleFactor: 1 });
  await pg.goto('file:///' + p.join(DIR, 'mascots_color.html').replace(/\\/g, '/'));
  await pg.screenshot({ path: p.join(DIR, 'mascots_color.png'), fullPage: true });
  await b.close();
  console.log('shots done');
})();
