# Intern colour ladder

One hue per intern, assigned in order. Interns 01 and 02 are locked; the rest are reserved.

| # | Intern | Hue | Body | Ink (stroke / eyes / limbs) | Tint (belly grid, paper rules) |
|---|--------|-----|------|------------------------------|--------------------------------|
| 01 | Newsrun Tracker (locked) | Coral | `#E8927C` | `#98341B` | `#EBC9C0` |
| 02 | Financials / DART (locked) | Sage | `#9DBF9E` | `#256F27` | `#CBD9CB` |
| 03 | reserved | Sky | `#8FB8DE` | `#295B8A` | `#CBDBE9` |
| 04 | reserved | Periwinkle | `#9FA8DA` | `#2D3A86` | `#D6D9EA` |
| 05 | reserved | Apricot | `#F2B880` | `#A25811` | `#F2DCC8` |
| 06 | reserved | Mint | `#8FCFB0` | `#287750` | `#C5E0D3` |

Intern 03 takes Sky, 04 Periwinkle, 05 Apricot, 06 Mint. After Mint, pick a new muted hue and run it through the derivation below before using it.

## Derivation

- **Ink** — same hue, saturation floored at 0.50, lightness 35%. Step lightness down 2% at a time until ink-on-body contrast reaches **3:1** (eyes and strokes have to hold on the body fill). Coral, Sage, Mint and Apricot each landed at 30-32% this way.
- **Tint** — same hue, saturation x0.75, lightness +14% (capped at 90%). Used only for faint detail that sits on the body: belly grid, newspaper rules, pencil ferrule.
- Ink and tint are never shared between interns. One body hue plus its own ink and tint is the whole character palette.

## Thresholds

Every body hue must clear both, measured as WCAG relative-luminance contrast:

- vs paper `#F7F5EE` — **>= 1.4:1**
- vs carbon `#1B2021` — **>= 3:1**

Measured results (body vs paper / body vs carbon / ink on body):

| Hue | Paper | Carbon | Ink on body |
|-----|-------|--------|-------------|
| Coral | 2.18:1 | 6.93:1 | 3.11:1 |
| Sage | 1.85:1 | 8.14:1 | 3.07:1 |
| Sky | 1.91:1 | 7.90:1 | 3.41:1 |
| Periwinkle | 2.12:1 | 7.13:1 | 4.41:1 |
| Apricot | 1.61:1 | 9.37:1 | 3.03:1 |
| Mint | 1.64:1 | 9.19:1 | 3.05:1 |

If a proposed hue fails paper, darken it; if it fails carbon, lighten it. Do not raise saturation to fix contrast - the ladder stays muted.

## Site palette

Page chrome stays on the original five and does not change: Carbon Black `#1B2021`, Sand Dune `#E3DC95`, olive `#51513D`, paper `#F7F5EE`, muted `#C9C3A6`. Intern hues appear only on the mascots.

## Shared mascot DNA

Body fill with a 3px ink stroke, rx12 corners, stubby ink limbs (rx~5), two ink dot eyes r5, no mouth, faint detail in tint only. Every new intern reuses this construction and changes only the prop and the hue.
