1. **The screenshot can come from real Supabase data; it is not demo-only.** The current real-data path is:

   `create "삼성전자,현대차"` → `requests.companies = ['삼성전자','현대차']` → fetch both companies → merge both output files → publish both sections → group the request under Samsung using `companies[0]` → render the header with `join(', ')` and render every section.

   The demo explicitly reproduces that combination. The screenshot alone cannot establish which source was used. A main-form submission of the literal text `삼성전자, 현대차` can also produce that header, although it stores **one composite string**, not two array elements.

2. **Database: enforce one company and one matching report section.** In [supabase.sql](<D:/1. Workspace (AI)/2. Projects/NewsRun/supabase.sql:13>), the existing constraint permits 1–5 companies; `reports.content` has no structural constraint. RLS checks ownership, not company identity.

   For the existing database, use this migration. Updating only `CREATE TABLE IF NOT EXISTS` will not change deployed constraints.

   ```sql
   begin;

   alter table public.requests
     drop constraint requests_companies_check,
     add constraint requests_companies_check check (
       cardinality(companies) = 1
       and companies[1] is not null
       and companies[1] = btrim(companies[1])
       and companies[1] <> ''
       and position(',' in companies[1]) = 0
     ),
     add constraint requests_id_companies_key unique (id, companies);

   alter table public.reports
     add constraint reports_one_section check (
       case when jsonb_typeof(content) = 'array'
         then jsonb_array_length(content) = 1
           and jsonb_typeof(content->0->'company') = 'string'
         else false
       end is true
     ),
     add column report_companies text[]
       generated always as (array[content->0->>'company']) stored,
     add constraint reports_matching_company
       foreign key (request_id, report_companies)
       references public.requests (id, companies);

   commit;
   ```

   The generated column plus foreign key prevents a Samsung request from storing a Hyundai section, including through direct privileged API writes. Existing invalid records must be corrected before this migration succeeds; do not silently retain only their first company.

3. **Use shared validation rather than selecting the first company.** Add these helpers to both [newsrun.js](<D:/1. Workspace (AI)/2. Projects/NewsRun/newsrun.js>) and the page script:

   ```js
   function oneCompany(companies) {
     if (!Array.isArray(companies) || companies.length !== 1 ||
         typeof companies[0] !== 'string' ||
         !companies[0].trim() ||
         companies[0] !== companies[0].trim() ||
         companies[0].includes(',')) {
       throw new Error('Exactly one company is required.');
     }
     return companies[0];
   }

   function assertReport(content, req) {
     const company = oneCompany(req?.companies);
     if (!Array.isArray(content) || content.length !== 1 ||
         content[0]?.company !== company ||
         !Array.isArray(content[0]?.items) ||
         !Array.isArray(content[0]?.more ?? [])) {
       throw new Error('Report must contain one matching company section.');
     }
     return company;
   }
   ```

4. **Creation: close both the CLI list path and the form’s composite-string path.** Both main and follow-up forms already use `sendRequest`, which inserts `[company]`. Replace its initial company check with:

   ```js
   company = typeof company === 'string' ? company.trim() : '';
   try { oneCompany([company]); }
   catch (e) { return e.message; }
   ```

   At the beginning of `cmdCreate`:

   ```js
   const company = typeof companies === 'string' ? companies.trim() : '';
   oneCompany([company]);
   ```

   Replace its comma-splitting payload with:

   ```js
   companies: [company],
   ```

   The follow-up form otherwise needs no separate validation: it already passes its thread’s company through `sendRequest`.

5. **Fetch: reject existing multi-company requests and invalid alias results.** `cmdFetch` currently loops over every requested company; `dedupe` can then combine company tags on shared articles. Inside its `try`, before reading keywords, add:

   ```js
   oneCompany(row.companies);
   ```

   Immediately after calculating `canon`, before its PATCH, add:

   ```js
   oneCompany(canon);
   ```

   The existing fetch loop now executes for exactly one validated company. Deduplication cannot introduce another company when all input tags originate from that company. Valid alias canonicalization remains supported.

6. **Merge: reject extra, stale, duplicate, or wrong-company output files.** `cmdMerge` collects *every* matching filename; its filter is broader than numeric `<n>`, and it never checks section count or identity. Even two files for the same company produce two sections.

   Replace its initial `total` declaration with:

   ```js
   const source = JSON.parse(
     fs.readFileSync(path.join(DATA_DIR, `${id}.json`), 'utf8')
   );
   if (source.request?.id !== id) throw new Error('Wrong source request.');
   oneCompany(source.request.companies);
   const total = source.items.length;
   ```

   Immediately after constructing `content`, before calculating statistics or writing:

   ```js
   assertReport(content, source.request);
   assertSources(content, source, source.request);
   ```

   Add this CLI helper to catch articles copied from another request’s output, including `more` articles:

   ```js
   function assertSources(content, source, req) {
     const company = assertReport(content, req);
     if (source.request?.id !== req.id ||
         oneCompany(source.request.companies) !== company) {
       throw new Error('Source request/company mismatch.');
     }

     const allowed = new Set(source.items.map(it => {
       if (oneCompany(it.companies) !== company)
         throw new Error('Mixed-company source articles.');
       return it.originallink || it.link;
     }));

     for (const it of [...content[0].items, ...(content[0].more || [])]) {
       if (!it.link || !allowed.has(it.link))
         throw new Error('Article is outside this request’s source set.');
     }
   }
   ```

7. **Publish: validate independently because callers can bypass merge.** `cmdPublish(id, jsonPath)` currently accepts any report JSON and associates it with any supplied request ID.

   After parsing `{ content, stats }`, before the reports POST:

   ```js
   const [req] = await sb(`requests?id=eq.${id}`);
   if (!req) throw new Error(`request ${id} not found`);
   assertReport(content, req);

   const source = JSON.parse(
     fs.readFileSync(path.join(DATA_DIR, `${id}.json`), 'utf8')
   );
   assertSources(content, source, req);
   ```

   This checks the current database company, the requested ID, both article lists, and their source membership. The database foreign key also prevents a company-change race from committing mismatched report ownership.

8. **Threads: stop hiding mixed requests under `companies[0]`, and clear reports when changing threads.** In [web/index.html](<D:/1. Workspace (AI)/2. Projects/NewsRun/web/index.html:702>), replace the grouping name assignment with:

   ```js
   let name;
   try { name = oneCompany(r.companies); }
   catch { return; } // Do not place an invalid request in any company thread.
   ```

   After updating `openCompany` in `head.onclick`, add:

   ```js
   clearReport();
   ```

   Currently switching threads preserves the previous company’s report, and an outstanding fetch can render after the switch. `clearReport` below clears that content and invalidates pending responses. Also place it in `openReport` **before** the existing `const version = ++reportVersion`:

   ```js
   clearReport();
   ```

9. **Renderer: reject the whole invalid report before caching or displaying anything.** Define:

   ```js
   function clearReport() {
     ++reportVersion;
     lastReport = null;
     $('report-host').replaceChildren();
     $('report-host').removeAttribute('aria-busy');
     $('report-stats').textContent = '';
     $('report-empty').classList.remove('hidden');
     $('copy-btn').disabled = true;
     for (const id of ['copy-btn', 'hyper-label', 'promote-note'])
       $(id).classList.add('hidden');
   }
   ```

   At the very beginning of `renderReport`, before assigning `lastReport`:

   ```js
   let company;
   try {
     company = assertReport(content, req);
     const current = reqs.find(r => r.id === req.id);
     if (company !== openCompany ||
         oneCompany(current?.companies) !== company) {
       throw new Error('Report does not belong to the active company thread.');
     }
   } catch (e) {
     clearReport();
     toast(e.message);
     return;
   }
   $('copy-btn').disabled = false;
   ```

   Replace the header construction with:

   ```js
   const head = [company, `${dot(req.date_from)} ~ ${dot(req.date_to)}`];
   ```

   For refreshed requests, add this at the beginning of `renderRequests`:

   ```js
   if (lastReport) {
     const current = reqs.find(r => r.id === lastReport.req.id);
     try {
       if (oneCompany(current?.companies) !== openCompany)
         throw new Error('Company changed.');
     } catch { clearReport(); }
   }
   ```

   Change the promotion undo check to `if (lastReport?.content !== report.content) return;`. The renderer guard covers both language panels, both section loops, `more`, promotion, hyperlink redraws, and copied content. Changing only the header would leave the contamination intact.

10. **Demo: remove its explicit second section and reuse the actual Samsung request.** At the bottom of the page, delete the entire `{ company: '현대차', ... }` object from the `renderReport` content array. Replace the call’s final arguments with:

    ```js
    ], { total: 184, selected: 2 }, reqs.find(r => r.id === 'd1'));
    ```

    Keep the separate Hyundai pending thread; it is a separate valid request. The thread-clearing guard prevents Samsung articles remaining visible when opening it.

    **Limit:** these changes enforce company identity, section count, and source membership. Free-text names and article text cannot prove semantic identity: a wrongly tagged search result or fabricated summary can still discuss another company. A literal guarantee also requires canonical company IDs and article-relevance validation. No files were modified, and no live Supabase data was inspected.