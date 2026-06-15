# App Store screenshot specs

The renderer authors layout in **logical points** and multiplies by
`deviceScaleFactor`, so the output lands on the exact required pixel size.

## iPhone (App Store Connect)

| Display | Required pixels (portrait) | Logical pt | scale | spec `device` |
|---|---|---|---|---|
| 6.9" (iPhone 16 Pro Max) | **1290 × 2796** | 430 × 932 | 3 | `iphone-6.9` |
| 6.5" (iPhone 11 Pro Max / XS Max) | 1242 × 2688 | 414 × 896 | 3 | `iphone-6.5` |

- As of recent App Store Connect, **only the 6.9" set is required**. A 6.9"
  set is auto-scaled down to other iPhone sizes if you omit them.
- 6.7" Pro Max shares the 1290 × 2796 canvas, so `iphone-6.9` covers it.
- Up to **10 screenshots** per device per localization. Minimum 1.
- Landscape is the transpose of the above (e.g. 2796 × 1290).

## iPad

| Display | Required pixels (portrait) | Logical pt | scale | spec `device` |
|---|---|---|---|---|
| 13" iPad Pro | **2064 × 2752** | 1032 × 1376 | 2 | `ipad-13` |

## Format
- PNG or JPG, RGB, no alpha/transparency on the final upload.
- The renderer outputs flat PNG (background fills the whole canvas), which is
  compliant.

## Adding a device
Add an entry to the `DEVICES` table in `scripts/render.mjs`:
```js
"iphone-6.5": { w: 414, h: 896, scale: 3, label: "6.5" },
```
`w * scale` and `h * scale` must equal the required pixel dimensions.

## Android (Google Play) — not implemented
Play Store phone screenshots: 16:9 or 9:16, min 320px, max 3840px on the long
edge. Could be added as another `device` entry later; out of scope for now.
