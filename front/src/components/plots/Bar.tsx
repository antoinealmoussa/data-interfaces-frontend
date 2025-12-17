import { BarChart, Legend, XAxis, YAxis, CartesianGrid, Tooltip, Bar, ResponsiveContainer } from 'recharts';
import { type StandardBarChartProps } from "../../types/plotTypes"


const StandardBarChart: React.FC<StandardBarChartProps> = ({
    dataSet,
    width = 500,
    height = 300,
    barColor = "#8884d8",
    xAxisLabel = "X",
    yAxisLabel = "Y",
    isAnimationActive = true
}) => (
    <div style={{ width: "100%", maxWidth: width }}>
        <ResponsiveContainer width="100%" height={height}>
            <BarChart data={dataSet}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="x" label={{ value: xAxisLabel, position: "insideBottom", offset: -5 }} />
                <YAxis width="auto" label={{ value: yAxisLabel, angle: -90, position: "insideLeft" }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="y" fill={barColor} isAnimationActive={isAnimationActive} />
            </BarChart>
        </ResponsiveContainer>
    </div>
);

export default StandardBarChart;