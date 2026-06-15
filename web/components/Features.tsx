const FEATURES = [
  {
    t: "規定サイズで一発書き出し",
    d: "1290×2796 など App Store Connect の規定ピクセルちょうど。ダウンロードしてそのまま登録できます。",
  },
  {
    t: "インストール不要",
    d: "ブラウザだけで完結。コマンドもデザインツールもいりません。",
  },
  {
    t: "画像は外に出ません",
    d: "すべてあなたのブラウザの中で処理。スクショはどこにもアップロードされません。",
  },
  {
    t: "テンプレート＆配色",
    d: "4種のレイアウトと配色プリセットで、見出し＋端末フレーム＋背景の訴求画像に。",
  },
  {
    t: "何枚でもまとめて",
    d: "複数のスクショを一括で。zip でまとめてダウンロードできます。",
  },
  {
    t: "無料・オープンソース",
    d: "MIT ライセンス。コマンド版と Claude Code プラグインも同じリポジトリに同梱。",
  },
];

export default function Features() {
  return (
    <section className="section">
      <h2 className="section-title">アプリのスクショを、そのまま“映える”掲載画像に</h2>
      <p className="section-lede">
        太い見出し＋端末フレーム＋背景の App Store 画像を、デザインツールなしで。
      </p>
      <div className="feature-grid">
        {FEATURES.map((f) => (
          <div className="feature" key={f.t}>
            <div className="feature-t">{f.t}</div>
            <div className="feature-d">{f.d}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
