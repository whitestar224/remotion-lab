import { AbsoluteFill, useCurrentFrame } from "remotion";
import React from "react";

const TEXT = "Hello, Remotion.";
const CHARS_PER_FRAME = 2;
const FONT_SIZE = 72;
const TEXT_COLOR = "#ffffff";
const BG_COLOR = "#0f172a";
const CURSOR_COLOR = "#38bdf8";
const CURSOR_BLINK_INTERVAL = 15;

export const TypewriterTitle: React.FC = () => {
  const frame = useCurrentFrame();

  const charsToShow = Math.min(
    Math.floor(frame * CHARS_PER_FRAME),
    TEXT.length,
  );
  const displayText = TEXT.slice(0, charsToShow);

  const isDoneTyping = charsToShow >= TEXT.length;
  const cursorOpacity = isDoneTyping
    ? Math.floor(frame / CURSOR_BLINK_INTERVAL) % 2 === 0
      ? 1
      : 0
    : 1;

  return (
    <AbsoluteFill
      style={{
        background: BG_COLOR,
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "'Courier New', Courier, monospace",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          fontSize: FONT_SIZE,
          fontWeight: 700,
          color: TEXT_COLOR,
          letterSpacing: "0.02em",
        }}
      >
        <span>{displayText}</span>
        <span
          style={{
            display: "inline-block",
            width: 4,
            height: FONT_SIZE * 1.1,
            background: CURSOR_COLOR,
            marginLeft: 6,
            opacity: cursorOpacity,
            borderRadius: 2,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};