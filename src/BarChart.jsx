import React from 'react';
import Settings from "./settings";
import Dataset from "./dataset";
import {configureCanvas, drawLines, drawText, estimateFontHeight, estimateStringWidth, generateLayout} from "./utils";

const TitleSizeFactor = 1.25;
const AxesSizeFactor = 1.1;

const computeZeroOffset = (layout, settings, dataset) => {
    const {ticks} = settings.appearance;
    const {bottom, height} = layout.content;
    const ranges = dataset.ranges(ticks);
    const count = Math.max(0, ranges.reduce((acc, d) => acc + (d <= 0 ? 1 : 0), 0) - 1);
    return bottom - count * height / ticks;
}

const computeLayout = (ctx, settings, dataset) => {
    const {ticks} = settings.appearance;
    const {size: fontSize} = settings.font;
    ctx.font = settings.fontString({size: fontSize * TitleSizeFactor});
    const titleSize = estimateFontHeight(ctx);
    ctx.font = settings.fontString({size: fontSize * AxesSizeFactor});
    const axesSize = estimateFontHeight(ctx);
    const {drawXLabels, drawYLabels} = settings.toggles;
    const labelsWidth = Math.max(...(dataset.ranges(ticks).map(label => estimateStringWidth(ctx, label))));
    const padding = 2 * settings.design.padding;
    const offsets = {top: 0, right: 0, bottom: drawXLabels ? axesSize : 0, left: drawYLabels ? labelsWidth : 0};
    const labelHeights = {top: titleSize, right: axesSize, bottom: axesSize, left: axesSize};
    const {title: top, empty: right, axisx: bottom, axisy: left} = {...settings.labels};
    return generateLayout(ctx, Object.entries({top, right, bottom, left}).reduce((acc, cur) => ({
        ...acc, ...{[cur[0]]: offsets[cur[0]] + padding + (!!cur[1] | 0) * (labelHeights[cur[0]] + padding)}
    }), {}));
};

const renderTitleLabel = (ctx, {layout, settings}) => {
    const {title} = settings.labels;
    if (title) {
        const {top, left, width} = layout.content;
        const x = width / 2 + left;
        const y = top / 2;
        ctx.font = settings.fontString({size: settings.font.size * TitleSizeFactor});
        ctx.fillText(title, x, y, width);
    }
};

const renderAxisXLabel = (ctx, {layout, settings}) => {
    const {axisx} = settings.labels;
    if (axisx) {
        const {padding} = settings.design;
        const {drawXLabels} = settings.toggles;
        const {center, bottom, width} = layout.content;
        ctx.font = settings.fontString({size: settings.font.size * AxesSizeFactor});
        const fontHeight = estimateFontHeight(ctx);
        const y = (layout.height + bottom) / 2 + (drawXLabels ? (fontHeight + padding) / 2 : 0);
        ctx.fillText(axisx, center.x, y, width);
    }
};

const renderAxisYLabel = (ctx, {layout, settings, dataset}) => {
    const {axisy} = settings.labels;
    if (axisy) {
        const {ticks} = settings.appearance;
        const {padding} = settings.design;
        const {drawYLabels} = settings.toggles;
        const {left, center, height} = layout.content;
        const currentTransform = ctx.getTransform();
        ctx.font = settings.fontString({size: settings.font.size * AxesSizeFactor});
        const labelsWidth = Math.max(...(dataset.ranges(ticks).map(label => estimateStringWidth(ctx, label))));
        ctx.rotate(-Math.PI / 2);
        ctx.translate(-center.y, (left - padding / 2 - (drawYLabels ? labelsWidth : 0)) / 2);
        ctx.fillText(axisy, 0, 0, Math.floor(height));
        ctx.setTransform(currentTransform);
    }
};

const renderLabels = (ctx, payload) => {
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    renderTitleLabel(ctx, payload);
    renderAxisXLabel(ctx, payload);
    renderAxisYLabel(ctx, payload);
};

const renderAxes = (ctx, {layout, settings, dataset}) => {
    const {left, bottom, width, height} = layout.content;
    const {ticks} = settings.appearance;
    const {padding, offset} = settings.design;
    const barsize = width / (dataset.size + offset);
    const x = left + (barsize / 2) * (offset + 1);
    const y = bottom + padding;
    const dy = height / ticks;

    ctx.font = settings.fontString();
    ctx.fillStyle = "black";

    if (settings.toggles.drawXLabels) {
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        dataset.data.forEach((dp, i) => ctx.fillText(dp.label, x + barsize * i, y, Math.max(1, barsize - 4)));
    }

    if (settings.toggles.drawYLabels) {
        ctx.textAlign = "end";
        ctx.textBaseline = "middle";
        dataset.ranges(ticks).forEach((val, idx) => ctx.fillText(val, left - padding, bottom - dy * idx))
    }
};

const renderTicks = (ctx, {layout, settings, dataset}) => {
    if (!settings.toggles.drawTicks) return;

    const {ticks} = settings.appearance;
    const {left, right, bottom, height} = layout.content;
    const dy = height / ticks;
    const offsets = Array.from({length: ticks + 1}, (x, i) => bottom - dy * i);
    const zeroOffset = computeZeroOffset(layout, settings, dataset);

    ctx.lineWidth = 0.75;

    ctx.strokeStyle = "rgba(0, 0, 0, 0.25)";
    drawLines(ctx, offsets.map(o => ({x1: left, y1: o, x2: right, y2: o})));

    ctx.strokeStyle = "rgba(0, 0, 0, 0.75)";
    drawLines(ctx, {x1: left, y1: zeroOffset, x2: right, y2: zeroOffset});
};

const renderChart = (ctx, {layout, settings, dataset}) => {
    const {top, width, left, height} = layout.content;
    const {offset} = settings.design;
    const {opacity, outline, color, perc} = settings.appearance;

    const totalWidth = width / (dataset.size + (offset ? 1 : 0));
    const barWidth = (totalWidth * perc) / 100;
    const startX = left + (offset ? totalWidth : totalWidth / 2) - barWidth / 2;

    const zeroY = computeZeroOffset(layout, settings, dataset);
    const zone1 = zeroY - top;
    const zone2 = height - zone1;
    const {min: minRange, max: maxRange} = dataset.range();
    const basis = dataset.zeroBased ? 0 : 1;
    const scaler1 = zone1 / (maxRange - minRange * basis);
    const scaler2 = zone2 / (maxRange * basis - minRange);

    renderTicks(ctx, {layout, settings, dataset});

    const renderer = fn => dataset.data
        .map(dataPoint => ({value: dataPoint.value, color: dataPoint.color || color}))
        .forEach(({value: val, color: col}, i) => {
            const height = val >= 0 ? (val - minRange * basis) * scaler1 : (val - maxRange * basis) * scaler2;
            fn.color(col);
            fn.render(startX + i * totalWidth, zeroY - height, barWidth, height);
        });

    const renderCallbacks = (ctx, fill, opacity, color) => {
        ctx.globalAlpha = opacity;
        return {
            color: c => ctx[fill ? "fillStyle" : "strokeStyle"] = color || c,
            render: (x, y, w, h) => ctx[fill ? "fillRect" : "strokeRect"](x, y, w, h)
        };
    };

    const renderFuncs = [
        ({ctx, renderer, opacity}) => renderer(renderCallbacks(ctx, true, opacity)),
        ({ctx, renderer, outline}) => outline && renderer(renderCallbacks(ctx, false, 0.9, "black"))
    ];

    renderFuncs[opacity < 1 ? 1 : 0]({ctx, renderer, opacity, outline});
    renderFuncs[opacity < 1 ? 0 : 1]({ctx, renderer, opacity, outline});
};

const render = (window, ctx, props) => {
    const settings = props.settings || new Settings();
    const dataset = props.dataset || new Dataset();

    configureCanvas(ctx, window.devicePixelRatio);

    if (dataset.size > 0) {
        const payload = {layout: computeLayout(ctx, settings, dataset), settings, dataset};
        renderLabels(ctx, payload);
        renderAxes(ctx, payload);
        renderChart(ctx, payload);
    } else {
        ctx.font = settings.fontString({size: Math.min(16, ctx.canvas.width / 10) | 16});
        drawText(ctx, "Nothing to render, no data provided.");
    }
};

export default class BarChart extends React.Component {

    constructor(props) {
        super(props);
        this.chartCanvasRef = React.createRef();
    }

    componentDidMount() {
        render(window, this.chartCanvasRef.current.getContext("2d"), this.props);
    }

    componentDidUpdate() {
        render(window, this.chartCanvasRef.current.getContext("2d"), this.props);
    }

    render() {
        return <canvas
            ref={this.chartCanvasRef}
            style={{cursor: "crosshair"}}
            width={{...this.props}.width || 400}
            height={{...this.props}.height || 300}
        />;
    }
}
