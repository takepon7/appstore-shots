// Scaffold a spec.json from a directory of raw screenshots.

import { readdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

export async function initSpec(dir, outPath) {
  if (!dir || !existsSync(dir)) {
    throw new Error(`Screenshots directory not found: ${dir}`);
  }
  const imgs = (await readdir(dir))
    .filter((f) => /\.(png|jpe?g)$/i.test(f))
    .sort();
  if (imgs.length === 0) {
    throw new Error(`No .png/.jpg found in ${dir}`);
  }

  const specDir = path.dirname(path.resolve(outPath));
  const spec = {
    device: "iphone-6.9",
    outDir: "appstore-output",
    defaults: {
      background: "#22c55e",
      accent: "#facc15",
      foreground: "#ffffff",
      headlineFont: "Hiragino Sans",
      headlineSize: 78,
      frameColor: "#111111",
      deviceWidth: 330,
      template: "headline-top",
    },
    frames: imgs.map((f, i) => ({
      screenshot: path.relative(specDir, path.resolve(dir, f)) || f,
      headline: `Headline ${i + 1}\n**emphasis**`,
    })),
  };

  await writeFile(outPath, JSON.stringify(spec, null, 2) + "\n", "utf8");
  return { outPath, count: imgs.length };
}
