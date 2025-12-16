import Plot from "react-plotly.js";
import { Data } from 'plotly.js'

interface BarProps {
    data: Data[];
}

const Bar = ({ data }: BarProps) => {
    return (
        <Plot
            data={data}
            layout={{ width: 500, height: 500 }}
        />
    );
};

export default Bar;
