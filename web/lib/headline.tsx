import React from "react";

// Render headline text: **word** -> accent-colored span, \n -> line break.
// The accent color comes from the inherited CSS var so it stays in sync.
export function HeadlineContent({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <>
      {lines.map((line, i) => (
        <React.Fragment key={i}>
          {i > 0 && <br />}
          {renderAccents(line)}
        </React.Fragment>
      ))}
    </>
  );
}

function renderAccents(line: string) {
  const parts = line.split(/\*\*(.+?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} style={{ color: "var(--accent)" }}>
        {part}
      </span>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    )
  );
}
