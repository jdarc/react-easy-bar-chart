export default class Settings {
    _ticks = 10;
    _perc = 95;
    _padding = 5;
    _color = "#e24a90";
    _opacity = 0.5;
    _offset = true;
    _outline = true;
    _fontStyle = "normal";
    _fontSize = "12";
    _fontFamily = "monospaced";
    _titleLabel = "";
    _axisYLabel = "";
    _axisXLabel = "";
    _drawTicks = true;
    _drawXLabels = true;
    _drawYLabels = true;

    constructor(settings = {}) {
        settings && Object.getOwnPropertyNames(this)
            .map(name => name.startsWith("_") ? name.slice(1) : name)
            .filter(name => typeof settings[name] === typeof this[`_${name}`])
            .forEach(name => this[`_${name}`] = settings[name]);
    }

    get appearance() {
        return {
            ticks: Math.max(1, Math.ceil(this._ticks)),
            perc: Math.max(0, Math.min(100, this._perc)),
            color: this._color,
            opacity: Math.max(0, Math.min(1, this._opacity)),
            outline: this._outline,
        }
    }

    get design() {
        return {
            offset: this._offset,
            padding: this._padding,
        }
    }

    get toggles() {
        return {
            drawTicks: this._drawTicks,
            drawXLabels: this._drawXLabels,
            drawYLabels: this._drawYLabels,
        }
    }

    get labels() {
        return {
            title: this._titleLabel,
            axisy: this._axisYLabel,
            axisx: this._axisXLabel,
        }
    }

    get font() {
        return {
            size: this._fontSize,
            style: this._fontStyle,
            family: this._fontFamily,
        }
    }

    fontString(overrides) {
        const options = {...this.font, ...overrides};
        return `${options.style} ${options.size}px ${options.family}`;
    }
}
