import { BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Bar, ResponsiveContainer } from 'recharts';
import { type StandardBarChartProps } from "../../types/plotTypes"

const StandardBarChart: React.FC<StandardBarChartProps> = ({
    dataSet,
    barColor = "#8884d8",
    xAxisLabel = "X",
    yAxisLabel = "Y",
    isAnimationActive = true
}) => (
    <ResponsiveContainer height="100%">
        <BarChart
            data={dataSet}
            margin={{ top: 40, right: 20, left: 20, bottom: 40 }}
        >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="x" label={{ value: xAxisLabel, position: "insideBottom", offset: -10 }} />
            <YAxis width="auto" label={{ value: yAxisLabel, angle: -90, position: "insideLeft" }} />
            <Tooltip />
            <Bar dataKey="y" fill={barColor} isAnimationActive={isAnimationActive} />
        </BarChart>
    </ResponsiveContainer>
);

export default StandardBarChart;