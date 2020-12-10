import DataPoint from "./datapoint";
import {base} from "./utils";

export default class DataSet {

    constructor(dataPoints = []) {
        if (!Array.isArray(dataPoints)) throw new Error("argument must be an array");
        this.data = dataPoints.map(d => new DataPoint(d));
    }

    get size() {
        return this.data.length;
    }

    get minValue() {
        return Math.min(...this.data.map(d => d.value));
    }

    get maxValue() {
        return Math.max(...this.data.map(d => d.value));
    }

    get zeroBased() {
        const {min, max} = this.range();
        return min === 0 || max === 0 || (min < 0 && max > 0);
    }

    range() {
        const segments = 4;
        const min = this.minValue;
        const max = this.maxValue;

        if (min === 0 && max === 0) return {min: 0, max: 0}

        const sameSide = (min <= 0 && max <= 0) || (min >= 0 && max >= 0);

        const minRange = (() => {
            const diff = max - (sameSide ? min : 0);
            const pow = base(diff);
            const dps = pow / segments;

            let scale = Math.ceil(min / pow) * pow;
            while (scale > min) {
                scale -= dps;
            }
            return isNaN(scale) ? 0 : scale;
        })();

        const maxRange = (() => {
            const diff = (sameSide ? max : 0) - min;
            const pow = base(diff);
            const dps = pow / segments;

            let scale = Math.floor(max / pow) * pow;
            while (scale < max) {
                scale += dps;
            }
            return isNaN(scale) ? 0 : scale;
        })();

        return {min: minRange, max: maxRange};
    }

    ranges(groups = 1) {
        const {min, max} = this.range();
        const allZeros = min === 0 && max === 0;
        if (!allZeros) {
            if ((min <= 0 && max <= 0) || (min >= 0 && max >= 0)) {
                const dv = (max - min) / groups;
                return [...[...Array(groups).keys()].map((_, i) => min + i * dv), max];
            } else {
                const maxRat = Math.round(groups * (this.data.reduce((acc, d) => acc + (d.value >= 0 ? 1 : 0), 0) / this.size));
                const minRat = groups - maxRat;
                const maxv = max / maxRat;
                const minv = min / minRat;
                const maxr = [...[...Array(maxRat).keys()].map((_, i) => i * maxv), max].slice(1);
                const minr = [...[...Array(minRat).keys()].map((_, i) => i * minv), min].slice(1);
                return [...minr.reverse(), 0, ...maxr];
            }
        }
        return [-1, 0, 1];
    }
}
