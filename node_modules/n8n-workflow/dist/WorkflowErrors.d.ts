import type { INode } from './Interfaces';
export declare class WorkflowOperationError extends Error {
    node: INode | undefined;
    timestamp: number;
    lineNumber: number | undefined;
    description: string | undefined;
    constructor(message: string, node?: INode);
}
export declare class SubworkflowOperationError extends WorkflowOperationError {
    description: string;
    cause: {
        message: string;
        stack: string;
    };
    constructor(message: string, description: string);
}
export declare class CliWorkflowOperationError extends SubworkflowOperationError {
}
