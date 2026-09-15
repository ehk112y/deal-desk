You are an advisor. Do NOT modify any file. Read `web/index.html` in the working directory and look at the attached screenshots (light desktop, dark desktop, mobile 400px). Then give advice only.

## Context
Single-page internal tool "Deal Desk" (IB/PE tool suite; first module "NewsRun" = curated news reports). Stack: Tailwind v4 browser CDN + DaisyUI v5 CDN + supabase-js, no build step, deployed as a static page on GitHub Pages. Reports are rendered from JSON into white inline-styled cards (Arial 10pt/8pt) that a "Copy formatted" button copies as text/html so the user can paste into Word/Outlook with formatting intact.

## Decisions already made by the product owner (respect them; do not argue against them, advise within them)
- Feel: Bloomberg-terminal density + PitchBook restraint. No landing-page look, no hero, no marketing copy.
- App shell: fixed left sidebar (56px collapsed / 220px expanded) with module list; top bar with module title, user email, theme toggle, log out.
- Content max-width 1400px, 24px side padding, 8px spacing grid. Every module is two columns: left inputs/list 360px, right results. Dense rows 36px, 13px text.
- Typography: Inter (system-ui fallback), 13px base, 15px section titles, 20px page title, labels 500, titles 600, tabular-nums for numbers. Report cards keep Arial 10pt bold titles / 8pt italic source line / 8pt bullets (must not change, they are pasted into Word).
- Palette (exact): Carbon Black #1B2021, Ebony #51513D, Palm Leaf #A6A867, Vanilla Custard #E3DC95, Sand Dune #E3DCC2. Light and dark themes built from these via DaisyUI v5 CSS variables. Report cards stay white in both themes.
- Components: btn-sm 4px radius no shadow; cards 1px border 6px radius no shadow; secondary content in collapse/details with right-aligned arrow; outline badges 11px uppercase; bordered inputs 32px.
- Rules: only opacity/background-color transitions <=120ms; no gradients, illustrations, or emoji in UI; must work at 400px width with the two columns stacked; empty states are one sentence without icon; UI copy in English, report content in its own language.
- Functional decisions: one company per request; requests grouped per company as threads with a follow-up form (period presets Last 24h / 7 days / 30 days + dates + "Exclude items already covered in past runs" checkbox) inside the thread; Korean and English report panels side by side, each collapsible; "Hyperlink" checkbox (off = plain title with full URL beneath in 8pt italic); "More" list under each company = demoted articles, title-only rows that expand to bullets.
- Planned next feature: each "More" row gets a "+" control that promotes the article into the main report above (both languages), removing it from More, so Copy formatted includes it.

## What I want from you (numbered findings, most valuable first, max 15)
For each finding: severity (high/med/low), what is wrong or improvable, and an exact drop-in snippet (CSS/HTML/JS) that I can paste, scoped to the smallest change. No full-file rewrites.

A. Design review against the decisions above: density, hierarchy, spacing rhythm, contrast (light and dark), palette usage, anything that still reads "startup landing page".
B. Report-card readability (title/source/bullets/supplementary gray/More rows) without changing the Arial sizes.
C. Mobile 400px behaviour (stacking, sidebar as top icon row, touch targets).
D. Code review of index.html: correct use of DaisyUI v5 CSS-variable themes with the Tailwind v4 browser CDN (cascade-layer pitfalls, `--radius-*`/`--size-*`/`--depth` variables), accessibility (focus rings, aria for collapse/sidebar/toggles, keyboard), dead CSS, structure of a 700+ line single file.
E. Clipboard: robustness of copying text/html + text/plain so Word, Outlook and PowerPoint keep Arial sizes, italics, gray, bullet indentation; known pitfalls (`<ul>` styling loss, `list-style-type` custom strings, `font` shorthand, `pt` units).
F. UI pattern for the planned "+" promote control on More rows (placement, icon, feedback, undo) that fits the rules above.
G. Anything else you notice that is clearly wrong.

Answer in English. Be concrete; skip generic advice.
