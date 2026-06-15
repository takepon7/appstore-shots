import { ImageResponse } from "next/og";

export const alt = "appstore-shots — App Store screenshots in your browser";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Dynamic OG / social card. Latin text only so it renders reliably without
// bundling a Japanese font; the layout + color carry the brand.
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
          color: "#ffffff",
          padding: 72,
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            flex: 1,
          }}
        >
          <div style={{ display: "flex", fontSize: 82, fontWeight: 800, letterSpacing: -2 }}>
            appstore-shots
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 36,
              marginTop: 20,
              lineHeight: 1.3,
              opacity: 0.94,
              maxWidth: 600,
            }}
          >
            Make polished App Store screenshots right in your browser.
          </div>
          <div style={{ display: "flex", marginTop: 30, fontSize: 27, fontWeight: 600 }}>
            <span style={{ display: "flex", color: "#fde047" }}>Free</span>
            <span style={{ display: "flex", margin: "0 14px", opacity: 0.55 }}>·</span>
            <span style={{ display: "flex" }}>Open source</span>
            <span style={{ display: "flex", margin: "0 14px", opacity: 0.55 }}>·</span>
            <span style={{ display: "flex" }}>No install</span>
          </div>
        </div>

        {/* mini "App Store screenshot" mockup */}
        <div style={{ display: "flex", alignItems: "center", paddingLeft: 48 }}>
          <div
            style={{
              display: "flex",
              width: 248,
              height: 500,
              background: "#111111",
              borderRadius: 46,
              padding: 12,
              boxShadow: "0 30px 60px rgba(0,0,0,0.32)",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "100%",
                height: "100%",
                background: "#22c55e",
                borderRadius: 36,
                paddingTop: 44,
              }}
            >
              <div style={{ display: "flex", fontSize: 46, fontWeight: 800, color: "#ffffff" }}>App</div>
              <div style={{ display: "flex", fontSize: 58, fontWeight: 800, color: "#fde047", marginTop: 2 }}>
                No.1
              </div>
              <div
                style={{
                  display: "flex",
                  width: 152,
                  height: 196,
                  background: "#ffffff",
                  borderRadius: 22,
                  marginTop: 28,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
