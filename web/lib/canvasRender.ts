import { Device, frameSize } from "./devices";
import type { FrameData } from "@/components/ScreenshotFrame";

// Export path. Instead of rasterizing the DOM (SVG foreignObject hangs on large
// embedded screenshots), we composite the same parametric layout onto a canvas:
// drawImage handles big images natively and toDataURL is instant + universal.
// Geometry mirrors templates/base.css so export matches the live DOM preview.

interface Run {
  text: string;
  accent: boolean;
}

const PAD_X = 28;
const LINE_RATIO = 1.12;
const SUBHEAD_SIZE = 30;
const SUBHEAD_MARGIN = 18;

function fontFor(frame: FrameData, size: number, weight: number) {
  return `${weight} ${size}px "${frame.headlineFont}", "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Yu Gothic", sans-serif`;
}

function parseLine(line: string): Run[] {
  const parts = line.split(/\*\*(.+?)\*\*/g);
  const runs: Run[] = [];
  parts.forEach((p, i) => {
    if (p) runs.push({ text: p, accent: i % 2 === 1 });
  });
  return runs;
}

// Char-level wrap (Japanese wraps anywhere), preserving accent runs.
function wrapRuns(ctx: CanvasRenderingContext2D, runs: Run[], maxWidth: number): Run[][] {
  const lines: Run[][] = [];
  let cur: Run[] = [];
  let curW = 0;
  const push = (ch: string, accent: boolean) => {
    const w = ctx.measureText(ch).width;
    if (curW + w > maxWidth && cur.length) {
      lines.push(cur);
      cur = [];
      curW = 0;
    }
    const last = cur[cur.length - 1];
    if (last && last.accent === accent) last.text += ch;
    else cur.push({ text: ch, accent });
    curW += w;
  };
  for (const run of runs) for (const ch of [...run.text]) push(ch, run.accent);
  if (cur.length) lines.push(cur);
  return lines;
}

function layoutText(
  ctx: CanvasRenderingContext2D,
  frame: FrameData,
  maxWidth: number
): { lines: Run[][]; subLines: Run[][]; height: number } {
  ctx.font = fontFor(frame, frame.headlineSize, 900);
  const lines: Run[][] = [];
  for (const raw of frame.headline.split("\n")) {
    const wrapped = wrapRuns(ctx, parseLine(raw), maxWidth);
    if (wrapped.length === 0) lines.push([{ text: "", accent: false }]);
    else lines.push(...wrapped);
  }
  let height = lines.length * frame.headlineSize * LINE_RATIO;

  let subLines: Run[][] = [];
  if (frame.subhead) {
    ctx.font = fontFor(frame, SUBHEAD_SIZE, 700);
    for (const raw of frame.subhead.split("\n")) {
      const wrapped = wrapRuns(ctx, parseLine(raw), maxWidth - 16);
      subLines.push(...(wrapped.length ? wrapped : [[{ text: "", accent: false }]]));
    }
    height += SUBHEAD_MARGIN + subLines.length * SUBHEAD_SIZE * 1.4;
  }
  return { lines, subLines, height };
}

function drawLines(
  ctx: CanvasRenderingContext2D,
  frame: FrameData,
  lines: Run[][],
  topY: number,
  size: number,
  weight: number,
  lineRatio: number,
  centerX: number
) {
  ctx.font = fontFor(frame, size, weight);
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  const lineH = size * lineRatio;
  const lead = (lineH - size) / 2;
  let y = topY;
  for (const line of lines) {
    const widths = line.map((r) => ctx.measureText(r.text).width);
    const lineW = widths.reduce((a, b) => a + b, 0);
    let x = centerX - lineW / 2;
    for (let i = 0; i < line.length; i++) {
      ctx.fillStyle = line[i].accent ? frame.accent : frame.foreground;
      ctx.fillText(line[i].text, x, y + lead);
      x += widths[i];
    }
    y += lineH;
  }
}

function drawHeadlineBlock(
  ctx: CanvasRenderingContext2D,
  frame: FrameData,
  layout: { lines: Run[][]; subLines: Run[][] },
  topY: number,
  centerX: number
) {
  drawLines(ctx, frame, layout.lines, topY, frame.headlineSize, 900, LINE_RATIO, centerX);
  if (layout.subLines.length) {
    const subTop = topY + layout.lines.length * frame.headlineSize * LINE_RATIO + SUBHEAD_MARGIN;
    drawLines(ctx, frame, layout.subLines, subTop, SUBHEAD_SIZE, 700, 1.4, centerX);
  }
}

function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const ir = img.naturalWidth / img.naturalHeight;
  const br = w / h;
  let dw: number, dh: number;
  if (ir > br) {
    dh = h;
    dw = h * ir;
  } else {
    dw = w;
    dh = w / ir;
  }
  const dx = x + (w - dw) / 2; // center horizontally
  const dy = y; // top aligned (object-position: top center)
  ctx.drawImage(img, dx, dy, dw, dh);
}

function drawDevice(
  ctx: CanvasRenderingContext2D,
  frame: FrameData,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  island: boolean
) {
  const border = 11;
  // body + soft shadow
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.28)";
  ctx.shadowBlur = 64;
  ctx.shadowOffsetY = 26;
  ctx.fillStyle = frame.frameColor;
  roundRectPath(ctx, x, y, w, h, 54);
  ctx.fill();
  ctx.restore();
  // screen
  const sx = x + border;
  const sy = y + border;
  const sw = w - border * 2;
  const sh = h - border * 2;
  ctx.save();
  roundRectPath(ctx, sx, sy, sw, sh, 44);
  ctx.clip();
  drawImageCover(ctx, img, sx, sy, sw, sh);
  ctx.restore();
  // dynamic island (phones only — iPad has none)
  if (island) {
    const iw = Math.min(w * 0.3, 108);
    ctx.fillStyle = "#0a0a0a";
    roundRectPath(ctx, x + (w - iw) / 2, y + border + 12, iw, 26, 16);
    ctx.fill();
  }
}

function drawShot(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number
) {
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.28)";
  ctx.shadowBlur = 64;
  ctx.shadowOffsetY = 26;
  ctx.fillStyle = "#fff";
  roundRectPath(ctx, x, y, w, h, 40);
  ctx.fill();
  ctx.restore();
  ctx.save();
  roundRectPath(ctx, x, y, w, h, 40);
  ctx.clip();
  drawImageCover(ctx, img, x, y, w, h);
  ctx.restore();
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image load failed"));
    img.src = src;
  });
}

export async function frameToPng(frame: FrameData, device: Device): Promise<string> {
  if (document.fonts && document.fonts.ready) await document.fonts.ready;
  const img = await loadImage(frame.image);

  const canvas = document.createElement("canvas");
  canvas.width = device.w * device.scale;
  canvas.height = device.h * device.scale;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(device.scale, device.scale);

  // background
  ctx.fillStyle = frame.background;
  ctx.fillRect(0, 0, device.w, device.h);

  const centerX = device.w / 2;
  const maxWidth = device.w - PAD_X * 2;
  // Frame size derives from the selected device (iPad renders as an iPad).
  const { w: dw, h: dh } = frameSize(device, frame.template);
  const island = device.kind === "phone";
  const layout = layoutText(ctx, frame, maxWidth);

  switch (frame.template) {
    case "headline-top": {
      const top = 96;
      drawHeadlineBlock(ctx, frame, layout, top, centerX);
      const dy = top + layout.height + 56;
      drawDevice(ctx, frame, img, (device.w - dw) / 2, dy, dw, dh, island);
      break;
    }
    case "full-bleed": {
      const top = 92;
      drawHeadlineBlock(ctx, frame, layout, top, centerX);
      const dy = top + layout.height + 52;
      drawShot(ctx, img, (device.w - dw) / 2, dy, dw, dh);
      break;
    }
    case "headline-bottom": {
      const total = dh + 52 + layout.height;
      const top = Math.max(40, (device.h - total) / 2);
      drawDevice(ctx, frame, img, (device.w - dw) / 2, top, dw, dh, island);
      drawHeadlineBlock(ctx, frame, layout, top + dh + 52, centerX);
      break;
    }
    case "headline-overlay": {
      const dy = device.h + 90 - dh;
      drawDevice(ctx, frame, img, (device.w - dw) / 2, dy, dw, dh, island);
      drawHeadlineBlock(ctx, frame, layout, 88, centerX);
      break;
    }
  }

  return canvas.toDataURL("image/png");
}
