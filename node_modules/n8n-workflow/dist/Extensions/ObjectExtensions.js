"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.objectExtensions = exports.urlEncode = exports.compact = void 0;
const ExpressionError_1 = require("../ExpressionError");
function isEmpty(value) {
    return Object.keys(value).length === 0;
}
function isNotEmpty(value) {
    return !isEmpty(value);
}
function hasField(value, extraArgs) {
    const [name] = extraArgs;
    return name in value;
}
function removeField(value, extraArgs) {
    const [name] = extraArgs;
    if (name in value) {
        const newObject = { ...value };
        delete newObject[name];
        return newObject;
    }
    return value;
}
function removeFieldsContaining(value, extraArgs) {
    const [match] = extraArgs;
    if (typeof match !== 'string' || match === '') {
        throw new ExpressionError_1.ExpressionExtensionError('removeFieldsContaining(): expected non-empty string arg');
    }
    const newObject = { ...value };
    for (const [key, val] of Object.entries(value)) {
        if (typeof val === 'string' && val.includes(match)) {
            delete newObject[key];
        }
    }
    return newObject;
}
function keepFieldsContaining(value, extraArgs) {
    const [match] = extraArgs;
    if (typeof match !== 'string' || match === '') {
        throw new ExpressionError_1.ExpressionExtensionError('argument of keepFieldsContaining must be a non-empty string');
    }
    const newObject = { ...value };
    for (const [key, val] of Object.entries(value)) {
        if (typeof val !== 'string' || (typeof val === 'string' && !val.includes(match))) {
            delete newObject[key];
        }
    }
    return newObject;
}
function compact(value) {
    const newObj = {};
    for (const [key, val] of Object.entries(value)) {
        if (val !== null && val !== undefined && val !== 'nil' && val !== '') {
            if (typeof val === 'object') {
                if (Object.keys(val).length === 0)
                    continue;
                newObj[key] = compact(val);
            }
            else {
                newObj[key] = val;
            }
        }
    }
    return newObj;
}
exports.compact = compact;
function urlEncode(value) {
    return new URLSearchParams(value).toString();
}
exports.urlEncode = urlEncode;
isEmpty.doc = {
    name: 'isEmpty',
    description: 'Checks if the Object has no key-value pairs.',
    returnType: 'boolean',
    docURL: 'https://docs.n8n.io/code-examples/expressions/data-transformation-functions/objects/#object-isEmpty',
};
isNotEmpty.doc = {
    name: 'isNotEmpty',
    description: 'Checks if the Object has key-value pairs.',
    returnType: 'boolean',
    docURL: 'https://docs.n8n.io/code-examples/expressions/data-transformation-functions/objects/#object-isNotEmpty',
};
compact.doc = {
    name: 'compact',
    description: 'Removes empty values from an Object.',
    returnType: 'boolean',
    docURL: 'https://docs.n8n.io/code-examples/expressions/data-transformation-functions/objects/#object-compact',
};
urlEncode.doc = {
    name: 'urlEncode',
    description: 'Transforms an Object into a URL parameter list. Only top-level keys are supported.',
    returnType: 'string',
    docURL: 'https://docs.n8n.io/code-examples/expressions/data-transformation-functions/objects/#object-urlEncode',
};
hasField.doc = {
    name: 'hasField',
    description: 'Checks if the Object has a given field. Only top-level keys are supported.',
    returnType: 'boolean',
    args: [{ name: 'fieldName', type: 'string' }],
    docURL: 'https://docs.n8n.io/code-examples/expressions/data-transformation-functions/objects/#object-hasField',
};
removeField.doc = {
    name: 'removeField',
    description: 'Removes a given field from the Object. Only top-level fields are supported.',
    returnType: 'object',
    args: [{ name: 'key', type: 'string' }],
    docURL: 'https://docs.n8n.io/code-examples/expressions/data-transformation-functions/objects/#object-removeField',
};
removeFieldsContaining.doc = {
    name: 'removeFieldsContaining',
    description: 'Removes fields with a given value from the Object. Only top-level values are supported.',
    returnType: 'object',
    args: [{ name: 'value', type: 'string' }],
    docURL: 'https://docs.n8n.io/code-examples/expressions/data-transformation-functions/objects/#object-removeFieldsContaining',
};
keepFieldsContaining.doc = {
    name: 'keepFieldsContaining',
    description: 'Removes fields that do not match the given value from the Object.',
    returnType: 'object',
    args: [{ name: 'value', type: 'string' }],
    docURL: 'https://docs.n8n.io/code-examples/expressions/data-transformation-functions/objects/#object-keepFieldsContaining',
};
exports.objectExtensions = {
    typeName: 'Object',
    functions: {
        isEmpty,
        isNotEmpty,
        hasField,
        removeField,
        removeFieldsContaining,
        keepFieldsContaining,
        compact,
        urlEncode,
    },
};
//# sourceMappingURL=ObjectExtensions.js.map