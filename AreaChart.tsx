import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import React from "react";

const MONTHS = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月"];
const SERIES_A = [40, 55, 48, 72, 65, 88, 80, 95]; // 本年度
const SERIES_B = [30, 42, 38, 55, 50, 70, 65, 82]; // 去年同期

const COLOR_A = "#3b82f6";
const COLOR_B = "#8b5cf6";

const CHART_W = 1400;
const CHART_H = 600;
const PAD_LEFT = 80;
const PAD_RIGHT = 40;
const PAD_TOP = 20;
const PAD_BOTTOM = 60;

const PLOT_W = CHART_W - PAD_LEFT - PAD_RIGHT;
const PLOT_H = CHART_H - PAD_TOP - PAD_BOTTOM;

const MAX_VALUE = 100;
const GRID_VALUES = [0, 25, 50, 75, 100];

function buildPath(series: number[]): string {
  return series
    .map((val, i) => {
      const x = PAD_LEFT + (i / (series.length - 1)) * PLOT_W;
      const y = PAD_TOP + PLOT_H - (val / MAX_VALUE) * PLOT_H;
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
}

function buildAreaPath(series: number[]): string {
  const linePart = buildPath(series);
  const lastX = PAD_LEFT + PLOT_W;
  const firstX = PAD_LEFT;
  const baseline = PAD_TOP + PLOT_H;
  return `${linePart} L ${lastX} ${baseline} L ${firstX} ${baseline} Z`;
}

function getPathLength(series: number[]): number {
  let length = 0;
  for (let i = 1; i < series.length; i++) {
    const x1 = PAD_LEFT + ((i - 1) / (series.length - 1)) * PLOT_W;
    const y1 = PAD_TOP + PLOT_H - (series[i - 1] / MAX_VALUE) * PLOT_H;
    const x2 = PAD_LEFT + (i / (series.length - 1)) * PLOT_W;
    const y2 = PAD_TOP + PLOT_H - (series[i] / MAX_VALUE) * PLOT_H;
    const dx = x2 - x1;
    const dy = y2 - y1;
    length += Math.sqrt(dx * dx + dy * dy);
  }
  return length;
}

const PATH_LENGTH_A = getPathLength(SERIES_A);
const PATH_LENGTH_B = getPathLength(SERIES_B);

export const AreaChart: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleProgress = spring({
    frame,
    fps,
    config: { damping: 28, stiffness: 65 },
  });
  const titleOpacity = interpolate(titleProgress, [0, 1], [0, 1]);
  const titleY = interpolate(titleProgress, [0, 1], [-24, 0]);

  // Line draw: frames 20-80
  const lineRaw = interpolate(frame, [20, 80], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const dashOffsetA = PATH_LENGTH_A * (1 - lineRaw);
  const dashOffsetB = PATH_LENGTH_B * (1 - lineRaw);

  // Area fill: frames 70-100
  const areaOpacity = interpolate(frame, [70, 100], [0, 0.28], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Grid and axis fade in
  const gridOpacity = interpolate(frame, [0, 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Legend
  const legendOpacity = interpolate(frame, [60, 90], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const svgW = CHART_W;
  const svgH = CHART_H;

  return (
    <AbsoluteFill
      style={{
        background: "#0f0f0f",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "sans-serif",
      }}
    >
      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 64,
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
          月度趨勢分析
        </div>
        <div
          style={{
            marginTop: 10,
            fontSize: 22,
            color: "#6b7280",
            letterSpacing: "0.06em",
          }}
        >
          本年度 vs 去年同期
        </div>
      </div>

      {/* Legend */}
      <div
        style={{
          position: "absolute",
          top: 188,
          right: (1920 - CHART_W) / 2 + PAD_RIGHT,
          display: "flex",
          gap: 32,
          opacity: legendOpacity,
        }}
      >
        {[
          { color: COLOR_A, label: "本年度" },
          { color: COLOR_B, label: "去年同期" },
        ].map(({ color, label }) => (
          <div
            key={label}
            style={{ display: "flex", alignItems: "center", gap: 10 }}
          >
            <div
              style={{
                width: 32,
                height: 4,
                borderRadius: 2,
                background: color,
              }}
            />
            <span style={{ fontSize: 22, color: "#d1d5db" }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Chart SVG */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          left: (1920 - CHART_W) / 2,
          width: CHART_W,
          height: CHART_H,
        }}
      >
        <svg
          width={svgW}
          height={svgH}
          viewBox={`0 0 ${svgW} ${svgH}`}
          style={{ overflow: "visible" }}
        >
          <defs>
            <linearGradient id="gradA" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={COLOR_A} stopOpacity="1" />
              <stop offset="100%" stopColor={COLOR_A} stopOpacity="0" />
            </linearGradient>
            <linearGradient id="gradB" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={COLOR_B} stopOpacity="1" />
              <stop offset="100%" stopColor={COLOR_B} stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid lines + Y labels */}
          {GRID_VALUES.map((val) => {
            const y = PAD_TOP + PLOT_H - (val / MAX_VALUE) * PLOT_H;
            return (
              <g key={val} opacity={gridOpacity}>
                <line
                  x1={PAD_LEFT}
                  y1={y}
                  x2={PAD_LEFT + PLOT_W}
                  y2={y}
                  stroke={val === 0 ? "#4b5563" : "rgba(75,85,99,0.35)"}
                  strokeWidth={val === 0 ? 1.5 : 1}
                />
                <text
                  x={PAD_LEFT - 12}
                  y={y + 7}
                  textAnchor="end"
                  fill="#6b7280"
                  fontSize={20}
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* X-axis month labels */}
          {MONTHS.map((month, i) => {
            const x = PAD_LEFT + (i / (MONTHS.length - 1)) * PLOT_W;
            return (
              <text
                key={month}
                x={x}
                y={PAD_TOP + PLOT_H + 40}
                textAnchor="middle"
                fill="#9ca3af"
                fontSize={22}
                opacity={gridOpacity}
              >
                {month}
              </text>
            );
          })}

          {/* Vertical tick lines */}
          {MONTHS.map((month, i) => {
            const x = PAD_LEFT + (i / (MONTHS.length - 1)) * PLOT_W;
            return (
              <line
                key={`tick-${month}`}
                x1={x}
                y1={PAD_TOP + PLOT_H}
                x2={x}
                y2={PAD_TOP + PLOT_H + 8}
                stroke="#4b5563"
                strokeWidth={1}
                opacity={gridOpacity}
              />
            );
          })}

          {/* Area fill B (behind) */}
          <path
            d={buildAreaPath(SERIES_B)}
            fill="url(#gradB)"
            opacity={areaOpacity}
          />

          {/* Area fill A */}
          <path
            d={buildAreaPath(SERIES_A)}
            fill="url(#gradA)"
            opacity={areaOpacity}
          />

          {/* Line B */}
          <path
            d={buildPath(SERIES_B)}
            fill="none"
            stroke={COLOR_B}
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={PATH_LENGTH_B}
            strokeDashoffset={dashOffsetB}
          />

          {/* Line A */}
          <path
            d={buildPath(SERIES_A)}
            fill="none"
            stroke={COLOR_A}
            strokeWidth={3.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={PATH_LENGTH_A}
            strokeDashoffset={dashOffsetA}
          />

          {/* Data point dots - A */}
          {SERIES_A.map((val, i) => {
            const x = PAD_LEFT + (i / (SERIES_A.length - 1)) * PLOT_W;
            const y = PAD_TOP + PLOT_H - (val / MAX_VALUE) * PLOT_H;
            const dotOpacity = interpolate(frame, [70 + i * 4, 85 + i * 4], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            return (
              <circle
                key={`dot-a-${i}`}
                cx={x}
                cy={y}
                r={6}
                fill={COLOR_A}
                stroke="#0f0f0f"
                strokeWidth={2}
                opacity={dotOpacity}
              />
            );
          })}

          {/* Data point dots - B */}
          {SERIES_B.map((val, i) => {
            const x = PAD_LEFT + (i / (SERIES_B.length - 1)) * PLOT_W;
            const y = PAD_TOP + PLOT_H - (val / MAX_VALUE) * PLOT_H;
            const dotOpacity = interpolate(frame, [72 + i * 4, 87 + i * 4], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            return (
              <circle
                key={`dot-b-${i}`}
                cx={x}
                cy={y}
                r={5}
                fill={COLOR_B}
                stroke="#0f0f0f"
                strokeWidth={2}
                opacity={dotOpacity}
              />
            );
          })}
        </svg>
      </div>
    </AbsoluteFill>
  );
};