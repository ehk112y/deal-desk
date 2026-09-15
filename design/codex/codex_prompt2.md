You are a read-only advisor. Do NOT modify files. Working directory is the NewsRun project.

## Invariant the product owner requires
"One window, one company": a request is always for exactly one company, its report contains exactly one company section, and the report view / company thread in the web page never shows another company's articles. The owner saw a screenshot where the report header read "삼성전자, 현대차" and two company sections were rendered, and wants this made impossible.

## Where to look
- `web/index.html`: request creation (`sendRequest`, main form and follow-up form), thread grouping (`renderRequests`, `companies[0]`), report rendering (`renderReport`, header uses `req.companies.join(', ')`, sections loop), `?demo=1` sample data at the bottom (it currently contains a two-company sample report).
- `newsrun.js`: `cmdCreate` (accepts a comma-separated company list), `cmdFetch` (loops `row.companies`), `cmdMerge` (concatenates every `data/<id>.<n>.out.json` into `content`), `cmdPublish`.
- `supabase.sql`: `companies text[] check (cardinality(companies) between 1 and 5)`.
- `.claude` skill text is not in this directory; ignore it.

## What I want
1. Trace every path by which a report or a thread could end up with more than one company (including the demo data) and list them.
2. For each, the smallest change that enforces the invariant at that layer (DB constraint, CLI validation, merge check, renderer guard, demo data). Give exact snippets.
3. Say explicitly whether the screenshot symptom ("삼성전자, 현대차") can come from real Supabase data given the current code, or only from the demo sample.

Answer in English, numbered, concrete, max 10 items.
