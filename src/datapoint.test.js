import DataPoint from "./datapoint";

describe("datapoint tests", () => {

    test('should create data point from numeric value primitive', () => {
        const v = Math.random() * 10000000;
        expect(new DataPoint(v).value).toBe(v);
    });

    test.each([
        [{value: 1}, {value: 1, label: "1"}],
        [{value: 2, label: "foo"}, {value: 2, label: "foo"}],
        [{value: 4, color: "green"}, {value: 4, label: "4", color: "green"}],
        [{value: 3, label: "bar", color: "green"}, {value: 3, label: "bar", color: "green"}],
    ])
    ('should create data point from object literal', (input, expected) => {
        const {value, label, color} = new DataPoint(input);
        expect({value, label, color}).toEqual(expected);
    });

    test('should update value', () => {
        const dataPoint = new DataPoint(1);
        dataPoint.value = 2;
        expect(dataPoint.value).toBe(2);
    });

    test('should update label', () => {
        const dataPoint = new DataPoint({value: 0, label: "foo"});
        dataPoint.label = "bar";
        expect(dataPoint.label).toBe("bar");
    });

    test('should update color', () => {
        const dataPoint = new DataPoint({value: 0, color: "red"});
        dataPoint.color = "green";
        expect(dataPoint.color).toBe("green");
    });

    test('should throw error if no input specified', () => {
        expect(() => new DataPoint()).toThrow("data point argument is missing");
    });

    test.each(["x!45.1", [], {}])('should throw error if invalid input specified', (v) => {
        expect(() => new DataPoint(v)).toThrow("numeric value is required to create a data point");
    });

    test('should throw error if object literal has invalid value', () => {
        expect(() => new DataPoint({value: "foobar"})).toThrow("numeric value is required to create a data point");
    });

    test('should throw error if object literal is missing value', () => {
        expect(() => new DataPoint({label: "foobar"})).toThrow("numeric value is required to create a data point");
    });

    test('should throw error if assigning an invalid value', () => {
        expect(() => new DataPoint(1).value = "foobar").toThrow("foobar is not a valid numeric value");
    });
});
