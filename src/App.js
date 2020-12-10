import React from 'react';
import BarChart from "./BarChart";
import DataSet from "./dataset";
import Settings from "./settings";

function App() {
    const settings = new Settings({
        titleLabel: "Mileage Checks",
        axisYLabel: "Average Per Month",
        axisXLabel: "Last N Readings"
    });

    const dataset = new DataSet([
        {value: 100},
        {value: 400},
        {value: 800},
        {value: 1834},
        {value: 1933}
    ]);

    return <BarChart width={800} height={600} settings={settings} dataset={dataset}/>;
}

export default App;
