"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Expression = void 0;
const tmpl = __importStar(require("@n8n_io/riot-tmpl"));
const luxon_1 = require("luxon");
const ExpressionError_1 = require("./ExpressionError");
const WorkflowDataProxy_1 = require("./WorkflowDataProxy");
const Extensions_1 = require("./Extensions");
const ExtendedFunctions_1 = require("./Extensions/ExtendedFunctions");
const ExpressionExtension_1 = require("./Extensions/ExpressionExtension");
tmpl.brackets.set('{{ }}');
tmpl.tmpl.errorHandler = (error) => {
    if (error instanceof ExpressionError_1.ExpressionError) {
        if (error.context.failExecution) {
            throw error;
        }
        if (typeof process === 'undefined' && error.clientOnly) {
            throw error;
        }
    }
};
class Expression {
    constructor(workflow) {
        this.workflow = workflow;
    }
    static resolveWithoutWorkflow(expression) {
        return tmpl.tmpl(expression, {});
    }
    convertObjectValueToString(value) {
        var _a, _b;
        const typeName = Array.isArray(value) ? 'Array' : 'Object';
        if (value instanceof luxon_1.DateTime && value.invalidReason !== null) {
            throw new Error('invalid DateTime');
        }
        let result = '';
        if (value instanceof Date) {
            result = luxon_1.DateTime.fromJSDate(value, {
                zone: (_b = (_a = this.workflow.settings) === null || _a === void 0 ? void 0 : _a.timezone) !== null && _b !== void 0 ? _b : 'default',
            }).toISO();
        }
        else {
            result = JSON.stringify(value);
        }
        result = result
            .replace(/,"/g, ', "')
            .replace(/":/g, '": ');
        return `[${typeName}: ${result}]`;
    }
    resolveSimpleParameterValue(parameterValue, siblingParameters, runExecutionData, runIndex, itemIndex, activeNodeName, connectionInputData, mode, timezone, additionalKeys, executeData, returnObjectAsString = false, selfData = {}) {
        if (typeof parameterValue !== 'string' || parameterValue.charAt(0) !== '=') {
            return parameterValue;
        }
        parameterValue = parameterValue.substr(1);
        const dataProxy = new WorkflowDataProxy_1.WorkflowDataProxy(this.workflow, runExecutionData, runIndex, itemIndex, activeNodeName, connectionInputData, siblingParameters, mode, timezone, additionalKeys, executeData, -1, selfData);
        const data = dataProxy.getDataProxy();
        data.process =
            typeof process !== 'undefined'
                ? {
                    arch: process.arch,
                    env: process.env.N8N_BLOCK_ENV_ACCESS_IN_NODE === 'true' ? {} : process.env,
                    platform: process.platform,
                    pid: process.pid,
                    ppid: process.ppid,
                    release: process.release,
                    version: process.pid,
                    versions: process.versions,
                }
                : {};
        data.document = {};
        data.global = {};
        data.window = {};
        data.Window = {};
        data.this = {};
        data.globalThis = {};
        data.self = {};
        data.alert = {};
        data.prompt = {};
        data.confirm = {};
        data.eval = {};
        data.uneval = {};
        data.setTimeout = {};
        data.setInterval = {};
        data.Function = {};
        data.fetch = {};
        data.XMLHttpRequest = {};
        data.Promise = {};
        data.Generator = {};
        data.GeneratorFunction = {};
        data.AsyncFunction = {};
        data.AsyncGenerator = {};
        data.AsyncGeneratorFunction = {};
        data.WebAssembly = {};
        data.Reflect = {};
        data.Proxy = {};
        data.constructor = {};
        data.escape = {};
        data.unescape = {};
        data.Date = Date;
        data.DateTime = luxon_1.DateTime;
        data.Interval = luxon_1.Interval;
        data.Duration = luxon_1.Duration;
        data.Object = Object;
        data.Array = Array;
        data.Int8Array = Int8Array;
        data.Uint8Array = Uint8Array;
        data.Uint8ClampedArray = Uint8ClampedArray;
        data.Int16Array = Int16Array;
        data.Uint16Array = Uint16Array;
        data.Int32Array = Int32Array;
        data.Uint32Array = Uint32Array;
        data.Float32Array = Float32Array;
        data.Float64Array = Float64Array;
        data.BigInt64Array = typeof BigInt64Array !== 'undefined' ? BigInt64Array : {};
        data.BigUint64Array = typeof BigUint64Array !== 'undefined' ? BigUint64Array : {};
        data.Map = typeof Map !== 'undefined' ? Map : {};
        data.WeakMap = typeof WeakMap !== 'undefined' ? WeakMap : {};
        data.Set = typeof Set !== 'undefined' ? Set : {};
        data.WeakSet = typeof WeakSet !== 'undefined' ? WeakSet : {};
        data.Error = Error;
        data.TypeError = TypeError;
        data.SyntaxError = SyntaxError;
        data.EvalError = EvalError;
        data.RangeError = RangeError;
        data.ReferenceError = ReferenceError;
        data.URIError = URIError;
        data.Intl = typeof Intl !== 'undefined' ? Intl : {};
        data.String = String;
        data.RegExp = RegExp;
        data.Math = Math;
        data.Number = Number;
        data.BigInt = typeof BigInt !== 'undefined' ? BigInt : {};
        data.Infinity = Infinity;
        data.NaN = NaN;
        data.isFinite = Number.isFinite;
        data.isNaN = Number.isNaN;
        data.parseFloat = parseFloat;
        data.parseInt = parseInt;
        data.JSON = JSON;
        data.ArrayBuffer = typeof ArrayBuffer !== 'undefined' ? ArrayBuffer : {};
        data.SharedArrayBuffer = typeof SharedArrayBuffer !== 'undefined' ? SharedArrayBuffer : {};
        data.Atomics = typeof Atomics !== 'undefined' ? Atomics : {};
        data.DataView = typeof DataView !== 'undefined' ? DataView : {};
        data.encodeURI = encodeURI;
        data.encodeURIComponent = encodeURIComponent;
        data.decodeURI = decodeURI;
        data.decodeURIComponent = decodeURIComponent;
        data.Boolean = Boolean;
        data.Symbol = Symbol;
        data.extend = Extensions_1.extend;
        data.extendOptional = Extensions_1.extendOptional;
        Object.assign(data, ExtendedFunctions_1.extendedFunctions);
        const constructorValidation = new RegExp(/\.\s*constructor/gm);
        if (parameterValue.match(constructorValidation)) {
            throw new ExpressionError_1.ExpressionError('Expression contains invalid constructor function call', {
                causeDetailed: 'Constructor override attempt is not allowed due to security concerns',
                runIndex,
                itemIndex,
            });
        }
        const extendedExpression = (0, ExpressionExtension_1.extendSyntax)(parameterValue);
        const returnValue = this.renderExpression(extendedExpression, data);
        if (typeof returnValue === 'function') {
            if (returnValue.name === '$')
                throw new Error('invalid syntax');
            if (returnValue.name === 'DateTime')
                throw new Error('this is a DateTime, please access its methods');
            throw new Error('this is a function, please add ()');
        }
        else if (typeof returnValue === 'string') {
            return returnValue;
        }
        else if (returnValue !== null && typeof returnValue === 'object') {
            if (returnObjectAsString) {
                return this.convertObjectValueToString(returnValue);
            }
        }
        return returnValue;
    }
    renderExpression(expression, data) {
        var _a;
        try {
            return tmpl.tmpl(expression, data);
        }
        catch (error) {
            if (error instanceof ExpressionError_1.ExpressionError) {
                if (error.context.failExecution) {
                    throw error;
                }
                if (typeof process === 'undefined' && error.clientOnly) {
                    throw error;
                }
            }
            if (typeof process === 'undefined' &&
                error instanceof Error &&
                error.name === 'SyntaxError') {
                throw new Error('invalid syntax');
            }
            if (typeof process === 'undefined' &&
                error instanceof Error &&
                error.name === 'TypeError' &&
                error.message.endsWith('is not a function')) {
                const match = error.message.match(/(?<msg>[^.]+is not a function)/);
                if (!((_a = match === null || match === void 0 ? void 0 : match.groups) === null || _a === void 0 ? void 0 : _a.msg))
                    return null;
                throw new Error(match.groups.msg);
            }
        }
        return null;
    }
    getSimpleParameterValue(node, parameterValue, mode, timezone, additionalKeys, executeData, defaultValue) {
        if (parameterValue === undefined) {
            return defaultValue;
        }
        const runIndex = 0;
        const itemIndex = 0;
        const connectionInputData = [];
        const runData = {
            resultData: {
                runData: {},
            },
        };
        return this.getParameterValue(parameterValue, runData, runIndex, itemIndex, node.name, connectionInputData, mode, timezone, additionalKeys, executeData);
    }
    getComplexParameterValue(node, parameterValue, mode, timezone, additionalKeys, executeData, defaultValue = undefined, selfData = {}) {
        if (parameterValue === undefined) {
            return defaultValue;
        }
        const runIndex = 0;
        const itemIndex = 0;
        const connectionInputData = [];
        const runData = {
            resultData: {
                runData: {},
            },
        };
        const returnData = this.getParameterValue(parameterValue, runData, runIndex, itemIndex, node.name, connectionInputData, mode, timezone, additionalKeys, executeData, false, selfData);
        return this.getParameterValue(returnData, runData, runIndex, itemIndex, node.name, connectionInputData, mode, timezone, additionalKeys, executeData, false, selfData);
    }
    getParameterValue(parameterValue, runExecutionData, runIndex, itemIndex, activeNodeName, connectionInputData, mode, timezone, additionalKeys, executeData, returnObjectAsString = false, selfData = {}) {
        const isComplexParameter = (value) => {
            return typeof value === 'object';
        };
        const resolveParameterValue = (value, siblingParameters) => {
            if (isComplexParameter(value)) {
                return this.getParameterValue(value, runExecutionData, runIndex, itemIndex, activeNodeName, connectionInputData, mode, timezone, additionalKeys, executeData, returnObjectAsString, selfData);
            }
            return this.resolveSimpleParameterValue(value, siblingParameters, runExecutionData, runIndex, itemIndex, activeNodeName, connectionInputData, mode, timezone, additionalKeys, executeData, returnObjectAsString, selfData);
        };
        if (!isComplexParameter(parameterValue)) {
            return this.resolveSimpleParameterValue(parameterValue, {}, runExecutionData, runIndex, itemIndex, activeNodeName, connectionInputData, mode, timezone, additionalKeys, executeData, returnObjectAsString, selfData);
        }
        if (Array.isArray(parameterValue)) {
            const returnData = parameterValue.map((item) => resolveParameterValue(item, {}));
            return returnData;
        }
        if (parameterValue === null || parameterValue === undefined) {
            return parameterValue;
        }
        if (typeof parameterValue !== 'object') {
            return {};
        }
        const returnData = {};
        for (const [key, value] of Object.entries(parameterValue)) {
            returnData[key] = resolveParameterValue(value, parameterValue);
        }
        if (returnObjectAsString && typeof returnData === 'object') {
            return this.convertObjectValueToString(returnData);
        }
        return returnData;
    }
}
exports.Expression = Expression;
//# sourceMappingURL=Expression.js.map