# Design guide — App Store marketing screenshots

Goal: the first 2–3 screenshots must sell the app at a glance (they show in
search results). Lead with the strongest proof/benefit, not a feature tour.

## Copy (headline) rules
- **One idea per screenshot.** 2 short lines max. ~6–10 Japanese chars per line.
- Lead with proof or outcome: 「ダイエットアプリ **No.1**」「3ヶ月で **-4.66kg**」
  「撮るだけで **カロリー計算**」. Put the punch word in `**…**` so it renders in
  the accent color.
- Order: 1) category win / social proof, 2) core benefit, 3) key feature,
  4) ease-of-use, 5+) secondary features.

## Color
- `background`: brand color, high saturation reads well in the grid.
- `accent`: high-contrast pop color for the emphasized word (yellow on green,
  red on white, etc.). Avoid using accent for more than ~1 phrase per frame.
- `foreground`: headline text color. White on a saturated bg; near-black
  (`#1a1a1a`) on a light/white bg.
- Keep a **consistent background per app** (or a 2-color alternation) so the
  set looks like a series.

Starter palettes:
| Vibe | background | accent | foreground |
|---|---|---|---|
| Health green (あすけん風) | `#22c55e` | `#facc15` | `#ffffff` |
| Bold white (マクド風) | `#ffffff` | `#e8362d` | `#1a1a1a` |
| Trust blue | `#2563eb` | `#fde047` | `#ffffff` |
| Calm dark | `#0f172a` | `#38bdf8` | `#f8fafc` |

## Typography
- Default heavy weight uses the macOS system font (`Hiragino Sans`, weight 900).
- For the rounded, extra-heavy look (あすけん), set `headlineFont` to a bundled
  or web font: **`M PLUS Rounded 1c`** (weight 900) or **`Noto Sans JP`** (900).
  - Quick option: add `@import url('https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@900&display=swap');`
    to the top of `templates/base.css` (needs network at render time), then set
    `"headlineFont": "M PLUS Rounded 1c"` in the spec.
  - Offline option: drop a `.woff2` next to base.css and `@font-face` it.
- `headlineSize` default 78 (logical px). Drop to ~64 for 3-line / long copy.

## Templates
| Template | Look | Use for |
|---|---|---|
| `headline-top` | heavy headline up top, phone below (bottom cropped) | あすけん風. Default. |
| `headline-bottom` | phone up top, headline below | when the screenshot's top half is the hero |
| `headline-overlay` | big phone, headline floating over the top | マクド風 / immersive |
| `full-bleed` | rounded screenshot, no device frame | screenshots that are already full-screen art |

## Per-frame overrides
Any default can be overridden per frame in the spec:
```json
{ "screenshot": "screenshots/paywall.png", "headline": "今だけ **無料**",
  "template": "headline-overlay", "background": "#0f172a", "accent": "#38bdf8",
  "headlineSize": 70, "deviceWidth": 360, "subhead": "いつでも解約できます" }
```
- `subhead`: optional smaller line under the headline (supports `**accent**`).
- `css`: optional raw CSS string injected for that one frame (advanced tweaks).
- `index`: force the output number (otherwise frames number 01, 02, … in order).
