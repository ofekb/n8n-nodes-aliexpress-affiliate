"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpressionExtensionError = exports.ExpressionError = void 0;
const NodeErrors_1 = require("./NodeErrors");
class ExpressionError extends NodeErrors_1.ExecutionBaseError {
    constructor(message, options) {
        super(message, { cause: options === null || options === void 0 ? void 0 : options.cause });
        this.clientOnly = false;
        if ((options === null || options === void 0 ? void 0 : options.description) !== undefined) {
            this.description = options.description;
        }
        if (options === null || options === void 0 ? void 0 : options.clientOnly) {
            this.clientOnly = options.clientOnly;
        }
        this.context.failExecution = !!(options === null || options === void 0 ? void 0 : options.failExecution);
        const allowedKeys = [
            'causeDetailed',
            'descriptionTemplate',
            'functionality',
            'itemIndex',
            'messageTemplate',
            'nodeCause',
            'parameter',
            'runIndex',
            'type',
        ];
        if (options !== undefined) {
            Object.keys(options).forEach((key) => {
                if (allowedKeys.includes(key)) {
                    this.context[key] = options[key];
                }
            });
        }
    }
}
exports.ExpressionError = ExpressionError;
class ExpressionExtensionError extends ExpressionError {
    constructor(message) {
        super(message);
        this.context.failExecution = true;
    }
}
exports.ExpressionExtensionError = ExpressionExtensionError;
//# sourceMappingURL=ExpressionError.js.map