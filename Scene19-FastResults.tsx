import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

const CARD_COUNT = 12;
const COLS = 4;
const CARD_SIZE = 105;
const CARD_START_FRAME = 60;
const CARD_INTERVAL = 5;
const SELECTED_INDEX = 6;

export const Scene19FastResults: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const clock = spring({ frame, fps, config: { damping: 18, stiffness: 120 } });
  const faceOpacity = interpolate(frame, [96, 122], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(135deg, #0B1020 0%, #171C35 100%)",
        color: "#fff",
        fontFamily: "'Inter', 'Noto Sans TC', sans-serif",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 150,
          top: 130,
          fontSize: 112,
          fontWeight: 900,
          letterSpacing: -2,
          opacity: clock,
          transform: `scale(${interpolate(clock, [0, 1], [0.82, 1])})`,
        }}
      >
        <span>{"< 5 "}</span>
        <span style={{ color: "#7DD3FC" }}>min</span>
      </div>

      <div style={{ position: "absolute", left: 160, top: 360, width: COLS * (CARD_SIZE + 24) }}>
        {Array.from({ length: CARD_COUNT }).map((_, index) => {
          const row = Math.floor(index / COLS);
          const col = index % COLS;
          const appear = spring({
            frame: frame - CARD_START_FRAME - index * CARD_INTERVAL,
            fps,
            config: { damping: 12, stiffness: 170 },
          });
          const selected = index === SELECTED_INDEX && frame > 132;
          return (
            <div
              key={index}
              style={{
                position: "absolute",
                left: col * (CARD_SIZE + 24),
                top: row * (CARD_SIZE + 24),
                width: CARD_SIZE,
                height: CARD_SIZE,
                borderRadius: 24,
                background: selected ? "#38BDF8" : "rgba(255,255,255,0.12)",
                border: selected ? "3px solid #FFFFFF" : "1px solid rgba(255,255,255,0.18)",
                opacity: appear,
                transform: `scale(${interpolate(appear, [0, 1], [0.2, 1])})`,
                boxShadow: selected ? "0 0 45px rgba(56,189,248,0.65)" : "none",
              }}
            />
          );
        })}
      </div>

      <div
        style={{
          position: "absolute",
          right: 210,
          top: 340,
          width: 560,
          height: 320,
          borderRadius: 40,
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.18)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 54,
          fontWeight: 850,
          opacity: faceOpacity,
          transform: `translateY(${interpolate(faceOpacity, [0, 1], [32, 0])}px)`,
        }}
      >
        AI 不會生氣
      </div>
    </AbsoluteFill>
  );
};
