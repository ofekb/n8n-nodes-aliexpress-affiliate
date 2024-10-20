"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowActivationError = void 0;
const NodeErrors_1 = require("./NodeErrors");
class WorkflowActivationError extends NodeErrors_1.ExecutionBaseError {
    constructor(message, { cause, node }) {
        let error = cause;
        if (cause instanceof NodeErrors_1.ExecutionBaseError) {
            error = new Error(cause.message);
            error.constructor = cause.constructor;
            error.name = cause.name;
            error.stack = cause.stack;
        }
        super(message, { cause: error });
        this.node = node;
        this.message = message;
    }
}
exports.WorkflowActivationError = WorkflowActivationError;
//# sourceMappingURL=WorkflowActivationError.js.map