import React, { forwardRef } from "react";
import { Device, frameSize, TemplateKey } from "@/lib/devices";
import { HeadlineContent } from "@/lib/headline";

export interface FrameData {
  id: string;
  image: string; // data URL
  fileName: string;
  headline: string;
  subhead: string;
  template: TemplateKey;
  background: string;
  accent: string;
  foreground: string;
  headlineFont: string;
  headlineSize: number;
  frameColor: string;
}

interface Props {
  frame: FrameData;
  device: Device;
}

// Renders one frame at the logical device size (device.w × device.h px).
// Display scaling is the parent's job (CSS transform on a wrapper) — this node
// must stay at true logical size so PNG export hits the exact pixel target.
const ScreenshotFrame = forwardRef<HTMLDivElement, Props>(function ScreenshotFrame(
  { frame, device },
  ref
) {
  const f = frame;
  // Frame size derives from the selected device, so an iPad renders as an iPad.
  const { w: dw, h: dh } = frameSize(device, f.template);
  const isPhone = device.kind === "phone";

  const stageStyle: React.CSSProperties = {
    width: device.w,
    height: device.h,
    background: f.background,
    fontFamily: `"${f.headlineFont}", "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Yu Gothic", sans-serif`,
    ["--accent" as string]: f.accent,
  };

  const headlineStyle: React.CSSProperties = {
    color: f.foreground,
    fontSize: f.headlineSize,
  };
  const subheadStyle: React.CSSProperties = { color: f.foreground };

  const Device = ({ w, h }: { w: number; h: number }) => (
    <div className="asf-device" style={{ width: w, height: h, borderColor: f.frameColor, background: f.frameColor }}>
      {isPhone && <div className="asf-island" />}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="asf-screen" src={f.image} alt="" />
    </div>
  );

  const Headline = () => (
    <>
      <div className="asf-headline" style={headlineStyle}>
        <HeadlineContent text={f.headline} />
      </div>
      {f.subhead && (
        <div className="asf-subhead" style={subheadStyle}>
          <HeadlineContent text={f.subhead} />
        </div>
      )}
    </>
  );

  return (
    <div ref={ref} className={`asf-stage asf-${f.template}`} style={stageStyle}>
      {f.template === "headline-top" && (
        <>
          <Headline />
          <Device w={dw} h={dh} />
        </>
      )}

      {f.template === "headline-bottom" && (
        <>
          <Device w={dw} h={dh} />
          <div className="asf-headline-block">
            <Headline />
          </div>
        </>
      )}

      {f.template === "headline-overlay" && (
        <>
          <div className="asf-overlay">
            <Headline />
          </div>
          <Device w={dw} h={dh} />
        </>
      )}

      {f.template === "full-bleed" && (
        <>
          <Headline />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="asf-shot" src={f.image} alt="" style={{ width: dw, height: dh }} />
        </>
      )}
    </div>
  );
});

export default ScreenshotFrame;
