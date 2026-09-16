// Builds the GitHub Pages site from the module sources. Run: node deploy.js
const fs = require('node:fs'), path = require('node:path');
const read = p => fs.readFileSync(path.join(__dirname, '..', p), 'utf8');
const write = (p, s) => {
  fs.mkdirSync(path.join(__dirname, path.dirname(p)), { recursive: true });
  fs.writeFileSync(path.join(__dirname, p), s);
};

// Only the deployed copy is rewritten: no single relative path reaches a sibling module from both
// the source tree (../../NewsRun/web/index.html) and the site (../newsrun/). Each module page
// declares the siblings it links to as `const <NAME>_URL = '<source path>'`; this swaps in the
// site path for every one it declares, and fails loudly if a swap does not take.
const SITE_URL = {
  NEWSRUN_URL: '../newsrun/',
  FINANCIALS_URL: '../financials/',
  REVENUE_URL: '../revenue/'
};
const siteUrls = (src, where) => Object.entries(SITE_URL).reduce((s, [name, url]) => {
  if (!s.includes('const ' + name + ' = ')) return s;
  const out = s.replace(new RegExp('(const ' + name + " = )'[^']*'"), "$1'" + url + "'");
  if (!out.includes(name + " = '" + url + "'")) throw new Error(name + ' rewrite failed in ' + where);
  return out;
}, src);

write('newsrun/index.html', siteUrls(read('NewsRun/web/index.html'), 'newsrun'));
write('financials/index.html', siteUrls(read('Financials/web/index.html'), 'financials'));
write('revenue/index.html', siteUrls(read('RevenueBreakdown/web/index.html'), 'revenue'));
write('index.html', read('DealDesk-site/home/index.html'));
write('.nojekyll', '');
console.log('built: index.html, newsrun/, financials/, revenue/, .nojekyll');
