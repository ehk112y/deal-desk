Read [web/index.html](</D:/1. Workspace (AI)/2. Projects/NewsRun/web/index.html>) and reviewed all three screenshots. No files changed. The visual direction already fits an internal research tool; nothing materially reads like a landing page. The priorities are clipboard fidelity, state preservation, mobile navigation, and disclosure density.

The snippets below are targeted replacements or additions. Office paste behavior was not tested live.

1. **[high] Plain-text copying loses paragraph boundaries, and fallback silently loses formatting.**

   `card` is detached, so its `innerText` behaves like `textContent`: adjacent titles, sources, and bullets can concatenate. Generate plain text from the report JSON instead. Also distinguish formatted success from plain-text fallback. [MDN documents the detached-element behavior](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/innerText).

   Add before the copy handler:

   ```js
   function reportPlainText(langs) {
     return langs.map(lang => lastReport.content.map(sec => {
       const lines = [lang === 'ko' ? sec.company : (sec.company_en || sec.company)];

       for (const it of sec.items || []) {
         const p = pick(it, lang);
         const prefix = it.supplementary
           ? (lang === 'ko' ? '[보완 기사] ' : '[Supplementary] ')
           : '';

         lines.push('', prefix + (p.title || ''));
         if (!$('f-hyperlink').checked) lines.push(it.link || '');
         lines.push(`${p.press || ''} | ${dot(it.date)}`);

         for (const b of p.bullets) {
           lines.push(`• ${b.text}`);
           for (const sub of b.sub || []) lines.push(`  - ${sub}`);
         }
       }
       return lines.join('\n');
     }).join('\n\n')).join('\n\n');
   }
   ```

   Inside the existing copy handler, immediately before `try`, add:

   ```js
   const plain = reportPlainText(open.map(d => d.dataset.lang));
   ```

   Replace its entire `try/catch` and trailing `toast('Copied')` with:

   ```js
   try {
     await navigator.clipboard.write([new ClipboardItem({
       'text/html': new Blob([card.outerHTML], { type: 'text/html' }),
       'text/plain': new Blob([plain], { type: 'text/plain' })
     })]);
     toast('Copied with formatting');
   } catch {
     try {
       await navigator.clipboard.writeText(plain);
       toast('Copied as plain text; formatting unavailable');
     } catch {
       toast('Copy failed; select the report and copy manually');
     }
   }
   ```

   Your single `ClipboardItem` containing both formats is correct. Keep the write directly in the click handler, without preceding network requests. [Clipboard API reference](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/write).

2. **[high] Export typography depends on inheritance, and custom list markers are fragile across Office applications.**

   `font` shorthand is valid CSS; the concrete problem is that descendants inherit typography from containers, while Office may reconstruct those containers and lists. Keep `pt` units. Materialize Arial, sizes, italics, weight, and color onto each copied element.

   For maximum visual consistency, the following export-only helper converts bullets to paragraphs with literal markers and hanging indents. **Tradeoff:** these paste as paragraphs, not editable native Office lists. The on-screen `<ul>` remains unchanged.

   Add before the copy handler:

   ```js
   function clipboardCard(source) {
     const clone = source.cloneNode(true);
     const originals = [source, ...source.querySelectorAll('*')];
     const copies = [clone, ...clone.querySelectorAll('*')];

     originals.forEach((original, i) => {
       const cs = getComputedStyle(original);
       const style = copies[i].style;

       style.removeProperty('font');
       Object.assign(style, {
         fontFamily: 'Arial, sans-serif',
         fontSize: `${parseFloat(cs.fontSize) * 0.75}pt`,
         fontWeight: cs.fontWeight,
         fontStyle: cs.fontStyle,
         color: cs.color,
         lineHeight: cs.lineHeight === 'normal'
           ? 'normal'
           : `${parseFloat(cs.lineHeight) * 0.75}pt`
       });
       copies[i].removeAttribute('id');
     });

     clone.querySelectorAll('ul').forEach(ul => {
       if (ul.parentElement.closest('ul')) return;

       const block = document.createElement('div');
       block.style.margin = '2pt 0 6pt';

       function flatten(list, depth) {
         for (const li of list.children) {
           const p = document.createElement('p');
           p.style.cssText = li.style.cssText;
           p.style.margin = `0 0 0 ${14 + depth * 12}pt`;
           p.style.textIndent = '-8pt';
           p.append(document.createTextNode(depth ? '- ' : '• '));

           for (const child of li.childNodes) {
             if (child.nodeName !== 'UL') p.append(child.cloneNode(true));
           }
           block.append(p);

           for (const child of li.children) {
             if (child.tagName === 'UL') flatten(child, depth + 1);
           }
         }
       }

       flatten(ul, 0);
       ul.replaceWith(block);
     });

     clone.style.padding = '0';
     clone.style.borderRadius = '0';
     return clone;
   }
   ```

   Replace the cloning line in the copy handler:

   ```js
   card.append(clipboardCard($('report-card-' + d.dataset.lang)));
   ```

   This also avoids copying the preview card’s 14pt padding into documents. Do not promise identical results everywhere: Word’s paste settings can override formatting, and PowerPoint for the web documents limitations when pasting from external applications. [Word paste settings](https://support.microsoft.com/en-us/word/control-the-formatting-when-you-paste-text), [PowerPoint web paste behavior](https://support.microsoft.com/en-us/powerpoint/copy-and-paste-in-powerpoint-for-the-web).

3. **[high] Every realtime refresh destroys the follow-up form and resets the user’s dates.**

   `loadRequests()` calls `renderRequests()`, which clears the list and recreates `followUpForm()`. A status update can therefore discard edits while someone is preparing a follow-up.

   Preserve each company’s existing form node. Add beside `openCompany`:

   ```js
   const followUpForms = new Map();
   ```

   Add at the beginning of `followUpForm(company)`:

   ```js
   if (followUpForms.has(company)) return followUpForms.get(company);
   ```

   Add immediately before its `return f`:

   ```js
   followUpForms.set(company, f);
   ```

   In `renderRequests()`, capture focus before `host.textContent = ''`:

   ```js
   const focused = host.contains(document.activeElement)
     ? document.activeElement
     : null;
   ```

   After the final `groups.forEach(...)`:

   ```js
   if (focused && host.contains(focused)) focused.focus({ preventScroll: true });
   ```

   This preserves dates, checkbox state, validation messages, and the focused form control across list refreshes and thread reopening.

4. **[high] Out-of-order responses can display the wrong report; request-loading errors masquerade as an empty list.**

   Clicking run A then B can finish with A displayed if A’s response arrives last. Separately, `loadRequests()` ignores errors and replaces the list with `[]`.

   Replace those two functions:

   ```js
   let requestsVersion = 0;
   let reportVersion = 0;

   async function loadRequests() {
     const version = ++requestsVersion;
     try {
       const { data, error } = await sb.from('requests')
         .select('*').order('created_at', { ascending: false });

       if (version !== requestsVersion) return;
       if (error) throw error;

       reqs = data || [];
       renderRequests();
     } catch {
       if (version === requestsVersion) toast('Could not refresh requests');
     }
   }

   async function openReport(req) {
     if (demo) return toast('The sample report is already displayed');

     const version = ++reportVersion;
     $('copy-btn').disabled = true;
     $('report-host').setAttribute('aria-busy', 'true');

     try {
       const { data, error } = await sb.from('reports')
         .select('content, stats').eq('request_id', req.id).maybeSingle();

       if (version !== reportVersion) return;
       if (error || !data) throw error || new Error('Missing report');

       renderReport(data.content, data.stats, req);
     } catch {
       if (version === reportVersion) toast('Could not load the report');
     } finally {
       if (version === reportVersion) {
         $('copy-btn').disabled = !lastReport;
         $('report-host').removeAttribute('aria-busy');
       }
     }
   }
   ```

   The demo guard also fixes the completed demo row currently calling `.from()` on `sb === null`.

5. **[high] The mobile “icon row” is still a vertical navigation list.**

   Screenshot 3 shows two stacked icons because the sidebar changes direction, but its child `<nav class="flex flex-col">` does not. The sidebar toggle also remains visible despite having no useful mobile effect.

   Append to the CSS:

   ```css
   @media (max-width:480px) {
     .dd-sidebar > nav {
       flex-direction:row;
       gap:8px;
     }

     .dd-sidebar .dd-mod {
       width:40px;
       height:40px;
       padding:0;
     }

     .dd-sidebar #sb-toggle { display:none; }

     .dd-topbar #theme-btn,
     .dd-topbar .logout-btn {
       min-width:40px;
       min-height:40px;
     }

     #req-list [data-preset] { min-height:32px; }

     label:has(> input[type="checkbox"]) {
       min-height:32px;
     }

     .dd-content { padding-top:16px; }
   }

   input[type="date"].input {
     min-width:0;
     flex:1 1 0;
   }
   ```

   This keeps the selected 32px input height, improves touchable labels, and removes roughly one navigation row of wasted mobile height.

6. **[high] Supplementary text fails contrast; several status colors also fail at their actual sizes.**

   Calculated from the declared colors: `#888` on white is **3.54:1**; `#B85C4A` on dark base-200 is **3.31:1**; Palm Leaf on white is **2.49:1**. These are below the 4.5:1 threshold for this small text. [W3C contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).

   In `itemNodes()` and `bulletList()`, replace report gray `#888` with `#707070`—**4.95:1** on white. Keep all Arial sizes unchanged.

   Append:

   ```css
   [data-theme="deal"] {
     --dd-muted:#51513D;
     --color-error:#51513D;
     --color-error-content:#FFFFFF;
   }

   [data-theme="deal-dark"] {
     --dd-muted:color-mix(in srgb, #E3DCC2 80%, #1B2021);
     --color-error:#E3DC95;
     --color-error-content:#1B2021;
   }

   .dd-muted { opacity:1; color:var(--dd-muted); }

   .dd-b-done,
   .dd-b-wait,
   .dd-b-err {
     background:transparent;
   }

   .dd-b-err { border-color:var(--color-error); }

   #login-msg { color:var(--color-base-content); }

   .input {
     border-color:color-mix(
       in srgb, var(--color-base-content) 55%, var(--color-base-100)
     );
   }

   .input::placeholder {
     opacity:1;
     color:var(--dd-muted);
   }
   ```

   This also brings badges back to the specified outline treatment and removes the off-palette red. “ERROR” still communicates the status explicitly.

7. **[med] Promotion should be a separate button beside the disclosure, with persistent one-step Undo.**

   Put the plus at the far right, beside the `<details>`, so activating it cannot also expand the article. Keep the disclosure arrow immediately to its left. Update the shared section data once and rerender both languages.

   Add immediately before `#report-host`:

   ```html
   <div id="promote-note" class="hidden flex items-center gap-2">
     <span id="promote-message" role="status" class="dd-meta"></span>
     <button id="promote-undo" type="button" class="btn btn-sm btn-ghost">
       Undo
     </button>
   </div>
   ```

   Add CSS:

   ```css
   .dd-more-row {
     display:grid;
     grid-template-columns:minmax(0,1fr) 32px;
     gap:8px;
     align-items:start;
   }

   .dd-promote {
     width:32px;
     height:36px;
     padding:0;
   }

   @media (pointer:coarse) {
     .dd-more-row { grid-template-columns:minmax(0,1fr) 40px; }
     .dd-promote { width:40px; height:40px; }
   }
   ```

   Pass `sec` as the fourth argument to the existing `moreBlock(...)` call, and change its signature:

   ```js
   function moreBlock(name, list, lang, sec) {
   ```

   Inside its item loop, replace `body.append(d)` with:

   ```js
   const row = document.createElement('div');
   row.className = 'dd-more-row';

   const add = document.createElement('button');
   add.type = 'button';
   add.className = 'btn btn-sm btn-ghost dd-promote';
   add.textContent = '+';
   add.title = 'Add to report';
   add.setAttribute('aria-label', `Add to report: ${p.title}`);
   add.onclick = () => promoteArticle(sec, it, lang);

   row.append(d, add);
   body.append(row);
   ```

   Add:

   ```js
   function promoteArticle(sec, it, lang) {
     const report = lastReport;
     const index = sec.more.indexOf(it);
     if (index < 0) return;

     const previousItems = [...(sec.items || [])];
     const previousMore = [...sec.more];

     sec.more.splice(index, 1);
     (sec.items ||= []).push(it);

     const redraw = () => {
       renderReport(report.content, report.stats, report.req);
       $('report-host')
         .querySelector(`details[data-lang="${lang}"] > summary`)
         ?.focus({ preventScroll: true });
     };

     redraw();
     $('promote-message').textContent = 'Added to both languages.';
     $('promote-note').classList.remove('hidden');

     $('promote-undo').onclick = () => {
       if (lastReport.content !== report.content) return;
       sec.items = previousItems;
       sec.more = previousMore;
       redraw();
       $('promote-note').classList.add('hidden');
       toast('Article returned to More');
     };
   }
   ```

   At the beginning of `renderReport()`, **before** assigning `lastReport`:

   ```js
   if (lastReport?.content !== content) {
     $('promote-note').classList.add('hidden');
   }
   ```

   Also replace `${stats.selected ?? '-'}` in the report statistics with:

   ```js
   ${content.reduce((n, sec) => n + (sec.items || []).length, 0)}
   ```

   This is a session-local UI implementation; reopening the report from Supabase restores its stored selection. Undo remains available until another promotion or report selection.

8. **[med] Nested viewport breakpoints produce cramped reports when the expanded sidebar consumes space.**

   At 1024px, the expanded sidebar leaves only 804px for the main area, yet both the 360px input/results split and `lg:grid-cols-2` can activate. Base the two decisions on their available containers.

   Remove the existing `@media (min-width:1000px)` rule, then append:

   ```css
   .dd-main { container-type:inline-size; }

   @container (min-width:960px) {
     .dd-cols {
       grid-template-columns:360px minmax(0,1fr);
     }
   }

   #mod-newsrun > :last-child { container-type:inline-size; }

   #report-host {
     grid-template-columns:minmax(0,1fr);
   }

   @container (min-width:680px) {
     #report-host {
       grid-template-columns:repeat(2,minmax(0,1fr));
     }
   }

   #report-host.dd-single-language > details {
     grid-column:1 / -1;
   }
   ```

   Replace `syncGrid()`:

   ```js
   function syncGrid() {
     const panels = [...$('report-host').querySelectorAll('details[data-lang]')];
     const open = panels.filter(d => d.open);

     $('report-host').classList.toggle('dd-single-language', open.length === 1);

     $('copy-btn').title = open.length
       ? `Copies ${open.map(d => d.dataset.lang === 'ko' ? 'Korean' : 'English')
           .join(' and ')}`
       : 'Open a language panel to copy';
   }
   ```

   This retains both desktop layouts in your screenshots and clarifies the existing rule that only expanded languages are copied.

9. **[med] “More” is over-framed and too tall; DaisyUI disclosure motion exceeds your rules.**

   Four nested surfaces compete with the actual report. The default summary padding creates roughly 60–70px More rows. Its source line also contradicts your title-only collapsed-row decision.

   In `moreBlock()`, remove the source-line `s.append(...)`. After creating `inner`, insert:

   ```js
   inner.append(el(
     'div',
     'font:italic 8pt Arial;color:var(--dd-muted);margin-bottom:4pt',
     `${p.press || ''} | ${dot(it.date)}`
   ));
   ```

   Append CSS:

   ```css
   .dd-card-body { padding:16px; }

   #report-host details.collapse { display:block; }

   #report-host details:not([open]) > .collapse-content {
     display:none;
   }

   #report-host .collapse-title {
     min-height:36px;
     padding:8px 40px 8px 16px;
     line-height:20px;
   }

   #report-host .more-item > .collapse-title {
     padding-left:8px;
     overflow-wrap:anywhere;
   }

   #report-host details > .collapse-content {
     padding:0 16px 16px;
   }

   #report-host .more-item > .collapse-content {
     padding:0 8px 8px;
   }

   #report-host [id^="report-card-"] + .dd-card {
     background:transparent;
     border:0;
   }

   #report-host [id^="report-card-"] + .dd-card > .dd-card-body {
     padding:0;
   }

   #report-host .collapse,
   #report-host .collapse-content,
   #report-host .collapse-title::after,
   #report-host details::details-content {
     transition:none;
   }

   .btn:active:not(:disabled) {
     transform:none;
     translate:none;
     scale:1;
   }
   ```

   In `langPanel()`, replace the `sync` function, `d.ontoggle`, and `sync()` call with:

   ```js
   d.ontoggle = syncGrid;
   ```

   Closed-content handling now applies to both language panels and More rows. DaisyUI’s disclosure implementation includes geometry transitions beyond your allowed background/opacity changes. [DaisyUI disclosure source](https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/collapse.css).

10. **[med] Keyboard state and accessible names are incomplete.**

    The sidebar’s `aria-label` always says “Collapse sidebar”; company thread buttons lack expanded state; dates have no accessible names; theme state is not exposed.

    Add inside `paintSidebar()`:

    ```js
    $('sb-toggle').setAttribute('aria-expanded', String(!c));
    $('sb-toggle').setAttribute('aria-controls', 'sidebar');
    $('sb-toggle').setAttribute(
      'aria-label', c ? 'Expand sidebar' : 'Collapse sidebar'
    );
    ```

    Add after theme initialization, and call `paintThemeState()` inside the theme click handler after changing `root.dataset.theme`:

    ```js
    function paintThemeState() {
      $('theme-btn').setAttribute('aria-label', 'Dark theme');
      $('theme-btn').setAttribute(
        'aria-pressed', String(root.dataset.theme === 'deal-dark')
      );
    }
    paintThemeState();
    ```

    Add after creating each company `head`, and replace its click handler:

    ```js
    head.dataset.company = name;
    head.setAttribute('aria-expanded', String(openCompany === name));

    head.onclick = () => {
      openCompany = openCompany === name ? null : name;
      renderRequests();
      [...$('req-list').querySelectorAll('[data-company]')]
        .find(b => b.dataset.company === name)?.focus({ preventScroll: true });
    };
    ```

    Add once during initialization:

    ```js
    $('login-email').setAttribute('aria-label', 'Email address');
    document.querySelector('.logout-btn').setAttribute('aria-label', 'Log out');

    $('toast-msg').setAttribute('role', 'status');
    $('toast-msg').setAttribute('aria-atomic', 'true');

    document.querySelectorAll('[data-module]').forEach(button => {
      const sync = () => {
        document.querySelectorAll('[data-module]').forEach(b => {
          b.setAttribute('aria-pressed', String(b.classList.contains('dd-active')));
        });
      };
      button.addEventListener('click', sync);
      sync();
    });
    ```

    Append focus styling:

    ```css
    :is(button,a,summary,input):focus-visible {
      outline:2px solid var(--color-primary);
      outline-offset:2px;
    }

    [id^="report-card-"] a:focus-visible {
      outline-color:#51513D;
    }
    ```

    Native `<details>/<summary>` already supplies disclosure semantics; do not add redundant button roles or manually maintained `aria-expanded` to those summaries. [Native details reference](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/details).

11. **[med] Date presets use the browser timezone, allow inverted ranges, and remain selected after manual edits.**

    The “local / KST” comment is inaccurate outside Korea. Replace `ymd()`:

    ```js
    const kstDate = new Intl.DateTimeFormat('en-CA', {
      timeZone:'Asia/Seoul',
      year:'numeric', month:'2-digit', day:'2-digit'
    });

    const ymd = back => {
      const parts = Object.fromEntries(
        kstDate.formatToParts(new Date()).map(p => [p.type, p.value])
      );
      const date = new Date(`${parts.year}-${parts.month}-${parts.day}T00:00:00Z`);
      date.setUTCDate(date.getUTCDate() - back);
      return date.toISOString().slice(0, 10);
    };
    ```

    In `wirePresets()`, replace the existing `btns.forEach` inside `set()`:

    ```js
    btns.forEach(b => {
      const active = +b.dataset.preset === days;
      b.classList.toggle('btn-active', active);
      b.setAttribute('aria-pressed', String(active));
    });
    toEl.min = fromEl.value;
    fromEl.max = toEl.value;
    ```

    Before `set(7)`, add:

    ```js
    fromEl.setAttribute('aria-label', 'Start date');
    toEl.setAttribute('aria-label', 'End date');

    [fromEl, toEl].forEach(input => input.addEventListener('input', () => {
      btns.forEach(b => {
        b.classList.remove('btn-active');
        b.setAttribute('aria-pressed', 'false');
      });
      toEl.min = fromEl.value;
      fromEl.max = toEl.value;
    }));
    ```

    After the company validation in `sendRequest()`:

    ```js
    if (!from || !to) return 'Choose a start and end date.';
    if (from > to) return 'Start date must be on or before end date.';
    ```

    One remaining contract issue: “Last 24h” submits yesterday/today as dates. This file alone cannot establish whether the collector interprets that as a rolling 24-hour interval. Keep the chosen label, but verify that backend behavior separately; the snippet above fixes timezone and range handling.

12. **[med] Repeated submissions can create duplicate requests, and rejected promises lack visible recovery.**

    Both request forms leave their submit buttons enabled during insertion. Wrap their existing handlers instead of duplicating submission logic.

    Add:

    ```js
    function guardSubmit(form) {
      const submit = form.onsubmit;

      form.onsubmit = async event => {
        event.preventDefault();
        if (form.dataset.busy) return;

        const button = form.querySelector('button:not([type="button"])');
        const alertBox = form.querySelector('.alert');

        form.dataset.busy = '1';
        form.setAttribute('aria-busy', 'true');
        button.disabled = true;

        try {
          await submit(event);
        } catch {
          alertBox.textContent = 'Request failed. Please try again.';
          alertBox.classList.remove('hidden');
        } finally {
          delete form.dataset.busy;
          form.removeAttribute('aria-busy');
          button.disabled = false;
        }
      };
    }
    ```

    Immediately after the main form’s existing handler assignment:

    ```js
    guardSubmit($('req-form'));
    ```

    In `followUpForm()`, after assigning `f.onsubmit` and before caching/returning it:

    ```js
    guardSubmit(f);
    ```

13. **[low] Theme configuration is correct; remove unused theme payload and obsolete classes rather than restructuring the page.**

    Your `--radius-*`, `--size-*`, `--border`, `--depth:0`, and `--noise:0` use the correct DaisyUI v5 variables. Custom `[data-theme]` declarations are supported with the CDN; no `@plugin` block is needed here. [DaisyUI custom themes](https://daisyui.com/docs/themes/).

    Replace the two DaisyUI stylesheet links with just:

    ```html
    <link
      href="https://cdn.jsdelivr.net/npm/daisyui@5.7.37"
      rel="stylesheet"
      type="text/css">
    ```

    `themes.css` loads built-in themes you never select. Remove `input-bordered` from static markup and generated templates; v5 inputs are bordered by default. Example:

    ```html
    <input id="f-company" type="text"
      class="input input-sm w-full"
      placeholder="Samsung Electronics" required>
    ```

    [CDN theme loading](https://daisyui.com/docs/cdn/), [v5 input changes](https://daisyui.com/docs/upgrade/).

    Keep `.dd-cols.hidden { display:none }`: it is a necessary local correction because unlayered custom CSS outranks normal layered utilities. Avoid wrapping the entire current stylesheet in a new layer without auditing the resulting order. [CSS layer precedence](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@layer).

    For this single file, the useful structural improvement is the focused helpers above—clipboard export, submission guarding, and promotion—not a full rewrite or a new build system.