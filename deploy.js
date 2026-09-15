// Builds the GitHub Pages site from the two app sources. Run: node deploy.js
const fs = require('node:fs'), path = require('node:path');
const read = p => fs.readFileSync(path.join(__dirname, '..', p), 'utf8');
const write = (p, s) => {
  fs.mkdirSync(path.join(__dirname, path.dirname(p)), { recursive: true });
  fs.writeFileSync(path.join(__dirname, p), s);
};

// Only the deployed copy is rewritten: no single relative path reaches NewsRun from both
// Financials/web (../../NewsRun/web/index.html) and /financials/ (../newsrun/).
const fin = read('Financials/web/index.html')
  .replace(/(const NEWSRUN_URL = )'[^']*'/, "$1'../newsrun/'");
if (!fin.includes("NEWSRUN_URL = '../newsrun/'")) throw new Error('NEWSRUN_URL rewrite failed');

write('newsrun/index.html', read('NewsRun/web/index.html'));
write('financials/index.html', fin);
write('index.html', read('DealDesk-site/home/index.html'));
write('.nojekyll', '');
console.log('built: index.html, newsrun/, financials/, .nojekyll');
