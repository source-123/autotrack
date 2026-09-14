import React from "react";
import { View, Text } from "react-native";
import Svg, { Rect, Line, Text as SvgText } from "react-native-svg";

type DataPoint = { label: string; value: number };

type Props = {
  data: DataPoint[];
  height?: number;
  color?: string;
  formatValue?: (v: number) => string;
};

export function BarChart({ data, height = 180, color = "#2563eb", formatValue }: Props) {
  if (data.length === 0) return null;

  const width = 320;
  const padding = { top: 20, bottom: 30, left: 8, right: 8 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const barWidth = (chartWidth / data.length) * 0.65;
  const gap = (chartWidth / data.length) * 0.35;

  return (
    <View className="items-center">
      <Svg width={width} height={height}>
        {/* Ligne de base */}
        <Line
          x1={padding.left}
          y1={height - padding.bottom}
          x2={width - padding.right}
          y2={height - padding.bottom}
          stroke="#e2e8f0"
          strokeWidth={1}
        />

        {data.map((d, i) => {
          const barHeight = (d.value / maxValue) * chartHeight;
          const x = padding.left + i * (barWidth + gap) + gap / 2;
          const y = height - padding.bottom - barHeight;

          return (
            <React.Fragment key={i}>
              <Rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(barHeight, 2)}
                rx={4}
                fill={d.value > 0 ? color : "#e2e8f0"}
              />
              <SvgText
                x={x + barWidth / 2}
                y={height - 8}
                fontSize="10"
                fill="#64748b"
                textAnchor="middle"
              >
                {d.label}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
}
