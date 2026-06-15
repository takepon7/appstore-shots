# appstore-shots — web app

A no-install, browser-based version of appstore-shots for non-engineers.
Drag in raw screenshots, type headlines, pick colors and a template, and
download App Store-ready PNGs. **Fully client-side** — images are processed in
the browser with `<canvas>` and never uploaded to a server.

## Run locally

```bash
cd web
npm install
npm run dev      # http://localhost:3000
```

## Deploy to Vercel

The app is a standard Next.js project living in the `web/` subdirectory of the
repo. On Vercel:

1. Import the `appstore-shots` GitHub repo.
2. Set **Root Directory** to `web`.
3. Deploy. No environment variables, no backend — it builds to static output and
   runs entirely in the visitor's browser (free tier is plenty).

Or from the CLI:

```bash
cd web
npx vercel        # preview
npx vercel --prod # production
```

## How it works

- The live preview is real DOM/CSS (the same layout as the CLI templates).
- Export composites the layout onto a `<canvas>` at the exact device pixel size
  (e.g. 1290×2796) and exports a PNG. `canvas.drawImage` handles large
  screenshots natively, so export is instant and works in every browser —
  unlike DOM-to-image rasterizers, which choke on big embedded images.
- Multiple screenshots download together as a zip.

## Notes

- Default headline font is the system heavy weight. Swap in a web font (e.g.
  `Noto Sans JP` / `M PLUS Rounded 1c` at weight 900) for the rounded extra-bold
  look — add it via `next/font` and set it as the canvas font family.
- Keep headline lines short (~5 full-width Japanese characters). Long lines wrap;
  lower the size slider for longer copy.
