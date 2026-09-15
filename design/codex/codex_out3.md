1. **Use one list with two views: “Selected (19)” and “Catalog.”** Selected shows workbook order; Catalog shows searchable, grouped checkboxes. Checking adds to the end; unchecking removes. Avoid two panes at 360px. Use up/down buttons for ordering; drag can be optional.

2. **Keep each row 36px tall.** Show a fixed metric name, with controls on the right. Put definitions behind a focusable “i” button: tooltip on hover/focus, toggled on click. Example: “Interest coverage = EBITDA ÷ interest expense; displayed as x.” Avoid permanent second lines.

3. **Use these catalog groups:** **P&L:** Revenue, Revenue growth, EBIT, D&A, EBITDA, Net income, related margins. **Cash flow:** CFO, CapEx, CapEx / Revenue, FCF. **Balance sheet:** debt, cash, assets, liabilities, NCI, equity. **Leverage & coverage:** Net debt / EBITDA, Total debt / EBITDA, Interest coverage, Total debt / Equity. **Returns:** ROE, ROA. Define accounting scope in the information text; the current “Cash & CE” includes short-term financial assets.

4. **Make companion ratios independently pickable.** Name them “EBIT margin,” “EBITDA margin,” “Net income margin,” “D&A / Revenue,” and “CapEx / Revenue.” Preselect them beside their parents in the default template. Indent in the preview only when adjacent; retain explicit names when moved. “EBITDA margin” should have one catalog identity, not a duplicate analysis entry.

5. **Place Unit above “New request,” outside every fold:** `KRW mm (millions)` default, `KRW bn (billions)`, `KRW`. Apply it to amount cells in the preview and generated Summary; percentages and multiples remain unchanged. Show the unit in the preview header. Existing downloads retain their saved unit—identify it beside the download button if the preview has been rescaled.

6. **Flatten the left column.** Keep request fields visible; hide LTM year until a quarter is chosen. Replace template select + Edit + separate editor fold with a template select followed immediately by one **“Customize metrics · 19”** disclosure. Remove label inputs, expression help, key chips, format selectors, and Add row. Reveal the name field only after **“Save as template.”** Default becomes a template choice; collapse My requests initially.

7. **One implementation prerequisite:** use stable metric IDs and resolve dependencies independently of display order. The current HTML relies on earlier rows publishing aliases; otherwise removing EBITDA or moving Net Debt can break calculations. Implicit formats need three types: amounts, percentages, and multiples.

8. **Minimal picker sketch:** repeat the sample rows; wire view switching, selection, ordering, and saving with existing JavaScript. Reuses your theme and 36px button/input defaults.

   ```html
   <section class="text-[13px]" aria-label="Summary metrics">
     <div class="flex h-9 items-center justify-between">
       <button type="button" class="btn btn-ghost" aria-pressed="true"
         data-view="selected">Selected (19)</button>
       <button type="button" class="btn btn-ghost" aria-pressed="false"
         data-view="catalog">Catalog</button>
     </div>
     <ol data-panel="selected" class="max-h-[360px] overflow-y-auto">
       <li class="flex h-9 items-center gap-2 border-b border-base-300">
         <label class="flex min-w-0 flex-1 items-center gap-2">
           <input type="checkbox" checked class="checkbox"
             data-metric="ebitda_margin">
           <span class="truncate">EBITDA margin</span>
         </label>
         <div class="tooltip tooltip-left" data-tip="EBITDA ÷ Revenue (%)">
           <button type="button" class="btn btn-ghost !w-9 !px-0"
             aria-label="Definition: EBITDA divided by Revenue, percent">i</button>
         </div>
         <button type="button" class="btn btn-ghost !w-9 !px-0"
           aria-label="Move EBITDA margin up">↑</button>
         <button type="button" class="btn btn-ghost !w-9 !px-0"
           aria-label="Move EBITDA margin down">↓</button>
       </li>
     </ol>
     <div data-panel="catalog" hidden>
       <input type="search" class="input" aria-label="Find metrics"
         placeholder="Find metrics">
       <h3 class="flex h-9 items-center font-medium dd-muted">Cash flow</h3>
       <label class="flex h-9 items-center gap-2 border-b border-base-300">
         <input type="checkbox" class="checkbox" data-metric="cfo">CFO
       </label>
     </div>
     <button type="button" class="btn btn-ghost mt-2">Save as template</button>
   </section>
   ```
