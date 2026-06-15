import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import React from "react";

const CANDLES = [
  { date: "4/1",  open: 152, high: 158, low: 149, close: 156, volume: 8200 },
  { date: "4/2",  open: 156, high: 162, low: 154, close: 159, volume: 9100 },
  { date: "4/3",  open: 159, high: 161, low: 152, close: 154, volume: 11200 },
  { date: "4/4",  open: 154, high: 157, low: 148, close: 150, volume: 13500 },
  { date: "4/5",  open: 150, high: 155, low: 147, close: 153, volume: 9800 },
  { date: "4/8",  open: 153, high: 160, low: 151, close: 158, volume: 8600 },
  { date: "4/9",  open: 158, high: 165, low: 156, close: 163, volume: 10200 },
  { date: "4/10", open: 163, high: 168, low: 160, close: 162, volume: 7900 },
  { date: "4/11", open: 162, high: 164, low: 155, close: 157, volume: 12100 },
  { date: "4/12", open: 157, high: 163, low: 155, close: 161, volume: 9400 },
];

const CHART_LEFT = 260;
const CHART_TOP = 160;
const CHART_WIDTH = 1400;
const CHART_HEIGHT = 550;
const VOLUME_HEIGHT = 120;
const VOLUME_TOP = CHART_TOP + CHART_HEIGHT + 60;

const PRICE_MIN = 144;
const PRICE_MAX = 172;
const PRICE_RANGE = PRICE_MAX - PRICE_MIN;

const MAX_VOLUME = 13500;

const CANDLE_SLOT = CHART_WIDTH / CANDLES.length;
const CANDLE_BODY_WIDTH = CANDLE_SLOT * 0.45;

const PRICE_LABELS = [145, 150, 155, 160, 165, 170];

const priceToY = (price: number) =>
  CHART_HEIGHT - ((price - PRICE_MIN) / PRICE_RANGE) * CHART_HEIGHT;

const volumeToH = (vol: number) =>
  (vol / MAX_VOLUME) * VOLUME_HEIGHT;

export const CandlestickChart: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleProgress = spring({ frame, fps, config: { damping: 30, stiffness: 70 } });
  const titleOpacity = interpolate(titleProgress, [0, 1], [0, 1]);
  const titleY = interpolate(titleProgress, [0, 1], [-30, 0]);

  const axisProgress = spring({ frame: Math.max(0, frame - 5), fps, config: { damping: 40, stiffness: 60 } });
  const axisOpacity = interpolate(axisProgress, [0, 1], [0, 1]);

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
          top: 56,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
        }}
      >
        <div style={{ fontSize: 52, fontWeight: 700, color: "#ffffff", letterSpacing: "0.05em" }}>
          股票走勢圖
        </div>
        <div style={{ marginTop: 8, fontSize: 20, color: "#6b7280", letterSpacing: "0.08em" }}>
          近十個交易日 K 線圖與成交量
        </div>
      </div>

      {/* Y-axis price labels & grid lines */}
      {PRICE_LABELS.map((price) => {
        const y = CHART_TOP + priceToY(price);
        return (
          <React.Fragment key={price}>
            <div
              style={{
                position: "absolute",
                left: CHART_LEFT + CHART_WIDTH + 12,
                top: y - 12,
                fontSize: 18,
                color: "#9ca3af",
                opacity: axisOpacity,
                width: 50,
              }}
            >
              {price}
            </div>
            <div
              style={{
                position: "absolute",
                left: CHART_LEFT,
                top: y,
                width: CHART_WIDTH,
                height: 1,
                background: price === PRICE_MIN ? "#4b5563" : "rgba(75,85,99,0.25)",
                opacity: axisOpacity,
              }}
            />
          </React.Fragment>
        );
      })}

      {/* Chart frame baseline */}
      <div
        style={{
          position: "absolute",
          left: CHART_LEFT,
          top: CHART_TOP + CHART_HEIGHT,
          width: CHART_WIDTH,
          height: 2,
          background: "#374151",
          opacity: axisOpacity,
        }}
      />

      {/* Candles and volume bars */}
      {CANDLES.map((candle, index) => {
        const startFrame = index * 8 + 10;
        const candleProgress = spring({
          frame: Math.max(0, frame - startFrame),
          fps,
          config: { damping: 20, stiffness: 100 },
        });

        const scaleY = interpolate(candleProgress, [0, 1], [0, 1], { extrapolateRight: "clamp" });
        const opacity = interpolate(candleProgress, [0, 0.3], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

        const isBullish = candle.close >= candle.open;
        const bodyColor = isBullish ? "#22c55e" : "#ef4444";
        const wickColor = isBullish ? "#16a34a" : "#dc2626";

        const slotX = CHART_LEFT + index * CANDLE_SLOT;
        const candleCenterX = slotX + CANDLE_SLOT / 2;

        const bodyTop = priceToY(Math.max(candle.open, candle.close));
        const bodyBottom = priceToY(Math.min(candle.open, candle.close));
        const bodyHeight = Math.max(bodyBottom - bodyTop, 2);

        const wickTop = priceToY(candle.high);
        const wickBottom = priceToY(candle.low);
        const wickHeight = wickBottom - wickTop;

        const volH = volumeToH(candle.volume);

        const dateOpacity = interpolate(candleProgress, [0.4, 0.8], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

        return (
          <React.Fragment key={candle.date}>
            {/* Wick */}
            <div
              style={{
                position: "absolute",
                left: candleCenterX - 1.5,
                top: CHART_TOP + wickTop,
                width: 3,
                height: wickHeight * scaleY,
                background: wickColor,
                opacity,
                transformOrigin: "bottom center",
              }}
            />

            {/* Body */}
            <div
              style={{
                position: "absolute",
                left: candleCenterX - CANDLE_BODY_WIDTH / 2,
                top: CHART_TOP + bodyTop + bodyHeight * (1 - scaleY),
                width: CANDLE_BODY_WIDTH,
                height: bodyHeight * scaleY,
                background: bodyColor,
                opacity,
                borderRadius: 2,
                boxShadow: `0 0 12px ${bodyColor}66`,
              }}
            />

            {/* Volume bar */}
            <div
              style={{
                position: "absolute",
                left: candleCenterX - CANDLE_BODY_WIDTH / 2,
                top: VOLUME_TOP + VOLUME_HEIGHT - volH * scaleY,
                width: CANDLE_BODY_WIDTH,
                height: volH * scaleY,
                background: isBullish ? "rgba(34,197,94,0.45)" : "rgba(239,68,68,0.45)",
                opacity,
                borderRadius: "2px 2px 0 0",
              }}
            />

            {/* Date label */}
            <div
              style={{
                position: "absolute",
                left: slotX,
                top: CHART_TOP + CHART_HEIGHT + 16,
                width: CANDLE_SLOT,
                textAlign: "center",
                fontSize: 17,
                color: "#9ca3af",
                opacity: dateOpacity,
              }}
            >
              {candle.date}
            </div>
          </React.Fragment>
        );
      })}

      {/* Volume axis label */}
      <div
        style={{
          position: "absolute",
          left: CHART_LEFT - 10,
          top: VOLUME_TOP,
          fontSize: 16,
          color: "#6b7280",
          opacity: axisOpacity,
        }}
      >
        成交量
      </div>

      {/* Volume baseline */}
      <div
        style={{
          position: "absolute",
          left: CHART_LEFT,
          top: VOLUME_TOP + VOLUME_HEIGHT,
          width: CHART_WIDTH,
          height: 1,
          background: "#374151",
          opacity: axisOpacity,
        }}
      />

      {/* Y-axis label */}
      <div
        style={{
          position: "absolute",
          left: CHART_LEFT + CHART_WIDTH + 12,
          top: CHART_TOP - 28,
          fontSize: 16,
          color: "#6b7280",
          opacity: axisOpacity,
        }}
      >
        價格 (TWD)
      </div>
    </AbsoluteFill>
  );
};