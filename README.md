# Bar Chart

A simple React component using Canvas element to draw bar charts efficiently and with a minimal amount of configuration.

## Usage

```jsx
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

return <BarChart width={800} height={600} settings={settings} dataset={dataset}/>;```

## License

Licensed under the MIT license.
