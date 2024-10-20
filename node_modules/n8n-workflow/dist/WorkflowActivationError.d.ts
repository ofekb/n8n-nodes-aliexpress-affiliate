import type { INode } from './Interfaces';
import { ExecutionBaseError } from './NodeErrors';
interface WorkflowActivationErrorOptions {
    cause?: Error;
    node?: INode;
}
export declare class WorkflowActivationError extends ExecutionBaseError {
    node: INode | undefined;
    constructor(message: string, { cause, node }: WorkflowActivationErrorOptions);
}
export {};
