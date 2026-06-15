#!/usr/bin/env node
import path from "node:path";
import { existsSync } from "node:fs";
import { renderSpecFile, DEVICES } from "../lib/render.mjs";
import { initSpec } from "../lib/init.mjs";

const USAGE = `appstore-shots — App Store screenshots from your raw screenshots

Usage:
  appstore-shots init <screenshots-dir> [spec.json]   Scaffold a spec
  appstore-shots render <spec.json>                   Render PNGs from a spec
  appstore-shots devices                              List supported devices
  appstore-shots --help

One-time setup after install:
  npx playwright install chromium

Docs: https://github.com/takepon7/appstore-shots`;

const [cmd, ...rest] = process.argv.slice(2);

async function main() {
  switch (cmd) {
    case "init": {
      const dir = rest[0];
      const out = rest[1] || "spec.json";
      if (!dir) return fail("Usage: appstore-shots init <screenshots-dir> [spec.json]");
      const { outPath, count } = await initSpec(dir, out);
      console.log(`Wrote ${outPath} with ${count} frame(s).`);
      console.log(`Edit headlines/colors/templates, then:\n  appstore-shots render ${outPath}`);
      break;
    }
    case "render": {
      const spec = rest[0];
      if (!spec) return fail("Usage: appstore-shots render <spec.json>");
      if (!existsSync(spec)) return fail(`spec not found: ${path.resolve(spec)}`);
      const { outDir, results } = await renderSpecFile(spec, {
        onFrame: (r) =>
          r.skipped
            ? console.error(`  [${r.index}] missing: ${r.screenshot} — skipped`)
            : console.log(
                `  [${r.index}] ${r.template.padEnd(16)} -> ${path.relative(process.cwd(), r.out)} (${r.pixels})`
              ),
      });
      console.log(`\nDone. ${results.length} frame(s) -> ${path.relative(process.cwd(), outDir)}/`);
      break;
    }
    case "devices": {
      for (const [k, d] of Object.entries(DEVICES)) {
        console.log(`  ${k.padEnd(12)} ${d.w * d.scale}x${d.h * d.scale}`);
      }
      break;
    }
    case "--help":
    case "-h":
    case "help":
    case undefined:
      console.log(USAGE);
      break;
    default:
      fail(`Unknown command: ${cmd}\n\n${USAGE}`);
  }
}

function fail(msg) {
  console.error(msg);
  process.exit(1);
}

main().catch((e) => fail(e.message || String(e)));
