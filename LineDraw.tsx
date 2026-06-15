import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import React from "react";

const LINE_A = [30, 45, 38, 62, 55, 78, 71, 88]; // 系列 A
const LINE_B = [20, 35, 48, 40, 65, 52, 80, 75]; // 系列 B
const MONTHS = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月"];

const CHART_LEFT = 100;
const CHART_TOP = 80;
const CHART_WIDTH = 900;
const CHART_HEIGHT = 480;
const MIN_VAL = 0;
const MAX_VAL = 100;
const GRID_VALUES = [0, 25, 50, 75, 100];

const COLOR_A = "#3b82f6";
const COLOR_B = "#f59e0b";

function dataToX(index: number): number {
  return CHART_LEFT + (index / (MONTHS.length - 1)) * CHART_WIDTH;
}

function dataToY(value: number): number {
  return (
    CHART_TOP +
    CHART_HEIGHT -
    ((value - MIN_VAL) / (MAX_VAL - MIN_VAL)) * CHART_HEIGHT
  );
}

function buildPath(data: number[]): string {
  return data
    .map((v, i) => `${i === 0 ? "M" : "L"} ${dataToX(i)} ${dataToY(v)}`)
    .join(" ");
}

// Approximate path length by summing segment lengths
function approxPathLength(data: number[]): number {
  let len = 0;
  for (let i = 1; i < data.length; i++) {
    const dx = dataToX(i) - dataToX(i - 1);
    const dy = dataToY(data[i]) - dataToY(data[i - 1]);
    len += Math.sqrt(dx * dx + dy * dy);
  }
  return len;
}

// Cumulative distances for each point (for circle timing)
function cumulativeDistances(data: number[]): number[] {
  const dists = [0];
  for (let i = 1; i < data.length; i++) {
    const dx = dataToX(i) - dataToX(i - 1);
    const dy = dataToY(data[i]) - dataToY(data[i - 1]);
    dists.push(dists[i - 1] + Math.sqrt(dx * dx + dy * dy));
  }
  return dists;
}

const PATH_A = buildPath(LINE_A);
const PATH_B = buildPath(LINE_B);
const LEN_A = approxPathLength(LINE_A);
const LEN_B = approxPathLength(LINE_B);
const DISTS_A = cumulativeDistances(LINE_A);
const DISTS_B = cumulativeDistances(LINE_B);

export const LineDraw: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleProgress = spring({
    frame,
    fps,
    config: { damping: 30, stiffness: 70 },
  });
  const titleOpacity = interpolate(titleProgress, [0, 1], [0, 1]);
  const titleY = interpolate(titleProgress, [0, 1], [-30, 0]);

  // Line draw progress (starts at frame 10)
  const lineProgress = spring({
    frame: Math.max(0, frame - 10),
    fps,
    config: { damping: 40, stiffness: 50 },
  });

  const drawnLenA = interpolate(lineProgress, [0, 1], [0, LEN_A], {
    extrapolateRight: "clamp",
  });
  const drawnLenB = interpolate(lineProgress, [0, 1], [0, LEN_B], {
    extrapolateRight: "clamp",
  });

  const SVG_W = CHART_LEFT + CHART_WIDTH + 60;
  const SVG_H = CHART_TOP + CHART_HEIGHT + 60;

  return (
    <AbsoluteFill
      style={{
        background: "#0f0f0f",
        fontFamily: "sans-serif",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 80,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
        }}
      >
        <div
          style={{
            fontSize: 52,
            fontWeight: 700,
            color: "#ffffff",
            letterSpacing: "0.04em",
          }}
        >
          月度趨勢比較
        </div>
        <div
          style={{
            marginTop: 10,
            fontSize: 22,
            color: "#6b7280",
            letterSpacing: "0.06em",
          }}
        >
          系列 A 與系列 B 數據走勢
        </div>
      </div>

      {/* Chart */}
      <div
        style={{
          position: "absolute",
          top: 200,
          left: (1920 - SVG_W) / 2,
        }}
      >
        <svg
          width={SVG_W}
          height={SVG_H}
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        >
          {/* Grid lines & Y-axis labels */}
          {GRID_VALUES.map((gv) => {
            const y = dataToY(gv);
            const gridProgress = spring({
              frame,
              fps,
              config: { damping: 40, stiffness: 60 },
            });
            const go = interpolate(gridProgress, [0, 1], [0, 1]);
            return (
              <g key={gv} opacity={go}>
                <line
                  x1={CHART_LEFT}
                  y1={y}
                  x2={CHART_LEFT + CHART_WIDTH}
                  y2={y}
                  stroke={gv === 0 ? "#4b5563" : "rgba(75,85,99,0.35)"}
                  strokeWidth={1}
                />
                <text
                  x={CHART_LEFT - 14}
                  y={y + 7}
                  fill="#6b7280"
                  fontSize={18}
                  textAnchor="end"
                >
                  {gv}
                </text>
              </g>
            );
          })}

          {/* X-axis labels */}
          {MONTHS.map((m, i) => {
            const x = dataToX(i);
            const labelProgress = spring({
              frame: Math.max(0, frame - i * 6),
              fps,
              config: { damping: 30, stiffness: 80 },
            });
            const lo = interpolate(labelProgress, [0, 0.5], [0, 1], {
              extrapolateRight: "clamp",
            });
            return (
              <text
                key={m}
                x={x}
                y={CHART_TOP + CHART_HEIGHT + 36}
                fill="#6b7280"
                fontSize={20}
                textAnchor="middle"
                opacity={lo}
              >
                {m}
              </text>
            );
          })}

          {/* Line A */}
          <path
            d={PATH_A}
            fill="none"
            stroke={COLOR_A}
            strokeWidth={3}
            strokeDasharray={LEN_A}
            strokeDashoffset={LEN_A - drawnLenA}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ filter: `drop-shadow(0 0 8px ${COLOR_A}88)` }}
          />

          {/* Line B */}
          <path
            d={PATH_B}
            fill="none"
            stroke={COLOR_B}
            strokeWidth={3}
            strokeDasharray={LEN_B}
            strokeDashoffset={LEN_B - drawnLenB}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ filter: `drop-shadow(0 0 8px ${COLOR_B}88)` }}
          />

          {/* Data point circles for Line A */}
          {LINE_A.map((v, i) => {
            const pointDist = DISTS_A[i];
            const ratio = LEN_A > 0 ? pointDist / LEN_A : 0;
            const circleProgress = spring({
              frame: Math.max(0, frame - 10 - ratio * 40),
              fps,
              config: { damping: 20, stiffness: 200 },
            });
            const cs = interpolate(circleProgress, [0, 1], [0, 1], {
              extrapolateRight: "clamp",
            });
            return (
              <circle
                key={i}
                cx={dataToX(i)}
                cy={dataToY(v)}
                r={7 * cs}
                fill={COLOR_A}
                opacity={cs}
                style={{ filter: `drop-shadow(0 0 6px ${COLOR_A})` }}
              />
            );
          })}

          {/* Data point circles for Line B */}
          {LINE_B.map((v, i) => {
            const pointDist = DISTS_B[i];
            const ratio = LEN_B > 0 ? pointDist / LEN_B : 0;
            const circleProgress = spring({
              frame: Math.max(0, frame - 10 - ratio * 40),
              fps,
              config: { damping: 20, stiffness: 200 },
            });
            const cs = interpolate(circleProgress, [0, 1], [0, 1], {
              extrapolateRight: "clamp",
            });
            return (
              <circle
                key={i}
                cx={dataToX(i)}
                cy={dataToY(v)}
                r={7 * cs}
                fill={COLOR_B}
                opacity={cs}
                style={{ filter: `drop-shadow(0 0 6px ${COLOR_B})` }}
              />
            );
          })}
        </svg>

        {/* Legend */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {[
            { label: "系列 A", color: COLOR_A },
            { label: "系列 B", color: COLOR_B },
          ].map((item) => {
            const lp = spring({
              frame: Math.max(0, frame - 5),
              fps,
              config: { damping: 30, stiffness: 80 },
            });
            const lo = interpolate(lp, [0, 1], [0, 1]);
            return (
              <div
                key={item.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  opacity: lo,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 4,
                    background: item.color,
                    borderRadius: 2,
                    boxShadow: `0 0 8px ${item.color}`,
                  }}
                />
                <div
                  style={{
                    fontSize: 22,
                    color: "#d1d5db",
                    fontWeight: 500,
                  }}
                >
                  {item.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};