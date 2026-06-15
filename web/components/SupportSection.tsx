"use client";

import { useEffect, useState } from "react";

const REPO = "takepon7/appstore-shots";
const REPO_URL = `https://github.com/${REPO}`;
const SPONSOR_URL = "https://github.com/sponsors/takepon7";

export default function SupportSection() {
  const [stars, setStars] = useState<number | null>(null);

  useEffect(() => {
    // Live star count (unauthenticated GitHub API, CORS-enabled). Best-effort:
    // if it fails or is rate-limited, the button just shows without a count.
    fetch(`https://api.github.com/repos/${REPO}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d && typeof d.stargazers_count === "number") setStars(d.stargazers_count);
      })
      .catch(() => {});
  }, []);

  return (
    <footer className="support">
      <h2 className="section-title">
        Open Source <span className="heart">❤</span>
      </h2>
      <p className="section-lede">
        appstore-shots はオープンソースです。役に立ったら、Star やスポンサーで応援してもらえると、
        開発を続けやすくなります。
      </p>

      <div className="support-buttons">
        <a className="star-btn" href={REPO_URL} target="_blank" rel="noreferrer">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
            <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z" />
          </svg>
          GitHubでStar
          {stars !== null && <span className="count">{stars.toLocaleString()}</span>}
        </a>

        <a className="sponsor-btn" href={SPONSOR_URL} target="_blank" rel="noreferrer">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
            <path d="M8 14.25.345 6.575a3.25 3.25 0 1 1 4.6-4.595L8 5.05l3.055-3.07a3.25 3.25 0 1 1 4.6 4.595L8 14.25Z" />
          </svg>
          Sponsor
        </a>
      </div>

      <div className="give-star">よかったら Star してね →</div>
      <a className="repo-link" href={REPO_URL} target="_blank" rel="noreferrer">
        github.com/{REPO}
      </a>
    </footer>
  );
}
