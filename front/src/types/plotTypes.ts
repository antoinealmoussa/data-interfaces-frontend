export type StandardBarChartPoint = {
  x: number | string;
  y: number;
};

export type StandardBarChartProps = {
  dataSet: StandardBarChartPoint[] | undefined;
  width?: number;
  height?: number;
  barColor?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  isAnimationActive?: boolean;
};
