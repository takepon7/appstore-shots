"use client";

import { useCallback, useState } from "react";
import ScreenshotFrame, { FrameData } from "@/components/ScreenshotFrame";
import {
  DEVICES,
  DeviceKey,
  PALETTES,
  Palette,
  TEMPLATES,
  TemplateKey,
} from "@/lib/devices";
import { triggerDownload, zipAndDownload } from "@/lib/export";
import { frameToPng } from "@/lib/canvasRender";
import Features from "@/components/Features";
import SupportSection from "@/components/SupportSection";

const PREVIEW_W = 188; // px on screen; the real node stays at logical size

interface Defaults {
  background: string;
  accent: string;
  foreground: string;
  template: TemplateKey;
  headlineFont: string;
  headlineSize: number;
  frameColor: string;
}

const INITIAL_DEFAULTS: Defaults = {
  background: "#2563eb",
  accent: "#fde047",
  foreground: "#ffffff",
  template: "headline-top",
  headlineFont: "Hiragino Sans",
  headlineSize: 78,
  frameColor: "#111111",
};

let counter = 0;
const uid = () => `f${Date.now()}_${counter++}`;

export default function Page() {
  const [deviceKey, setDeviceKey] = useState<DeviceKey>("iphone-6.9");
  const [defaults, setDefaults] = useState<Defaults>(INITIAL_DEFAULTS);
  const [frames, setFrames] = useState<FrameData[]>([]);
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);

  const device = DEVICES[deviceKey];
  const scale = PREVIEW_W / device.w;

  const addFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return;
      const imgs = Array.from(fileList).filter((f) => /image\/(png|jpe?g)/.test(f.type));
      imgs.forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => {
          const image = String(reader.result);
          setFrames((prev) => [
            ...prev,
            {
              id: uid(),
              image,
              fileName: file.name,
              headline: "",
              subhead: "",
              template: defaults.template,
              background: defaults.background,
              accent: defaults.accent,
              foreground: defaults.foreground,
              headlineFont: defaults.headlineFont,
              headlineSize: defaults.headlineSize,
              frameColor: defaults.frameColor,
            },
          ]);
        };
        reader.readAsDataURL(file);
      });
    },
    [defaults]
  );

  const update = (id: string, patch: Partial<FrameData>) =>
    setFrames((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));

  const remove = (id: string) => {
    setFrames((prev) => prev.filter((f) => f.id !== id));
  };

  const applyPalette = (p: Palette) => {
    setDefaults((d) => ({ ...d, ...p }));
    setFrames((prev) =>
      prev.map((f) => ({ ...f, background: p.background, accent: p.accent, foreground: p.foreground }))
    );
  };

  const downloadOne = async (frame: FrameData, idx: number) => {
    setBusy(true);
    try {
      const png = await frameToPng(frame, device);
      triggerDownload(png, `${String(idx + 1).padStart(2, "0")}.png`);
    } finally {
      setBusy(false);
    }
  };

  const downloadAll = async () => {
    setBusy(true);
    try {
      const files: { name: string; dataUrl: string }[] = [];
      for (let i = 0; i < frames.length; i++) {
        const png = await frameToPng(frames[i], device);
        files.push({ name: `${String(i + 1).padStart(2, "0")}.png`, dataUrl: png });
      }
      if (files.length) await zipAndDownload(files, `appstore-${device.label.replace(/\W/g, "")}.zip`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="app">
      <header className="masthead">
        <h1>appstore-shots</h1>
        <span className="tag">App Storeのスクショを、ブラウザで作る</span>
        <a href="https://github.com/takepon7/appstore-shots" target="_blank" rel="noreferrer">
          GitHub ↗
        </a>
      </header>
      <p className="lede">
        アプリのスクショをアップして、見出しと色を選ぶだけ。App Store規定サイズ（{device.px}）の掲載画像を、その場でダウンロードできます。
        画像はブラウザ内だけで処理され、どこにも送信されません。
      </p>

      <div className="toolbar">
        <div className="group">
          <span className="label">サイズ</span>
          <select id="device" value={deviceKey} onChange={(e) => setDeviceKey(e.target.value as DeviceKey)}>
            {Object.entries(DEVICES).map(([k, d]) => (
              <option key={k} value={k}>
                {d.label}（{d.px}）
              </option>
            ))}
          </select>
          <div className="size-sample" aria-hidden>
            <div
              className={`silhouette ${device.kind}`}
              style={{ width: Math.round((38 * device.w) / device.h) }}
            />
            <div className="meta">
              <b>{device.px}</b>
              <small>{device.desc}</small>
            </div>
          </div>
        </div>
        <div className="group">
          <span className="label">配色</span>
          <div className="palettes">
            {PALETTES.map((p) => (
              <button
                key={p.name}
                className="swatch"
                title={`${p.name}（クリックで全体に適用）`}
                style={{ background: p.background }}
                onClick={() => applyPalette(p)}
              >
                <span style={{ background: p.accent }} />
              </button>
            ))}
          </div>
          <span className="hint">クリックで全体に適用</span>
        </div>
        <div className="spacer" />
        <button className="btn btn-primary" disabled={busy || frames.length === 0} onClick={downloadAll}>
          {busy ? "書き出し中…" : `全部ダウンロード（${frames.length}）`}
        </button>
      </div>

      <label
        className={`dropzone${drag ? " drag" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          addFiles(e.dataTransfer.files);
        }}
      >
        <span className="icon" aria-hidden>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 16V4" />
            <path d="m6 10 6-6 6 6" />
            <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
          </svg>
        </span>
        <strong>スクショをドラッグ＆ドロップ</strong>
        クリックして選択もできます（PNG / JPG・複数可）
        <input
          type="file"
          accept="image/png,image/jpeg"
          multiple
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </label>

      {frames.length === 0 && (
        <ol className="guide">
          <li>アプリのスクショをアップロード（あとから何枚でも追加・削除できます）</li>
          <li>見出しを入力し、テンプレートと配色を選ぶ。プレビューがその場で更新されます</li>
          <li>「この1枚」または「全部ダウンロード」で、App Store規定サイズのPNGを保存</li>
        </ol>
      )}

      <div className="cards">
        {frames.map((f, i) => (
          <div className="card" key={f.id}>
            <div
              className="preview"
              style={{ width: device.w * scale, height: device.h * scale }}
            >
              <div className="preview-inner" style={{ transform: `scale(${scale})` }}>
                <ScreenshotFrame frame={f} device={device} />
              </div>
            </div>

            <div className="controls">
              <div className="row">
                <span className="idx">#{i + 1}</span>
                <div className="card-actions">
                  <button className="btn btn-ghost" disabled={busy} onClick={() => downloadOne(f, i)}>
                    ↓ この1枚
                  </button>
                  <button className="linklike" onClick={() => remove(f.id)}>
                    削除
                  </button>
                </div>
              </div>

              <textarea
                value={f.headline}
                placeholder={"見出し（改行で2行）\n例: 3分でわかる\n**自己分析**"}
                onChange={(e) => update(f.id, { headline: e.target.value })}
              />
              <div className="hint">
                <code>**囲んだ言葉**</code> はアクセント色になります。改行＝2行目。
              </div>

              <input
                type="text"
                value={f.subhead}
                placeholder="サブ見出し（任意・小さい文字）"
                onChange={(e) => update(f.id, { subhead: e.target.value })}
              />

              <div className="tpl-buttons">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.key}
                    className={f.template === t.key ? "active" : ""}
                    onClick={() => update(f.id, { template: t.key })}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="row">
                <span className="field">
                  背景
                  <input
                    type="color"
                    value={f.background}
                    onChange={(e) => update(f.id, { background: e.target.value })}
                  />
                </span>
                <span className="field">
                  文字
                  <input
                    type="color"
                    value={f.foreground}
                    onChange={(e) => update(f.id, { foreground: e.target.value })}
                  />
                </span>
                <span className="field">
                  アクセント
                  <input
                    type="color"
                    value={f.accent}
                    onChange={(e) => update(f.id, { accent: e.target.value })}
                  />
                </span>
                <span className="field">
                  文字サイズ
                  <input
                    type="range"
                    min={48}
                    max={104}
                    value={f.headlineSize}
                    onChange={(e) => update(f.id, { headlineSize: Number(e.target.value) })}
                  />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Features />
      <SupportSection />
    </main>
  );
}
