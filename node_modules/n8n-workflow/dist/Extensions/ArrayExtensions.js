"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.arrayExtensions = exports.average = void 0;
const ExpressionError_1 = require("../ExpressionError");
const ObjectExtensions_1 = require("./ObjectExtensions");
const deep_equal_1 = __importDefault(require("deep-equal"));
function first(value) {
    return value[0];
}
function isEmpty(value) {
    return value.length === 0;
}
function isNotEmpty(value) {
    return value.length > 0;
}
function last(value) {
    return value[value.length - 1];
}
function pluck(value, extraArgs) {
    if (!Array.isArray(extraArgs)) {
        throw new ExpressionError_1.ExpressionError('arguments must be passed to pluck');
    }
    if (!extraArgs || extraArgs.length === 0) {
        return value;
    }
    const plucked = value.reduce((pluckedFromObject, current) => {
        if (current && typeof current === 'object') {
            const p = [];
            Object.keys(current).forEach((k) => {
                extraArgs.forEach((field) => {
                    if (current && field === k) {
                        p.push(current[k]);
                    }
                });
            });
            if (p.length > 0) {
                pluckedFromObject.push(p.length === 1 ? p[0] : p);
            }
        }
        return pluckedFromObject;
    }, new Array());
    return plucked;
}
function randomItem(value) {
    const len = value === undefined ? 0 : value.length;
    return len ? value[Math.floor(Math.random() * len)] : undefined;
}
function unique(value, extraArgs) {
    if (extraArgs.length) {
        return value.reduce((l, v) => {
            if (typeof v === 'object' && v !== null && extraArgs.every((i) => i in v)) {
                const alreadySeen = l.find((i) => extraArgs.every((j) => (0, deep_equal_1.default)(i[j], (v, { strict: true })[j], { strict: true })));
                if (!alreadySeen) {
                    l.push(v);
                }
            }
            return l;
        }, []);
    }
    return value.reduce((l, v) => {
        if (l.findIndex((i) => (0, deep_equal_1.default)(i, v, { strict: true })) === -1) {
            l.push(v);
        }
        return l;
    }, []);
}
const ensureNumberArray = (arr, { fnName }) => {
    if (arr.some((i) => typeof i !== 'number')) {
        throw new ExpressionError_1.ExpressionExtensionError(`${fnName}(): all array elements must be numbers`);
    }
};
function sum(value) {
    ensureNumberArray(value, { fnName: 'sum' });
    return value.reduce((p, c) => {
        if (typeof c === 'string') {
            return p + parseFloat(c);
        }
        if (typeof c !== 'number') {
            return NaN;
        }
        return p + c;
    }, 0);
}
function min(value) {
    ensureNumberArray(value, { fnName: 'min' });
    return Math.min(...value.map((v) => {
        if (typeof v === 'string') {
            return parseFloat(v);
        }
        if (typeof v !== 'number') {
            return NaN;
        }
        return v;
    }));
}
function max(value) {
    ensureNumberArray(value, { fnName: 'max' });
    return Math.max(...value.map((v) => {
        if (typeof v === 'string') {
            return parseFloat(v);
        }
        if (typeof v !== 'number') {
            return NaN;
        }
        return v;
    }));
}
function average(value) {
    ensureNumberArray(value, { fnName: 'average' });
    if (value.length === 0) {
        return 0;
    }
    return sum(value) / value.length;
}
exports.average = average;
function compact(value) {
    return value
        .filter((v) => {
        if (v && typeof v === 'object' && Object.keys(v).length === 0)
            return false;
        return v !== null && v !== undefined && v !== 'nil' && v !== '';
    })
        .map((v) => {
        if (typeof v === 'object' && v !== null) {
            return (0, ObjectExtensions_1.compact)(v);
        }
        return v;
    });
}
function smartJoin(value, extraArgs) {
    const [keyField, valueField] = extraArgs;
    if (!keyField || !valueField || typeof keyField !== 'string' || typeof valueField !== 'string') {
        throw new ExpressionError_1.ExpressionExtensionError('smartJoin(): expected two string args, e.g. .smartJoin("name", "value")');
    }
    return value.reduce((o, v) => {
        if (typeof v === 'object' && v !== null && keyField in v && valueField in v) {
            o[v[keyField]] = v[valueField];
        }
        return o;
    }, {});
}
function chunk(value, extraArgs) {
    const [chunkSize] = extraArgs;
    if (typeof chunkSize !== 'number' || chunkSize === 0) {
        throw new ExpressionError_1.ExpressionExtensionError('chunk(): expected non-zero numeric arg, e.g. .chunk(5)');
    }
    const chunks = [];
    for (let i = 0; i < value.length; i += chunkSize) {
        chunks.push(value.slice(i, i + chunkSize));
    }
    return chunks;
}
function renameKeys(value, extraArgs) {
    if (extraArgs.length === 0 || extraArgs.length % 2 !== 0) {
        throw new ExpressionError_1.ExpressionExtensionError('renameKeys(): expected an even amount of args: from1, to1 [, from2, to2, ...]. e.g. .renameKeys("name", "title")');
    }
    return value.map((v) => {
        if (typeof v !== 'object' || v === null) {
            return v;
        }
        const newObj = { ...v };
        const chunkedArgs = chunk(extraArgs, [2]);
        chunkedArgs.forEach(([from, to]) => {
            if (from in newObj) {
                newObj[to] = newObj[from];
                delete newObj[from];
            }
        });
        return newObj;
    });
}
function mergeObjects(value, extraArgs) {
    const [other] = extraArgs;
    if (!other) {
        return value;
    }
    if (typeof other !== 'object') {
        throw new ExpressionError_1.ExpressionExtensionError('merge(): expected object arg');
    }
    const newObject = { ...value };
    for (const [key, val] of Object.entries(other)) {
        if (!(key in newObject)) {
            newObject[key] = val;
        }
    }
    return newObject;
}
function merge(value, extraArgs) {
    const [others] = extraArgs;
    if (others === undefined) {
        const merged = value.reduce((combined, current) => {
            if (current !== null && typeof current === 'object' && !Array.isArray(current)) {
                combined = mergeObjects(combined, [current]);
            }
            return combined;
        }, {});
        return merged;
    }
    if (!Array.isArray(others)) {
        throw new ExpressionError_1.ExpressionExtensionError('merge(): expected array arg, e.g. .merge([{ id: 1, otherValue: 3 }])');
    }
    const listLength = value.length > others.length ? value.length : others.length;
    let merged = {};
    for (let i = 0; i < listLength; i++) {
        if (value[i] !== undefined) {
            if (typeof value[i] === 'object' && typeof others[i] === 'object') {
                merged = Object.assign(merged, mergeObjects(value[i], [others[i]]));
            }
        }
    }
    return merged;
}
function union(value, extraArgs) {
    const [others] = extraArgs;
    if (!Array.isArray(others)) {
        throw new ExpressionError_1.ExpressionExtensionError('union(): expected array arg, e.g. .union([1, 2, 3, 4])');
    }
    const newArr = Array.from(value);
    for (const v of others) {
        if (newArr.findIndex((w) => (0, deep_equal_1.default)(w, v, { strict: true })) === -1) {
            newArr.push(v);
        }
    }
    return unique(newArr, []);
}
function difference(value, extraArgs) {
    const [others] = extraArgs;
    if (!Array.isArray(others)) {
        throw new ExpressionError_1.ExpressionExtensionError('difference(): expected array arg, e.g. .difference([1, 2, 3, 4])');
    }
    const newArr = [];
    for (const v of value) {
        if (others.findIndex((w) => (0, deep_equal_1.default)(w, v, { strict: true })) === -1) {
            newArr.push(v);
        }
    }
    return unique(newArr, []);
}
function intersection(value, extraArgs) {
    const [others] = extraArgs;
    if (!Array.isArray(others)) {
        throw new ExpressionError_1.ExpressionExtensionError('intersection(): expected array arg, e.g. .intersection([1, 2, 3, 4])');
    }
    const newArr = [];
    for (const v of value) {
        if (others.findIndex((w) => (0, deep_equal_1.default)(w, v, { strict: true })) !== -1) {
            newArr.push(v);
        }
    }
    for (const v of others) {
        if (value.findIndex((w) => (0, deep_equal_1.default)(w, v, { strict: true })) !== -1) {
            newArr.push(v);
        }
    }
    return unique(newArr, []);
}
average.doc = {
    name: 'average',
    description: 'Returns the mean average of all values in the array.',
    returnType: 'number',
    docURL: 'https://docs.n8n.io/code-examples/expressions/data-transformation-functions/arrays/#array-average',
};
compact.doc = {
    name: 'compact',
    description: 'Removes all empty values from the array.',
    returnType: 'Array',
    docURL: 'https://docs.n8n.io/code-examples/expressions/data-transformation-functions/arrays/#array-compact',
};
isEmpty.doc = {
    name: 'isEmpty',
    description: 'Checks if the array doesn’t have any elements.',
    returnType: 'boolean',
    docURL: 'https://docs.n8n.io/code-examples/expressions/data-transformation-functions/arrays/#array-isEmpty',
};
isNotEmpty.doc = {
    name: 'isNotEmpty',
    description: 'Checks if the array has elements.',
    returnType: 'boolean',
    docURL: 'https://docs.n8n.io/code-examples/expressions/data-transformation-functions/arrays/#array-isNotEmpty',
};
first.doc = {
    name: 'first',
    description: 'Returns the first element of the array.',
    returnType: 'Element',
    docURL: 'https://docs.n8n.io/code-examples/expressions/data-transformation-functions/arrays/#array-first',
};
last.doc = {
    name: 'last',
    description: 'Returns the last element of the array.',
    returnType: 'Element',
    docURL: 'https://docs.n8n.io/code-examples/expressions/data-transformation-functions/arrays/#array-last',
};
max.doc = {
    name: 'max',
    description: 'Gets the maximum value from a number-only array.',
    returnType: 'number',
    docURL: 'https://docs.n8n.io/code-examples/expressions/data-transformation-functions/arrays/#array-max',
};
min.doc = {
    name: 'min',
    description: 'Gets the minimum value from a number-only array.',
    returnType: 'number',
    docURL: 'https://docs.n8n.io/code-examples/expressions/data-transformation-functions/arrays/#array-min',
};
randomItem.doc = {
    name: 'randomItem',
    description: 'Returns a random element from an array.',
    returnType: 'Element',
    docURL: 'https://docs.n8n.io/code-examples/expressions/data-transformation-functions/arrays/#array-randomItem',
};
sum.doc = {
    name: 'sum',
    description: 'Returns the total sum all the values in an array of parsable numbers.',
    returnType: 'number',
    docURL: 'https://docs.n8n.io/code-examples/expressions/data-transformation-functions/arrays/#array-sum',
};
chunk.doc = {
    name: 'chunk',
    description: 'Splits arrays into chunks with a length of `size`.',
    returnType: 'Array',
    args: [{ name: 'size', type: 'number' }],
    docURL: 'https://docs.n8n.io/code-examples/expressions/data-transformation-functions/arrays/#array-chunk',
};
difference.doc = {
    name: 'difference',
    description: 'Compares two arrays. Returns all elements in the base array that aren’t present in `arr`.',
    returnType: 'Array',
    args: [{ name: 'arr', type: 'Array' }],
    docURL: 'https://docs.n8n.io/code-examples/expressions/data-transformation-functions/arrays/#array-difference',
};
intersection.doc = {
    name: 'intersection',
    description: 'Compares two arrays. Returns all elements in the base array that are present in `arr`.',
    returnType: 'Array',
    args: [{ name: 'arr', type: 'Array' }],
    docURL: 'https://docs.n8n.io/code-examples/expressions/data-transformation-functions/arrays/#array-intersection',
};
merge.doc = {
    name: 'merge',
    description: 'Merges two Object-arrays into one array by merging the key-value pairs of each element.',
    returnType: 'array',
    args: [{ name: 'arr', type: 'Array' }],
    docURL: 'https://docs.n8n.io/code-examples/expressions/data-transformation-functions/arrays/#array-merge',
};
pluck.doc = {
    name: 'pluck',
    description: 'Returns an array of Objects where the key is equal the given `fieldName`s.',
    returnType: 'Array',
    args: [
        { name: 'fieldName1', type: 'string' },
        { name: 'fieldName1?', type: 'string' },
        { name: '...' },
        { name: 'fieldNameN?', type: 'string' },
    ],
    docURL: 'https://docs.n8n.io/code-examples/expressions/data-transformation-functions/arrays/#array-pluck',
};
renameKeys.doc = {
    name: 'renameKeys',
    description: 'Renames all matching keys in the array.',
    returnType: 'Array',
    args: [
        { name: 'from1', type: 'string' },
        { name: 'to1', type: 'string' },
        { name: 'from2?', type: 'string' },
        { name: 'to2?', type: 'string' },
        { name: '...' },
        { name: 'fromN?', type: 'string' },
        { name: 'toN?', type: 'string' },
    ],
    docURL: 'https://docs.n8n.io/code-examples/expressions/data-transformation-functions/arrays/#array-renameKeys',
};
smartJoin.doc = {
    name: 'smartJoin',
    description: 'Operates on an array of objects where each object contains key-value pairs. Creates a new object containing key-value pairs, where the key is the value of the first pair, and the value is the value of the second pair. Removes non-matching and empty values and trims any whitespace before joining.',
    returnType: 'Array',
    args: [
        { name: 'keyField', type: 'string' },
        { name: 'nameField', type: 'string' },
    ],
    docURL: 'https://docs.n8n.io/code-examples/expressions/data-transformation-functions/arrays/#array-smartJoin',
};
union.doc = {
    name: 'union',
    description: 'Concatenates two arrays and then removes duplicates.',
    returnType: 'Array',
    args: [{ name: 'arr', type: 'Array' }],
    docURL: 'https://docs.n8n.io/code-examples/expressions/data-transformation-functions/arrays/#array-union',
};
unique.doc = {
    name: 'unique',
    description: 'Remove duplicates from an array. ',
    returnType: 'Element',
    aliases: ['removeDuplicates'],
    docURL: 'https://docs.n8n.io/code-examples/expressions/data-transformation-functions/arrays/#array-unique',
};
exports.arrayExtensions = {
    typeName: 'Array',
    functions: {
        removeDuplicates: unique,
        unique,
        first,
        last,
        pluck,
        randomItem,
        sum,
        min,
        max,
        average,
        isNotEmpty,
        isEmpty,
        compact,
        smartJoin,
        chunk,
        renameKeys,
        merge,
        union,
        difference,
        intersection,
    },
};
//# sourceMappingURL=ArrayExtensions.js.map