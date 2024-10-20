"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CliWorkflowOperationError = exports.SubworkflowOperationError = exports.WorkflowOperationError = void 0;
class WorkflowOperationError extends Error {
    constructor(message, node) {
        super(message);
        this.name = this.constructor.name;
        this.node = node;
        this.timestamp = Date.now();
    }
}
exports.WorkflowOperationError = WorkflowOperationError;
class SubworkflowOperationError extends WorkflowOperationError {
    constructor(message, description) {
        super(message);
        this.description = '';
        this.name = this.constructor.name;
        this.description = description;
        this.cause = {
            message,
            stack: this.stack,
        };
    }
}
exports.SubworkflowOperationError = SubworkflowOperationError;
class CliWorkflowOperationError extends SubworkflowOperationError {
}
exports.CliWorkflowOperationError = CliWorkflowOperationError;
//# sourceMappingURL=WorkflowErrors.js.map