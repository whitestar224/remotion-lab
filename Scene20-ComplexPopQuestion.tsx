import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

const colors = {
  background: "#10131A",
  card: "rgba(255,255,255,0.08)",
  text: "#FFFFFF",
  muted: "rgba(255,255,255,0.64)",
  success: "#00D4AA",
  warning: "#FFB547",
};

export const Scene20ComplexPopQuestion: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const left = spring({ frame, fps, config: { damping: 20, stiffness: 90 } });
  const bridge = spring({ frame: frame - 32, fps, config: { damping: 18, stiffness: 110 } });
  const right = spring({ frame: frame - 54, fps, config: { damping: 18, stiffness: 90 } });
  const questionPulse = 1 + Math.sin(frame / 8) * 0.035;

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(135deg, #10131A 0%, #1C2030 100%)",
        color: colors.text,
        fontFamily: "'Inter', 'Noto Sans TC', sans-serif",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 74 }}>
        <div
          style={{
            width: 470,
            height: 260,
            borderRadius: 28,
            background: colors.card,
            border: `2px solid ${colors.success}55`,
            padding: 42,
            opacity: left,
            transform: `translateX(${interpolate(left, [0, 1], [-90, 0])}px)`,
          }}
        >
          <div style={{ fontSize: 52, fontWeight: 850, marginBottom: 40 }}>簡單音樂</div>
          <div style={{ fontSize: 34, color: colors.success, fontWeight: 800 }}>可以改編</div>
        </div>

        <div
          style={{
            fontSize: 58,
            fontWeight: 900,
            color: colors.muted,
            opacity: bridge,
            transform: `scale(${interpolate(bridge, [0, 1], [0.65, 1])})`,
          }}
        >
          那...
        </div>

        <div
          style={{
            width: 520,
            height: 300,
            borderRadius: 30,
            background: colors.card,
            border: `2px solid ${colors.warning}66`,
            padding: 44,
            opacity: right,
            transform: `translateX(${interpolate(right, [0, 1], [90, 0])}px) scale(${questionPulse})`,
            boxShadow: `0 0 ${interpolate(right, [0, 1], [0, 60])}px rgba(255,181,71,0.25)`,
          }}
        >
          <div style={{ fontSize: 50, fontWeight: 850, marginBottom: 44 }}>複雜流行音樂</div>
          <div style={{ fontSize: 40, color: colors.warning, fontWeight: 900 }}>是否可行？</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
