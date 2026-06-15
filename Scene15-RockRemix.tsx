import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

const colors = {
  background: "#090B12",
  panel: "rgba(255,255,255,0.08)",
  text: "#FFFFFF",
  danger: "#FF4D6D",
  muted: "rgba(255,255,255,0.56)",
};

const TRACKS = [
  { label: "Piano", color: "#FFFFFF", waveformSeed: 1, appearFrame: 0 },
  { label: "Guitar", color: "#FF6B6B", waveformSeed: 2, appearFrame: 130 },
  { label: "Drums", color: "#FFD93D", waveformSeed: 3, appearFrame: 150 },
  { label: "Bass", color: "#4DA3FF", waveformSeed: 4, appearFrame: 170 },
];

export const Scene15RockRemix: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const intro = spring({ frame, fps, config: { damping: 18, stiffness: 90 } });
  const needleAngle = interpolate(frame, [75, 110], [-120, -10], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const badgeOpacity = interpolate(frame, [190, 205], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: "radial-gradient(circle at center, #1C1830 0%, #090B12 62%)",
        color: colors.text,
        fontFamily: "'Inter', 'Noto Sans TC', sans-serif",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 92,
          left: 120,
          fontSize: 44,
          fontWeight: 800,
          letterSpacing: 4,
          opacity: intro,
          transform: `translateY(${interpolate(intro, [0, 1], [32, 0])}px)`,
        }}
      >
        Remix Builder
      </div>

      <div style={{ position: "absolute", left: 160, top: 230, width: 820 }}>
        {TRACKS.map((track, index) => {
          const appear = spring({
            frame: frame - track.appearFrame,
            fps,
            config: { damping: 16, stiffness: 120 },
          });
          const width = interpolate(appear, [0, 1], [0, 620]);
          const wave = Array.from({ length: 34 }).map((_, i) => {
            const phase = (frame + i * track.waveformSeed * 5) / 12;
            return 18 + Math.abs(Math.sin(phase)) * (34 + index * 10);
          });

          return (
            <div
              key={track.label}
              style={{
                height: 118,
                marginBottom: 18,
                opacity: appear,
                transform: `translateX(${interpolate(appear, [0, 1], [-70, 0])}px)`,
                display: "flex",
                alignItems: "center",
                gap: 24,
              }}
            >
              <div style={{ width: 120, fontSize: 24, fontWeight: 700 }}>{track.label}</div>
              <div
                style={{
                  width: 660,
                  height: 78,
                  borderRadius: 20,
                  background: colors.panel,
                  border: `1px solid ${track.color}55`,
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  paddingLeft: 20,
                  gap: 8,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    width,
                    height: 78,
                    marginLeft: -20,
                    background: `linear-gradient(90deg, ${track.color}22, transparent)`,
                  }}
                />
                {wave.map((height, i) => (
                  <div
                    key={i}
                    style={{
                      width: 10,
                      height,
                      borderRadius: 999,
                      background: track.color,
                      opacity: 0.75,
                    }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          position: "absolute",
          right: 210,
          top: 260,
          width: 480,
          height: 480,
          borderRadius: "50%",
          border: "2px solid rgba(255,255,255,0.18)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 0 80px rgba(255,77,109,0.25)",
        }}
      >
        <div
          style={{
            position: "absolute",
            bottom: 230,
            width: 220,
            height: 8,
            borderRadius: 999,
            background: colors.danger,
            transformOrigin: "100% 50%",
            transform: `rotate(${needleAngle}deg)`,
            boxShadow: `0 0 30px ${colors.danger}`,
          }}
        />
        <div style={{ fontSize: 32, color: colors.muted, letterSpacing: 8 }}>ENERGY</div>
      </div>

      <div
        style={{
          position: "absolute",
          top: 780,
          right: 260,
          fontSize: 64,
          fontWeight: 900,
          color: colors.danger,
          letterSpacing: 12,
          opacity: badgeOpacity,
          transform: `scale(${interpolate(badgeOpacity, [0, 1], [0.85, 1])})`,
        }}
      >
        ROCK
      </div>
    </AbsoluteFill>
  );
};
