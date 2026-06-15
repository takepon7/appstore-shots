---
name: appstore-screenshots
description: >-
  Generate polished App Store / アプリストア用の訴求スクリーンショット (store listing
  images / プロモ画像 / キャプチャ) from raw app screenshots — bold headline + device
  frame + colored background, exported at exact App Store Connect pixel sizes.
  Use whenever the user wants to make, generate, design, or improve App Store /
  iOS アプリストア screenshots, store promo images, or lay out raw screenshots
  nicely for the store.
license: MIT
---

# App Store screenshot generator

Turn raw app screenshots into App Store listing images via the bundled
`appstore-shots` CLI (Node + headless Chromium). Layout is authored in logical
points and multiplied by deviceScaleFactor, so output is pixel-exact.

The CLI lives at `${CLAUDE_PLUGIN_ROOT}/bin/cli.mjs`.

## Workflow
1. **Locate inputs & scope.** Ask where the raw screenshots are and what each
   should say (or read the app to draft copy). See `references/design-guide.md`.
2. **One-time setup** (only if not done), from `${CLAUDE_PLUGIN_ROOT}`:
   ```bash
   npm install --omit=dev
   npx playwright install chromium
   ```
3. **Scaffold a spec** (optional):
   ```bash
   node ${CLAUDE_PLUGIN_ROOT}/bin/cli.mjs init <screenshots-dir> path/to/spec.json
   ```
4. **Edit** headlines, colors (`background`/`accent`), and `template` per frame.
5. **Render:**
   ```bash
   node ${CLAUDE_PLUGIN_ROOT}/bin/cli.mjs render path/to/spec.json
   ```
   Output PNGs land in `<outDir>/<device-label>/01.png` … next to the spec.
6. **Review & iterate.** Open the PNGs, tweak the spec, re-run. Verify size with
   `sips -g pixelWidth -g pixelHeight <png>` (6.9" must be 1290×2796).

## spec.json (minimal)
```json
{
  "device": "iphone-6.9",
  "outDir": "appstore-output",
  "defaults": { "background": "#22c55e", "accent": "#facc15", "template": "headline-top" },
  "frames": [
    { "screenshot": "screenshots/home.png", "headline": "ダイエット\nアプリ **No.1**" }
  ]
}
```
- `**word**` → accent color. `\n` → line break. Any default is overridable per
  frame (`background`, `accent`, `headlineSize`, `deviceWidth`, `subhead`,
  `template`).

## Templates
`headline-top` (default), `headline-bottom`, `headline-overlay`, `full-bleed`.
See `references/design-guide.md` for palettes, copy tips, and the font swap for
the rounded extra-bold look.

## Notes
- Keep headline lines short (≈5 full-width JP chars). Long lines wrap — drop
  `headlineSize` to ~64 for longer copy.
- Scope is image generation only — no App Store Connect upload, no App Preview.
