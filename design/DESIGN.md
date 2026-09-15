# Bankers’ Toolkit — suite home (round 5)

Round 3's ledger plate, with the one idea the owner liked from round 4 — a module
presented as an intern — carried over quietly. Round 4's landing page (vermilion, lime,
paper stacks, "Put the interns to work.") is reverted; it is kept at `index_round4.html`
for reference only.

Subject: the entrance to an internal PE/IB toolkit used by the owner and a handful of
allowed colleagues. Its job is two things: let a known person in, then let them pick one
of two modules. Vernacular from the work itself — the columnar accounting pad.

## Tokens (the suite palette, unchanged)

| Token | Light | Dark | Role |
|---|---|---|---|
| Carbon Black `#1B2021` | brand plate, page ink | brand plate, page ground | the plate is Carbon Black in **both** themes |
| Ebony `#51513D` | primary, muted ink | hairlines, secondary | rules and controls |
| Palm Leaf `#A6A867` | secondary | primary (buttons, focus) | the working accent in dark |
| Vanilla Custard `#E3DC95` | wordmark only | wordmark only | spent in exactly one place |
| Sand Dune `#E3DCC2` | hairlines, base-300 | plate ink | every rule on the light side |
| `--dd-lift` | `#FFFFFF` | `#1B2021` + 10% custard | the raised surface (sign-in panel, tiles) |
| `--dd-muted` (dark) | — | 70% Sand Dune | so secondary text reads as secondary |

Theme names stay `deal` / `deal-dark`: the two module pages read the same
`localStorage.nrTheme` this page writes.

## Type

IBM Plex Sans + Noto Sans KR. No display face — scale and tracking carry it.

| px / line-height | weight | used for |
|---|---|---|
| `clamp(48, 5vw, 72)` / 1.08 | 600 | wordmark, **one line at every width** |
| 26 / 32 | 600 | entrance headings, desk heading |
| 20 / 24 | 600 | tile names, Access list, header wordmark |
| 18 / 24 | 400 | the live module figures, tabular |
| 16 | 400 | entrance input text (44px fields) |
| 15 / 24 | 400 | tagline |
| 13 / 20 | 600 / 400 | index rows: module name 600, its line 400 |
| 12 | 400 | the `Intern 01` / `Intern 02` labels, tabular |

The wordmark is `white-space: nowrap` and scales instead of wrapping. It clears the
plate's 64px inset with room at every width (measurements below).

## Layout

Wordmark, tagline and index are one vertically centred group on a 2/3 Carbon Black
plate; the 360px sign-in panel sits in the 1/3 column. Split is
`2fr minmax(408px, 1fr)` — 408 = 360 + two 24px gutters — so the exact 2/3 holds at 1440
and 1280 and the form never shrinks; below 1100px the plate collapses to a 64px header
and the form stacks beneath it.

The pad ruling is a `::before` on the index, inset −64px and overrunning ±2000px (a whole
number of 40px rows), so a rule lands on the index's top border and every row border from
there, wherever the centred group sits. The signed-in desk keeps one 960px grid: topbar
content, both tiles and the 444px Access list all measure off the same two edges.

## The intern framing

Restrained, and entirely in the plate palette — no colour from round 4.

- Each index row is prefixed by a 20px monochrome glyph and a 12px muted tabular label,
  `Intern 01` / `Intern 02`, before the module name. The glyphs are round 4's avatars
  redrawn in `currentColor` at three opacities (.9 / .5 / .42), so they take the plate's
  Sand Dune on the entrance and base-content on the tiles, with no fills of their own.
- Intern 01 is a bordered block with a disc and two rules; Intern 02 is the same block
  quartered with one filled cell. They read as two small ID badges.
- The signed-in tiles carry the same glyph at 24px with the label as an eyebrow above the
  module name, under the page heading "Your interns are at their desks."
- Nothing else: no vermilion, no lime, no paper stacks, no extra headline.

## Motion (round 3, unchanged)

Inside `@media (prefers-reduced-motion: no-preference)`; the script returns early under
reduce, and nothing is hidden at rest. Entrance settles at **480ms** on a 40ms stagger:
ruling `scaleX` 360ms at +0, the source-column rules `scaleY` at +40, wordmark rises 6px
at +40, tagline at +80, index rows at +120 and +160. The pointer highlight snaps between
pad cells — no position or size transition — and only fades (100ms in, 180ms out, opacity
.035). Tab underline slides 160ms off the existing `aria-selected`. Tiles lift, the theme
icon rotates 20°, field borders transition 150ms.

## Checks

Chrome with grayscale antialiasing (`--disable-lcd-text`, so the PNGs show true token
colours rather than LCD subpixel fringing — see `lcdtext_*.png`).

| viewport | wordmark text | size | space inside the inset | slack |
|---|---|---|---|---|
| 1440 | 502.7px | 72px | 832px | 329px |
| 1280 | 446.8px | 64px | 725px | 279px |
| 1101 (last split width) | 384.3px | 55px | 565px | 181px |
| 400 (stacked header) | 142.8px | 20px | 316px | 173px |

One line box at every width. Console errors 0, page errors 0, request failures 0. No
horizontal scroll at 1440 or 400. All ids and every line of auth/data JS unchanged.

## Open issue worth a decision

The two module pages still wear the same suite skin as this page — that is now correct
and consistent again after round 4's detour. Nothing outstanding.
