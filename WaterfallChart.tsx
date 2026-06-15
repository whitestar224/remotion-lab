import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import React from "react";

const ITEMS_RAW = [
  { label: "期初", value: 5000, type: "total" as const },
  { label: "營收", value: 3200, type: "positive" as const },
  { label: "成本", value: -1800, type: "negative" as const },
  { label: "行銷費", value: -600, type: "negative" as const },
  { label: "利息收入", value: 400, type: "positive" as const },
  { label: "稅費", value: -520, type: "negative" as const },
  { label: "期末", value: 0, type: "total" as const },
];

// Compute cumulative bases and final values at module scope
const ITEMS = (() => {
  let cumulative = 0;
  return ITEMS_RAW.map((item, i) => {
    if (item.type === "total" && i === 0) {
      const base = 0;
      const val = item.value;
      cumulative = val;
      return { ...item, base, displayValue: val };
    }
    if (item.type === "total" && i === ITEMS_RAW.length - 1) {
      const base = 0;
      const displayValue = cumulative;
      return { ...item, base, displayValue };
    }
    const base = item.value >= 0 ? cumulative : cumulative + item.value;
    cumulative += item.value;
    return { ...item, base, displayValue: Math.abs(item.value) };
  });
})();

const Y_MAX = 9000;
const CHART_WIDTH = 1400;
const CHART_HEIGHT = 600;
const CHART_LEFT = (1920 - CHART_WIDTH) / 2;
const CHART_BOTTOM = 820;
const CHART_TOP = CHART_BOTTOM - CHART_HEIGHT;
const BAR_AREA_WIDTH = CHART_WIDTH - 80;
const BAR_GAP = 18;
const BAR_WIDTH = (BAR_AREA_WIDTH - BAR_GAP * (ITEMS.length + 1)) / ITEMS.length;
const GRID_VALUES = [0, 2000, 4000, 6000, 8000];

const COLOR_POSITIVE = "#10b981";
const COLOR_NEGATIVE = "#ef4444";
const COLOR_TOTAL = "#3b82f6";

function yPos(value: number): number {
  return CHART_TOP + CHART_HEIGHT - (value / Y_MAX) * CHART_HEIGHT;
}

function barColor(type: "positive" | "negative" | "total"): string {
  if (type === "total") return COLOR_TOTAL;
  if (type === "positive") return COLOR_POSITIVE;
  return COLOR_NEGATIVE;
}

export const WaterfallChart: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleProgress = spring({
    frame,
    fps,
    config: { damping: 30, stiffness: 70 },
  });

  const titleOpacity = interpolate(titleProgress, [0, 1], [0, 1]);
  const titleY = interpolate(titleProgress, [0, 1], [-30, 0]);

  return (
    <AbsoluteFill
      style={{
        background: "#0f0f0f",
        fontFamily: "sans-serif",
      }}
    >
      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 60,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
        }}
      >
        <div
          style={{
            fontSize: 56,
            fontWeight: 700,
            color: "#ffffff",
            letterSpacing: "0.04em",
          }}
        >
          現金流瀑布圖
        </div>
        <div
          style={{
            marginTop: 10,
            fontSize: 22,
            color: "#6b7280",
            letterSpacing: "0.06em",
          }}
        >
          各項目累積金額變化
        </div>
      </div>

      {/* Chart SVG layer (grid lines + connector lines) */}
      <svg
        width={1920}
        height={1080}
        style={{ position: "absolute", top: 0, left: 0 }}
        viewBox="0 0 1920 1080"
      >
        {/* Grid lines */}
        {GRID_VALUES.map((gv) => {
          const gy = yPos(gv);
          return (
            <g key={gv}>
              <line
                x1={CHART_LEFT + 40}
                y1={gy}
                x2={CHART_LEFT + CHART_WIDTH}
                y2={gy}
                stroke={gv === 0 ? "rgba(156,163,175,0.5)" : "rgba(75,85,99,0.3)"}
                strokeWidth={gv === 0 ? 1.5 : 1}
              />
              <text
                x={CHART_LEFT + 28}
                y={gy + 6}
                textAnchor="end"
                fill="#6b7280"
                fontSize={18}
                fontFamily="sans-serif"
              >
                {(gv / 1000).toFixed(0)}K
              </text>
            </g>
          );
        })}

        {/* Connector lines between bars */}
        {ITEMS.map((item, i) => {
          if (i === ITEMS.length - 1) return null;
          const x = CHART_LEFT + 40 + BAR_GAP + i * (BAR_WIDTH + BAR_GAP);
          const nextX = x + BAR_WIDTH + BAR_GAP;

          let connectorY: number;
          if (item.type === "total") {
            connectorY = yPos(item.displayValue);
          } else if (item.value >= 0) {
            connectorY = yPos(item.base + item.displayValue);
          } else {
            connectorY = yPos(item.base);
          }

          return (
            <line
              key={i}
              x1={x + BAR_WIDTH}
              y1={connectorY}
              x2={nextX}
              y2={connectorY}
              stroke="rgba(156,163,175,0.4)"
              strokeWidth={1.5}
              strokeDasharray="6 4"
            />
          );
        })}
      </svg>

      {/* Bars (div-based for animation) */}
      {ITEMS.map((item, index) => {
        const startFrame = index * 12;
        const barProgress = spring({
          frame: Math.max(0, frame - startFrame),
          fps,
          config: { damping: 22, stiffness: 90 },
        });

        const barHeightFull = (item.displayValue / Y_MAX) * CHART_HEIGHT;
        const barHeight = interpolate(barProgress, [0, 1], [0, barHeightFull]);

        const baseY =
          item.type === "total" && index === ITEMS.length - 1
            ? yPos(item.displayValue)
            : yPos(item.base + item.displayValue);

        const x = CHART_LEFT + 40 + BAR_GAP + index * (BAR_WIDTH + BAR_GAP);

        const labelOpacity = interpolate(barProgress, [0.4, 0.8], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

        const color = barColor(item.type);

        return (
          <div key={item.label}>
            {/* Bar */}
            <div
              style={{
                position: "absolute",
                left: x,
                top: baseY,
                width: BAR_WIDTH,
                height: barHeight,
                background: `linear-gradient(180deg, ${color}ff 0%, ${color}bb 100%)`,
                borderRadius: "4px 4px 0 0",
                boxShadow: `0 0 20px ${color}44`,
              }}
            />

            {/* Value label */}
            <div
              style={{
                position: "absolute",
                left: x,
                top: baseY - 36,
                width: BAR_WIDTH,
                textAlign: "center",
                fontSize: 22,
                fontWeight: 700,
                color: color,
                opacity: labelOpacity,
              }}
            >
              {item.value < 0 ? "-" : ""}
              {Math.abs(
                item.type === "total" && index === ITEMS.length - 1
                  ? item.displayValue
                  : item.displayValue
              ).toLocaleString()}
            </div>

            {/* X-axis label */}
            <div
              style={{
                position: "absolute",
                left: x,
                top: CHART_BOTTOM + 14,
                width: BAR_WIDTH,
                textAlign: "center",
                fontSize: 22,
                color: "#9ca3af",
                opacity: labelOpacity,
              }}
            >
              {item.label}
            </div>
          </div>
        );
      })}

      {/* Legend */}
      <div
        style={{
          position: "absolute",
          bottom: 40,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          gap: 50,
        }}
      >
        {[
          { label: "正向項目", color: COLOR_POSITIVE },
          { label: "負向項目", color: COLOR_NEGATIVE },
          { label: "合計", color: COLOR_TOTAL },
        ].map((leg) => (
          <div
            key={leg.label}
            style={{ display: "flex", alignItems: "center", gap: 12 }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: 4,
                background: leg.color,
              }}
            />
            <span style={{ fontSize: 22, color: "#d1d5db" }}>{leg.label}</span>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};