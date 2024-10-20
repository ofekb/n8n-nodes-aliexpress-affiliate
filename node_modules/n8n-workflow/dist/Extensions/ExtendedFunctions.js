"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extendedFunctions = void 0;
const ExpressionError_1 = require("../ExpressionError");
const ArrayExtensions_1 = require("./ArrayExtensions");
const min = Math.min;
const max = Math.max;
const numberList = (start, end) => {
    const size = Math.abs(start - end) + 1;
    const arr = new Array(size);
    let curr = start;
    for (let i = 0; i < size; i++) {
        if (start < end) {
            arr[i] = curr++;
        }
        else {
            arr[i] = curr--;
        }
    }
    return arr;
};
const zip = (keys, values) => {
    if (keys.length !== values.length) {
        throw new ExpressionError_1.ExpressionExtensionError('keys and values not of equal length');
    }
    return keys.reduce((p, c, i) => {
        p[c] = values[i];
        return p;
    }, {});
};
const average = (...args) => {
    return (0, ArrayExtensions_1.average)(args);
};
const not = (value) => {
    return !value;
};
exports.extendedFunctions = {
    min,
    max,
    not,
    average,
    numberList,
    zip,
    $min: min,
    $max: max,
    $average: average,
    $not: not,
};
//# sourceMappingURL=ExtendedFunctions.js.map