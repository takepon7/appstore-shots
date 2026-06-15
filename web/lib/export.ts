// Download + zip helpers. The actual PNG rendering lives in canvasRender.ts
// (pure <canvas>, no external rasterizer).

export function triggerDownload(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function dataUrlToUint8(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(",")[1];
  const bin = atob(base64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

// Zip a list of named PNG data URLs and download as a single file.
export async function zipAndDownload(
  files: { name: string; dataUrl: string }[],
  zipName: string
) {
  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();
  for (const f of files) zip.file(f.name, dataUrlToUint8(f.dataUrl));
  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, zipName);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
