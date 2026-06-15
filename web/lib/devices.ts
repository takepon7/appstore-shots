// App Store Connect display classes. Layout is authored in logical points (w×h)
// and exported at `scale`, so output hits the exact required pixel size.

export type DeviceKey = "iphone-6.9" | "iphone-6.5" | "ipad-13";

export interface Device {
  w: number;
  h: number;
  scale: number;
  label: string;
  px: string;
  desc: string;
  kind: "phone" | "tablet";
  // Device-frame geometry (logical px): screen height/width ratio + default
  // frame width. Derived from each device so the mockup matches what's selected.
  screenRatio: number;
  frameW: number;
}

export const DEVICES: Record<DeviceKey, Device> = {
  "iphone-6.9": { w: 430, h: 932, scale: 3, label: "6.9\"", px: "1290×2796", desc: "iPhone 16 Pro Max など", kind: "phone", screenRatio: 2796 / 1290, frameW: 330 },
  "iphone-6.5": { w: 414, h: 896, scale: 3, label: "6.5\"", px: "1242×2688", desc: "iPhone 11 Pro Max など", kind: "phone", screenRatio: 2688 / 1242, frameW: 318 },
  "ipad-13": { w: 1032, h: 1376, scale: 2, label: "iPad 13\"", px: "2064×2752", desc: "iPad Pro 13インチ", kind: "tablet", screenRatio: 2752 / 2064, frameW: 800 },
};

// Device-frame size for a given template, derived from the selected device so
// an iPad renders as an iPad (wider, ~3:4) and an iPhone as a tall phone.
export function frameSize(device: Device, template: TemplateKey) {
  let w = device.frameW;
  if (template === "headline-overlay") w = Math.round(device.frameW * 1.09);
  if (template === "headline-bottom" && device.kind === "phone") w = Math.min(w, 282);
  return { w, h: Math.round(w * device.screenRatio) };
}

export type TemplateKey =
  | "headline-top"
  | "headline-bottom"
  | "headline-overlay"
  | "full-bleed";

export const TEMPLATES: { key: TemplateKey; label: string }[] = [
  { key: "headline-top", label: "見出し上" },
  { key: "headline-bottom", label: "見出し下" },
  { key: "headline-overlay", label: "重ねる" },
  { key: "full-bleed", label: "枠なし" },
];

export interface Palette {
  name: string;
  background: string;
  accent: string;
  foreground: string;
}

export const PALETTES: Palette[] = [
  { name: "グリーン", background: "#22c55e", accent: "#facc15", foreground: "#ffffff" },
  { name: "ブルー", background: "#2563eb", accent: "#fde047", foreground: "#ffffff" },
  { name: "ホワイト", background: "#ffffff", accent: "#e8362d", foreground: "#1a1a1a" },
  { name: "ダーク", background: "#0f172a", accent: "#38bdf8", foreground: "#f8fafc" },
  { name: "オレンジ", background: "#f97316", accent: "#1a1a1a", foreground: "#ffffff" },
  { name: "パープル", background: "#7c3aed", accent: "#fde047", foreground: "#ffffff" },
];
