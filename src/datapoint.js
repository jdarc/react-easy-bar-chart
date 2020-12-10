import {isNumber} from "./utils";

export default class DataPoint {

    constructor(input) {
        if (arguments.length === 0) throw new Error("data point argument is missing");

        this._value = isNumber(input) ? input : input.value;
        if (!isNumber(this._value)) throw new Error("numeric value is required to create a data point");

        this._label = input.label;
        this._color = input.color;
    }

    get value() {
        return this._value;
    }

    set value(v) {
        if (!isNumber(v)) throw new Error(`${v} is not a valid numeric value`);
        this._value = v;
    }

    get label() {
        return this._label || this.value.toString();
    }

    set label(v) {
        this._label = v;
    }

    get color() {
        return this._color;
    }

    set color(v) {
        this._color = v;
    }
}
