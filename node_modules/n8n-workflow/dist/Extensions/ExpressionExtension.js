"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extendSyntax = exports.extendOptional = exports.extend = exports.extendTransform = exports.hasNativeMethod = exports.hasExpressionExtension = exports.EXTENSION_OBJECTS = void 0;
const luxon_1 = require("luxon");
const ExpressionError_1 = require("../ExpressionError");
const recast_1 = require("recast");
const util_1 = require("recast/lib/util");
const esprima_next_1 = require("esprima-next");
const ArrayExtensions_1 = require("./ArrayExtensions");
const DateExtensions_1 = require("./DateExtensions");
const NumberExtensions_1 = require("./NumberExtensions");
const StringExtensions_1 = require("./StringExtensions");
const ObjectExtensions_1 = require("./ObjectExtensions");
const ExpressionParser_1 = require("./ExpressionParser");
const EXPRESSION_EXTENDER = 'extend';
const EXPRESSION_EXTENDER_OPTIONAL = 'extendOptional';
function isEmpty(value) {
    return value === null || value === undefined || !value;
}
function isNotEmpty(value) {
    return !isEmpty(value);
}
exports.EXTENSION_OBJECTS = [
    ArrayExtensions_1.arrayExtensions,
    DateExtensions_1.dateExtensions,
    NumberExtensions_1.numberExtensions,
    ObjectExtensions_1.objectExtensions,
    StringExtensions_1.stringExtensions,
];
const genericExtensions = {
    isEmpty,
    isNotEmpty,
};
const EXPRESSION_EXTENSION_METHODS = Array.from(new Set([
    ...Object.keys(StringExtensions_1.stringExtensions.functions),
    ...Object.keys(NumberExtensions_1.numberExtensions.functions),
    ...Object.keys(DateExtensions_1.dateExtensions.functions),
    ...Object.keys(ArrayExtensions_1.arrayExtensions.functions),
    ...Object.keys(ObjectExtensions_1.objectExtensions.functions),
    ...Object.keys(genericExtensions),
]));
const EXPRESSION_EXTENSION_REGEX = new RegExp(`(\\$if|\\.(${EXPRESSION_EXTENSION_METHODS.join('|')})\\s*(\\?\\.)?)\\s*\\(`);
const isExpressionExtension = (str) => EXPRESSION_EXTENSION_METHODS.some((m) => m === str);
const hasExpressionExtension = (str) => EXPRESSION_EXTENSION_REGEX.test(str);
exports.hasExpressionExtension = hasExpressionExtension;
const hasNativeMethod = (method) => {
    if ((0, exports.hasExpressionExtension)(method)) {
        return false;
    }
    const methods = method
        .replace(/[^\w\s]/gi, ' ')
        .split(' ')
        .filter(Boolean);
    return methods.every((methodName) => {
        return [String.prototype, Array.prototype, Number.prototype, Date.prototype].some((nativeType) => {
            if (methodName in nativeType) {
                return true;
            }
            return false;
        });
    });
};
exports.hasNativeMethod = hasNativeMethod;
function parseWithEsprimaNext(source, options) {
    const ast = (0, esprima_next_1.parse)(source, {
        loc: true,
        locations: true,
        comment: true,
        range: (0, util_1.getOption)(options, 'range', false),
        tolerant: (0, util_1.getOption)(options, 'tolerant', true),
        tokens: true,
        jsx: (0, util_1.getOption)(options, 'jsx', false),
        sourceType: (0, util_1.getOption)(options, 'sourceType', 'module'),
    });
    return ast;
}
const extendTransform = (expression) => {
    try {
        const ast = (0, recast_1.parse)(expression, { parser: { parse: parseWithEsprimaNext } });
        let currentChain = 1;
        (0, recast_1.visit)(ast, {
            visitChainExpression(path) {
                this.traverse(path);
                const chainNumber = currentChain;
                currentChain += 1;
                const globalIdentifier = recast_1.types.builders.identifier(typeof window !== 'object' ? 'global' : 'window');
                const undefinedIdentifier = recast_1.types.builders.identifier('undefined');
                const cancelIdentifier = recast_1.types.builders.identifier(`chainCancelToken${chainNumber}`);
                const valueIdentifier = recast_1.types.builders.identifier(`chainValue${chainNumber}`);
                const cancelMemberExpression = recast_1.types.builders.memberExpression(globalIdentifier, cancelIdentifier);
                const valueMemberExpression = recast_1.types.builders.memberExpression(globalIdentifier, valueIdentifier);
                const patchedStack = [];
                const buildCancelCheckWrapper = (node) => {
                    return recast_1.types.builders.conditionalExpression(recast_1.types.builders.binaryExpression('===', cancelMemberExpression, recast_1.types.builders.booleanLiteral(true)), undefinedIdentifier, node);
                };
                const buildValueAssignWrapper = (node) => {
                    return recast_1.types.builders.assignmentExpression('=', valueMemberExpression, node);
                };
                const buildOptionalWrapper = (node) => {
                    return recast_1.types.builders.binaryExpression('===', recast_1.types.builders.logicalExpression('??', buildValueAssignWrapper(node), undefinedIdentifier), undefinedIdentifier);
                };
                const buildCancelAssignWrapper = (node) => {
                    return recast_1.types.builders.assignmentExpression('=', cancelMemberExpression, node);
                };
                let currentNode = path.node.expression;
                let currentPatch = null;
                let patchTop = null;
                let wrapNextTopInOptionalExtend = false;
                const updatePatch = (toPatch, node) => {
                    if (toPatch.type === 'MemberExpression' || toPatch.type === 'OptionalMemberExpression') {
                        toPatch.object = node;
                    }
                    else if (toPatch.type === 'CallExpression' ||
                        toPatch.type === 'OptionalCallExpression') {
                        toPatch.callee = node;
                    }
                };
                while (true) {
                    if (currentNode.type === 'MemberExpression' ||
                        currentNode.type === 'OptionalMemberExpression' ||
                        currentNode.type === 'CallExpression' ||
                        currentNode.type === 'OptionalCallExpression') {
                        let patchNode;
                        if (currentNode.type === 'MemberExpression' ||
                            currentNode.type === 'OptionalMemberExpression') {
                            patchNode = recast_1.types.builders.memberExpression(valueMemberExpression, currentNode.property);
                        }
                        else {
                            patchNode = recast_1.types.builders.callExpression(valueMemberExpression, currentNode.arguments);
                        }
                        if (currentPatch) {
                            updatePatch(currentPatch, patchNode);
                        }
                        if (!patchTop) {
                            patchTop = patchNode;
                        }
                        currentPatch = patchNode;
                        if (currentNode.optional) {
                            if (wrapNextTopInOptionalExtend) {
                                wrapNextTopInOptionalExtend = false;
                                if (patchTop.type === 'MemberExpression' &&
                                    patchTop.property.type === 'Identifier') {
                                    patchTop = recast_1.types.builders.callExpression(recast_1.types.builders.identifier(EXPRESSION_EXTENDER_OPTIONAL), [patchTop.object, recast_1.types.builders.stringLiteral(patchTop.property.name)]);
                                }
                            }
                            patchedStack.push(patchTop);
                            patchTop = null;
                            currentPatch = null;
                            if ((currentNode.type === 'CallExpression' ||
                                currentNode.type === 'OptionalCallExpression') &&
                                (currentNode.callee.type === 'MemberExpression' ||
                                    currentNode.callee.type === 'OptionalMemberExpression') &&
                                currentNode.callee.property.type === 'Identifier' &&
                                isExpressionExtension(currentNode.callee.property.name)) {
                                wrapNextTopInOptionalExtend = true;
                            }
                        }
                        if (currentNode.type === 'MemberExpression' ||
                            currentNode.type === 'OptionalMemberExpression') {
                            currentNode = currentNode.object;
                        }
                        else {
                            currentNode = currentNode.callee;
                        }
                    }
                    else {
                        if (currentPatch) {
                            updatePatch(currentPatch, currentNode);
                            if (!patchTop) {
                                patchTop = currentPatch;
                            }
                        }
                        if (wrapNextTopInOptionalExtend) {
                            wrapNextTopInOptionalExtend = false;
                            if ((patchTop === null || patchTop === void 0 ? void 0 : patchTop.type) === 'MemberExpression' &&
                                patchTop.property.type === 'Identifier') {
                                patchTop = recast_1.types.builders.callExpression(recast_1.types.builders.identifier(EXPRESSION_EXTENDER_OPTIONAL), [patchTop.object, recast_1.types.builders.stringLiteral(patchTop.property.name)]);
                            }
                        }
                        if (patchTop) {
                            patchedStack.push(patchTop);
                        }
                        else {
                            patchedStack.push(currentNode);
                        }
                        break;
                    }
                }
                patchedStack.reverse();
                for (let i = 0; i < patchedStack.length; i++) {
                    let node = patchedStack[i];
                    if (i !== patchedStack.length - 1) {
                        node = buildCancelAssignWrapper(buildOptionalWrapper(node));
                    }
                    if (i !== 0) {
                        node = buildCancelCheckWrapper(node);
                    }
                    patchedStack[i] = node;
                }
                const sequenceNode = recast_1.types.builders.sequenceExpression(patchedStack);
                path.replace(sequenceNode);
            },
        });
        (0, recast_1.visit)(ast, {
            visitCallExpression(path) {
                this.traverse(path);
                if (path.node.callee.type === 'MemberExpression' &&
                    path.node.callee.property.type === 'Identifier' &&
                    isExpressionExtension(path.node.callee.property.name)) {
                    path.replace(recast_1.types.builders.callExpression(recast_1.types.builders.identifier(EXPRESSION_EXTENDER), [
                        path.node.callee.object,
                        recast_1.types.builders.stringLiteral(path.node.callee.property.name),
                        recast_1.types.builders.arrayExpression(path.node.arguments),
                    ]));
                }
                else if (path.node.callee.type === 'Identifier' &&
                    path.node.callee.name === '$if' &&
                    path.node.arguments.every((v) => v.type !== 'SpreadElement')) {
                    if (path.node.arguments.length < 2) {
                        throw new ExpressionError_1.ExpressionExtensionError('$if requires at least 2 parameters: test, value_if_true[, and value_if_false]');
                    }
                    const test = path.node.arguments[0];
                    const consequent = path.node.arguments[1];
                    const alternative = path.node.arguments[2] === undefined
                        ? recast_1.types.builders.booleanLiteral(false)
                        : path.node.arguments[2];
                    path.replace(recast_1.types.builders.conditionalExpression(test, consequent, alternative));
                }
            },
        });
        return (0, recast_1.print)(ast);
    }
    catch (e) {
        return;
    }
};
exports.extendTransform = extendTransform;
function isDate(input) {
    if (typeof input !== 'string' || !input.length) {
        return false;
    }
    if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(input)) {
        return false;
    }
    const d = new Date(input);
    return d instanceof Date && !isNaN(d.valueOf()) && d.toISOString() === input;
}
function findExtendedFunction(input, functionName) {
    let foundFunction;
    if (Array.isArray(input)) {
        foundFunction = ArrayExtensions_1.arrayExtensions.functions[functionName];
    }
    else if (isDate(input) && functionName !== 'toDate') {
        input = new Date(input);
        foundFunction = DateExtensions_1.dateExtensions.functions[functionName];
    }
    else if (typeof input === 'string') {
        foundFunction = StringExtensions_1.stringExtensions.functions[functionName];
    }
    else if (typeof input === 'number') {
        foundFunction = NumberExtensions_1.numberExtensions.functions[functionName];
    }
    else if (input && (luxon_1.DateTime.isDateTime(input) || input instanceof Date)) {
        foundFunction = DateExtensions_1.dateExtensions.functions[functionName];
    }
    else if (input !== null && typeof input === 'object') {
        foundFunction = ObjectExtensions_1.objectExtensions.functions[functionName];
    }
    if (!foundFunction) {
        const inputAny = input;
        if (inputAny &&
            functionName &&
            typeof inputAny[functionName] === 'function') {
            return { type: 'native', function: inputAny[functionName] };
        }
        foundFunction = genericExtensions[functionName];
    }
    if (!foundFunction) {
        return undefined;
    }
    return { type: 'extended', function: foundFunction };
}
function extend(input, functionName, args) {
    const foundFunction = findExtendedFunction(input, functionName);
    if (!foundFunction) {
        const haveFunction = exports.EXTENSION_OBJECTS.filter((v) => functionName in v.functions);
        if (!haveFunction.length) {
            throw new ExpressionError_1.ExpressionExtensionError(`Unknown expression function: ${functionName}`);
        }
        if (haveFunction.length > 1) {
            const lastType = `"${haveFunction.pop().typeName}"`;
            const typeNames = `${haveFunction.map((v) => `"${v.typeName}"`).join(', ')}, and ${lastType}`;
            throw new ExpressionError_1.ExpressionExtensionError(`${functionName}() is only callable on types ${typeNames}`);
        }
        else {
            throw new ExpressionError_1.ExpressionExtensionError(`${functionName}() is only callable on type "${haveFunction[0].typeName}"`);
        }
    }
    if (foundFunction.type === 'native') {
        return foundFunction.function.apply(input, args);
    }
    return foundFunction.function(input, args);
}
exports.extend = extend;
function extendOptional(input, functionName) {
    const foundFunction = findExtendedFunction(input, functionName);
    if (!foundFunction) {
        return undefined;
    }
    if (foundFunction.type === 'native') {
        return foundFunction.function.bind(input);
    }
    return (...args) => {
        return foundFunction.function(input, args);
    };
}
exports.extendOptional = extendOptional;
const EXTENDED_SYNTAX_CACHE = {};
function extendSyntax(bracketedExpression, forceExtend = false) {
    const chunks = (0, ExpressionParser_1.splitExpression)(bracketedExpression);
    const codeChunks = chunks
        .filter((c) => c.type === 'code')
        .map((c) => c.text.replace(/("|').*?("|')/, '').trim());
    if ((!codeChunks.some(exports.hasExpressionExtension) || (0, exports.hasNativeMethod)(bracketedExpression)) &&
        !forceExtend) {
        return bracketedExpression;
    }
    if (bracketedExpression in EXTENDED_SYNTAX_CACHE) {
        return EXTENDED_SYNTAX_CACHE[bracketedExpression];
    }
    const extendedChunks = chunks.map((chunk) => {
        if (chunk.type === 'code') {
            let output = (0, exports.extendTransform)(chunk.text);
            if (!(output === null || output === void 0 ? void 0 : output.code) && chunk.text.trim()[0] === '{') {
                output = (0, exports.extendTransform)(`(${chunk.text})`);
            }
            if (!(output === null || output === void 0 ? void 0 : output.code)) {
                throw new ExpressionError_1.ExpressionExtensionError('invalid syntax');
            }
            let text = output.code;
            if (text.trim().endsWith(';')) {
                text = text.trim().slice(0, -1);
            }
            return {
                ...chunk,
                text,
            };
        }
        return chunk;
    });
    const expression = (0, ExpressionParser_1.joinExpression)(extendedChunks);
    EXTENDED_SYNTAX_CACHE[bracketedExpression] = expression;
    return expression;
}
exports.extendSyntax = extendSyntax;
//# sourceMappingURL=ExpressionExtension.js.map