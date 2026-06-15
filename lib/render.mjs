// Core renderer. Composes each frame of a spec into an HTML template and
// screenshots it with headless Chromium at the exact App Store pixel size:
// layout is authored in logical points and multiplied by deviceScaleFactor.

import { chromium } from "playwright";
import { readFile, mkdir, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_TEMPLATES_DIR = path.resolve(__dirname, "..", "templates");

// App Store Connect display classes -> logical points + device scale factor.
// w * scale and h * scale must equal the required pixel dimensions.
export const DEVICES = {
  "iphone-6.9": { w: 430, h: 932, scale: 3, label: "6.9" }, // 1290x2796 (required)
  "iphone-6.5": { w: 414, h: 896, scale: 3, label: "6.5" }, // 1242x2688
  "ipad-13": { w: 1032, h: 1376, scale: 2, label: "ipad-13" }, // 2064x2752
};

const MIME = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg" };

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// \n -> <br>, **emphasis** -> accent-colored span.
function processText(text) {
  if (!text) return "";
  const parts = escapeHtml(text).split(/\*\*(.+?)\*\*/g);
  return parts
    .map((p, i) => (i % 2 === 1 ? `<span class="accent">${p}</span>` : p))
    .join("")
    .replace(/\n/g, "<br>");
}

function applyTemplate(tpl, vars) {
  return tpl.replace(/{{\s*([A-Z_]+)\s*}}/g, (_, key) =>
    key in vars ? vars[key] : ""
  );
}

// Inline the screenshot as a data URI — setContent() pages have an about:blank
// origin, from which Chromium refuses to load file:// subresources.
async function toDataUri(file) {
  const ext = path.extname(file).toLowerCase();
  const mime = MIME[ext] || "image/png";
  const buf = await readFile(file);
  return `data:${mime};base64,${buf.toString("base64")}`;
}

async function loadTemplate(dir, name) {
  const file = path.join(dir, `${name}.html`);
  if (!existsSync(file)) {
    const available = (await readdir(dir))
      .filter((f) => f.endsWith(".html"))
      .map((f) => f.replace(/\.html$/, ""));
    throw new Error(
      `Template "${name}" not found. Available: ${available.join(", ")}`
    );
  }
  return readFile(file, "utf8");
}

// Render a parsed spec. Returns an array of { index, template, out }.
// `onFrame` is an optional progress callback.
export async function renderSpec(spec, { specDir, templatesDir, onFrame } = {}) {
  const tplDir = templatesDir || DEFAULT_TEMPLATES_DIR;
  const baseDir = specDir || process.cwd();

  const deviceKey = spec.device || "iphone-6.9";
  const device = DEVICES[deviceKey];
  if (!device) {
    throw new Error(
      `Unknown device "${deviceKey}". Known: ${Object.keys(DEVICES).join(", ")}`
    );
  }

  const defaults = {
    background: "#22c55e",
    accent: "#facc15",
    foreground: "#ffffff",
    headlineFont: "Hiragino Sans",
    headlineSize: 78,
    frameColor: "#111111",
    deviceWidth: 330,
    template: "headline-top",
    ...(spec.defaults || {}),
  };

  const baseCss = await readFile(path.join(tplDir, "base.css"), "utf8");
  const outDir = path.resolve(baseDir, spec.outDir || "appstore-output", device.label);
  await mkdir(outDir, { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: device.w, height: device.h },
    deviceScaleFactor: device.scale,
  });
  const page = await context.newPage();

  const results = [];
  const frames = spec.frames || [];
  let i = 0;
  try {
    for (const raw of frames) {
      i++;
      const f = { ...defaults, ...raw };
      const shotPath = path.resolve(baseDir, f.screenshot);
      if (!existsSync(shotPath)) {
        if (onFrame) onFrame({ index: i, skipped: true, screenshot: shotPath });
        continue;
      }

      const tpl = await loadTemplate(tplDir, f.template);
      const subhead = f.subhead
        ? `<div class="subhead">${processText(f.subhead)}</div>`
        : "";

      const styleVars = `:root{
        --bg:${f.background};--accent:${f.accent};--fg:${f.foreground};
        --headline-font:"${f.headlineFont}";--headline-size:${f.headlineSize}px;
        --frame-color:${f.frameColor};--device-width:${f.deviceWidth}px;
      }${f.css || ""}`;

      const html = applyTemplate(tpl, {
        STYLE: `<style>${baseCss}\n${styleVars}</style>`,
        HEADLINE: processText(f.headline),
        SUBHEAD: subhead,
        SCREENSHOT: await toDataUri(shotPath),
      });

      await page.setContent(html, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);

      const num = String(f.index || i).padStart(2, "0");
      const out = path.join(outDir, `${num}.png`);
      await page.screenshot({ path: out });
      const result = {
        index: i,
        template: f.template,
        out,
        pixels: `${device.w * device.scale}x${device.h * device.scale}`,
      };
      results.push(result);
      if (onFrame) onFrame(result);
    }
  } finally {
    await browser.close();
  }
  return { outDir, device: deviceKey, results };
}

// Convenience: read a spec file from disk and render it.
export async function renderSpecFile(specPath, opts = {}) {
  const spec = JSON.parse(await readFile(specPath, "utf8"));
  return renderSpec(spec, { specDir: path.dirname(specPath), ...opts });
}
