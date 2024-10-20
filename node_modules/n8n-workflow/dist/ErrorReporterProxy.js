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
exports.warn = exports.error = exports.init = void 0;
const Logger = __importStar(require("./LoggerProxy"));
const instance = {
    report: (error) => {
        if (error instanceof Error) {
            let e = error;
            do {
                Logger.error(`${e.constructor.name}: ${e.message}`);
                e = e.cause;
            } while (e);
        }
    },
};
function init(errorReporter) {
    instance.report = errorReporter.report;
}
exports.init = init;
const wrap = (e) => {
    if (e instanceof Error)
        return e;
    if (typeof e === 'string')
        return new Error(e);
    return;
};
const error = (e, options) => {
    const toReport = wrap(e);
    if (toReport)
        instance.report(toReport, options);
};
exports.error = error;
const warn = (warning, options) => (0, exports.error)(warning, { level: 'warning', ...options });
exports.warn = warn;
//# sourceMappingURL=ErrorReporterProxy.js.map