You are a read-only UI advisor. Do NOT modify files. Answer in English, max 12 numbered bullets, concrete.

Product: "Financials from DART", one module of an internal PE/IB tool ("Deal Desk"). Single-file page `web/index.html` in this directory (Tailwind v4 browser CDN + DaisyUI v5; palette Carbon Black #1B2021, Ebony #51513D, Palm Leaf #A6A867, Vanilla Custard #E3DC95, Sand Dune #E3DCC2; density rules: 36px rows, 13px UI text, no cards-in-cards, no gradients/emoji, transitions <=120ms). A screenshot of the current page is `..\..\..\..\..\..\..\Users\ehk11\AppData\Local\Temp\claude\d--1--Workspace--AI-\abdb01c5-4489-4a75-8dd5-af54f3e151ab\scratchpad\finweb\light-editor.png` (if unreadable, rely on the HTML).

Flow: user submits a request (one company, fiscal years from/to, optional LTM quarter) → a worker builds an Excel workbook (Summary section + back data) → the page shows a Summary preview table (metrics as rows, periods as columns) and a download button.

Current "Summary editor" (left column fold): 19 rows, each with editable label, editable formula expression (e.g. `revenue / prev(revenue) - 1`), and a number-format select. Owner's verdict: too messy. Owner's decisions (fixed, advise within them):
1. Remove the expression field and the format field from the UI. Formats are implicit (amount rows vs ratio rows).
2. Add a single "Unit" control at the very top of the request/summary area (e.g. KRW mm default, KRW bn, KRW).
3. Replace "type a label to define a row" with picking metrics from a predefined catalog: the 19 defaults (Revenue, % Growth, EBIT, % Margin, D&A, % Revenue, EBITDA, % Margin, Net Income, % Margin, Total Debt, Cash & CE, Net Debt, Total Assets, Total Liabilities, Non-controlling Interest, Book Value, CapEx, % Revenue) plus analysis ratios (Net Debt / EBITDA, Interest Coverage (EBITDA / interest expense), Total Debt / EBITDA, Debt / Equity, ROE, ROA, FCF = CFO − CapEx, CFO, EBITDA margin, etc.). User chooses which metrics and their order; saves as a named template.

Advise on:
(a) The best interaction pattern for the metric picker inside a 360px-wide left column under the density rules (checklist with drag/arrow ordering? two-pane "available → selected"? grouped toggles?), and how a ratio's definition is shown (tooltip? small muted line?).
(b) Grouping/naming of the catalog (P&L, Cash flow, Balance sheet, Leverage & coverage, Returns), and what "sub-rows" like % Margin should be — separate pickable items or automatic companions of their parent?
(c) Where the Unit control sits and its options; whether it should also affect the preview table.
(d) What to cut from the current left column to make it calmer (field count, folds, template select+Edit button pattern).
(e) A minimal DOM/markup sketch (<= 40 lines) for the picker using existing DaisyUI/Tailwind classes, matching the density rules.
Keep it short. Do not propose new libraries.
