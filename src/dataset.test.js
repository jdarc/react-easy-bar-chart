import Dataset from "./dataset";
import DataPoint from "./datapoint";

describe("dataset tests", () => {

    describe("given no data points present", () => {
        const dataset = new Dataset();

        test('should return a total of zero', () => expect(dataset.size).toBe(0));

        test('should return correct default range', () => expect(dataset.ranges()).toEqual([-1, 0, 1]));
    });

    describe("given valid constructor arguments with values", () => {

        test('should construct with numeric array', () => {
            const dataset = new Dataset([-1, -2, 3, 4, 5, 6]);
            expect(dataset.data.map(d => d.value)).toEqual([-1, -2, 3, 4, 5, 6]);
        });

        test('should construct with object literal array', () => {
            const dataset = new Dataset([{value: 88}, {value: 341}, {value: 662}, {value: 1834}, {value: 1278},]);
            expect(dataset.data.map(d => d.value)).toEqual([88, 341, 662, 1834, 1278]);
        });

        test('should construct with data point array', () => {
            const dataset = new Dataset([new DataPoint(-34), new DataPoint(108), new DataPoint(-351)]);
            expect(dataset.data.map(d => d.value)).toEqual([-34, 108, -351]);
        });
    });

    test('should throw error if invalid constructor argument specified', () => {
        expect(() => new Dataset("foobar")).toThrow("argument must be an array");
    });

    test('should return total number of data points', () => {
        const values = new Array(1 + Math.floor(Math.random() * 19))
        const dataset = new Dataset(values);
        expect(dataset.size).toBe(values.length);
    });

    test('should return value, label and color arrays', () => {
        const dataset = new Dataset([
            {value: 1},
            {value: 3, label: "a"},
            {value: 7, label: "b", color: "blue"},
            {value: 14, color: "green"}
        ]);

        expect(dataset.data.map(d => d.value)).toEqual([1, 3, 7, 14]);
        expect(dataset.data.map(d => d.label)).toEqual(["1", "a", "b", "14"]);
        expect(dataset.data.map(d => d.color)).toEqual([undefined, undefined, "blue", "green"]);
    });

    test('should return nearest min and max', () => {
        const dataSet = new Dataset([{value: -19}, {value: -6}, {value: 71}, {value: 115}]);

        expect(dataSet.minValue).toEqual(-19);
        expect(dataSet.maxValue).toEqual(115)
    });

    test('should return correct ranges', () => {
        const dataset = new Dataset([-5, -3, -7, 14]);
        expect(dataset.ranges(2)).toEqual([-7.50, 0, 14]);
    });

    test('should return correct positive ranges', () => {
        const dataset = new Dataset([5, 3, 7, 14]);
        expect(dataset.ranges(2)).toEqual([2.50, 8.75, 15]);
    });

    test('should return correct negative ranges', () => {
        const dataset = new Dataset([-5, -3, -7, -14]);
        expect(dataset.ranges(2)).toEqual([-15, -8.75, -2.50]);
    });
});

