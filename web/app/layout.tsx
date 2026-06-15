import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://appstore-shots.vercel.app"),
  title: "appstore-shots — App Storeのスクショを、ブラウザで作る",
  description:
    "アプリのスクショをアップして、見出しと色を選ぶだけ。App Store規定サイズの掲載画像をその場でダウンロード。インストール不要・無料。",
  openGraph: {
    title: "appstore-shots — App Storeのスクショを、ブラウザで作る",
    description:
      "アプリのスクショをアップして、見出しと色を選ぶだけ。App Store規定サイズの掲載画像をその場でダウンロード。インストール不要・無料。",
    type: "website",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: "appstore-shots — App Storeのスクショを、ブラウザで作る",
    description:
      "アプリのスクショをアップして、見出しと色を選ぶだけ。インストール不要・無料。",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
