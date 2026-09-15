Bankers’ Toolkit on GitHub Pages: built copies of the NewsRun and Financials pages (https://ehk112y.github.io/deal-desk/). Sources live in ../NewsRun/web and ../Financials/web — edit those, not the copies.
Build: `node deploy.js`
Publish: `git add -A && git commit -m "deploy" && git push`

The NewsRun sidebar links to `../financials/`, which only resolves in the built site; opening NewsRun/web/index.html through its own serve.js on :8080 gives a 404 there. Expected.
