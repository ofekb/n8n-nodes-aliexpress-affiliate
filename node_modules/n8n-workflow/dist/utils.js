"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assert = exports.fileTypeFromMimeType = exports.sleep = exports.jsonStringify = exports.jsonParse = exports.deepCopy = void 0;
const deepCopy = (source, hash = new WeakMap(), path = '') => {
    const hasOwnProp = Object.prototype.hasOwnProperty.bind(source);
    if (typeof source !== 'object' || source === null || typeof source === 'function') {
        return source;
    }
    if (typeof source.toJSON === 'function') {
        return source.toJSON();
    }
    if (hash.has(source)) {
        return hash.get(source);
    }
    if (Array.isArray(source)) {
        const clone = [];
        const len = source.length;
        for (let i = 0; i < len; i++) {
            clone[i] = (0, exports.deepCopy)(source[i], hash, path + `[${i}]`);
        }
        return clone;
    }
    const clone = Object.create(Object.getPrototypeOf({}));
    hash.set(source, clone);
    for (const i in source) {
        if (hasOwnProp(i)) {
            clone[i] = (0, exports.deepCopy)(source[i], hash, path + `.${i}`);
        }
    }
    return clone;
};
exports.deepCopy = deepCopy;
const jsonParse = (jsonString, options) => {
    try {
        return JSON.parse(jsonString);
    }
    catch (error) {
        if ((options === null || options === void 0 ? void 0 : options.fallbackValue) !== undefined) {
            return options.fallbackValue;
        }
        else if (options === null || options === void 0 ? void 0 : options.errorMessage) {
            throw new Error(options.errorMessage);
        }
        throw error;
    }
};
exports.jsonParse = jsonParse;
const replaceCircularReferences = (value, knownObjects = new WeakSet()) => {
    if (typeof value !== 'object' || value === null || value instanceof RegExp)
        return value;
    if ('toJSON' in value && typeof value.toJSON === 'function')
        return value.toJSON();
    if (knownObjects.has(value))
        return '[Circular Reference]';
    knownObjects.add(value);
    const copy = (Array.isArray(value) ? [] : {});
    for (const key in value) {
        copy[key] = replaceCircularReferences(value[key], knownObjects);
    }
    knownObjects.delete(value);
    return copy;
};
const jsonStringify = (obj, options = {}) => {
    return JSON.stringify((options === null || options === void 0 ? void 0 : options.replaceCircularRefs) ? replaceCircularReferences(obj) : obj);
};
exports.jsonStringify = jsonStringify;
const sleep = async (ms) => new Promise((resolve) => {
    setTimeout(resolve, ms);
});
exports.sleep = sleep;
function fileTypeFromMimeType(mimeType) {
    if (mimeType.startsWith('application/json'))
        return 'json';
    if (mimeType.startsWith('image/'))
        return 'image';
    if (mimeType.startsWith('video/'))
        return 'video';
    if (mimeType.startsWith('text/'))
        return 'text';
    return;
}
exports.fileTypeFromMimeType = fileTypeFromMimeType;
function assert(condition, msg) {
    if (!condition) {
        const error = new Error(msg !== null && msg !== void 0 ? msg : 'Invalid assertion');
        if (Error.hasOwnProperty('captureStackTrace')) {
            Error.captureStackTrace(error, assert);
        }
        else if (error.stack) {
            error.stack = error.stack
                .split('\n')
                .slice(1)
                .join('\n');
        }
        throw error;
    }
}
exports.assert = assert;
//# sourceMappingURL=utils.js.map