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

---

# Rounds 6–8 + 2026-09-16

Round 5's plate is intact; what follows is what actually shipped on top of it. Earlier
sections are left as written — read them first, then these deltas.

## What the plate says now

The wordmark is still one line at `clamp(48px, 5vw, 72px)`, `white-space: nowrap`. Under
it the tagline is now **"A bunch of interns working below minimum wage. Legally."** —
round 5's line replaced with the joke the owner kept repeating back.

Between the tagline and the index sits its own 40px ledger row, `.dd-index-note`
(`margin-top: 112px`), reading **"2 interns standing by"** on the left. The row is phase
locked to the pad ruling like every index row, so the scene in its right-hand cell sits on
a rule rather than between two.

The index itself is unchanged in structure: `Intern 01 · Newsrun Tracker` — "Real-time,
well-curated news run. Nothing missed." and `Intern 02 · Financials (DART)` — "Neatly
organized, errorless Excel back data."

## Mascots replace the ID-badge glyphs

Round 5's two monochrome `currentColor` badges are gone. Each intern is now a drawn
character in its own hue from `design/mascots/PALETTE.md` — Intern 01 Coral
(`#E8927C` body / `#98341B` ink / `#EBC9C0` tint), Intern 02 Sage
(`#9DBF9E` / `#256F27` / `#CBD9CB`) — inline SVG, no image requests.

| where | size |
|---|---|
| entrance index rows (`.dd-ava`) | 28px |
| signed-in module tiles | 48px |
| module page header (`.dd-mascot`, both web apps) | 32px |
| module page tab icon | 32px SVG favicon as a `data:` URI in `<link rel="icon">` |

The hues are the only colour on the plate; page chrome stays on the original five.

## The desk scene

`.dd-scene` is a 180×45 CSS box over a `0 0 480 120` viewBox, living in the description
column of the "standing by" row (`.dd-note-cell`, bottom-aligned, `margin-bottom: -2px` so
its floor meets the rule).

Both interns get the identical rig, drawn from behind in Vanilla Custard hairlines: desk
top with two legs, a **centred monitor** (`60×43` at `y27`) with a paper-white `#F7F5EE`
glow behind it (`feGaussianBlur stdDeviation 6`, plus a floor ellipse), a stool, and a PC
tower standing outside the desk's right edge with a white LED dot. The glow breathes
`.3 ↔ .5` over 3s (`dd-breathe`) — the only idle motion, and it is inside
`prefers-reduced-motion: no-preference`, so under reduce the scene is a still drawing.

**The glance.** Every 5s one intern, alternating, turns round: the `.back` group is
swapped for `.turn`, which rotates `-12deg → 0` over **1.2s** `ease-in-out`. At 1.2s a
`!` pops in (`scale .3 → 1`, 150ms). At 1.7s it is caught out: the `!` is dropped, the
whole intern shudders ±2px for 120ms, and `.turn` rotates back `0 → -12deg` in **0.12s**
`ease-in` before `.back` is restored. No pointer input at all. The timer is cleared on
`visibilitychange` when the tab is hidden and restarted when it returns, and the entire
script returns early when `prefers-reduced-motion: reduce` matches.

Canonical source is `design/mascots/scene.js` (`node scene.js` → svg/png); the inline copy
in `home/index.html` must keep the same furniture markup. Headless capture needs
`prefers-reduced-motion: reduce` emulated, otherwise the turn groups are `visibility:
hidden` and the frame comes back empty.

Superseded: the earlier 144×36 scene, and the blue screen light and clipping dummies —
both removed on the owner's instruction in favour of the paper-white glow.

## Sign-in hand-off

Only on an **explicit** Sign in (the form's submit with the `Sign in` tab selected), and
only from inside `prefers-reduced-motion: no-preference`:

1. a `.bt-wipe` plate pinned at the plate's right edge scales to fill the viewport —
   `100vw`, **600ms** `cubic-bezier(.22,1,.36,1)`, while the form fades out over 200ms;
2. at 600ms the page takes an **8px blur** over 250ms;
3. at 850ms, hidden under the blur, the DOM swap happens (`scr-auth` → `scr-main`, scroll
   to top, wipe removed);
4. at 870ms the blur is released over **400ms**.

A MutationObserver on `#scr-main`'s class drives it, so the auth script is untouched.
Arriving with an existing session flips `signingIn` false and there is no transition at
all — the desk is simply there.

## Module page motion

Each module page carries its intern doing the work, driven only by the row's `progress`
(`--p`, 0–1) — the loops are CSS `@keyframes` inside
`@media (prefers-reduced-motion: no-preference)`, no JS animation.

- **Financials `#res-anim`** — Intern 02 in a bandana hauls a concrete `DART` slab on a
  rope, left → right across `--p × 320px` (0.6s ease on each progress update), with a
  price-tag callout showing `NN%` on a string. Body bobs, legs alternate. `done` swaps to
  a seated intern wiping sweat (`.ra-wipe` rocking ±7°, sweat drop falling).
- **NewsRun `#rep-anim`** — Intern 01 in a hard hat mines the rock face with a pickaxe,
  advancing `--p × 300px` while the same `--p` clips the face away, same `NN%` price-tag
  callout. Pickaxe swings `-18° → 118°` on a 0.9s loop, chips fly. `done` swaps to a
  seated intern panting (`.ra-pant` 0.62s, two breath puffs).

Both are `display:none` unless the row is running or done; there is no error state.

## Still rejected

Round 4's "Intern Department" marketing look (vermilion, lime, paper stacks, "Put the
interns to work.") stays rejected — "경박스러워". Only the one idea survived, a module
presented as an intern, and rounds 6–8 spent it on the mascots and the desk scene rather
than on a louder page.
