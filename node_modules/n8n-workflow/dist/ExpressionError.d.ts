import { ExecutionBaseError } from './NodeErrors';
export declare class ExpressionError extends ExecutionBaseError {
    clientOnly: boolean;
    constructor(message: string, options?: {
        cause?: Error;
        causeDetailed?: string;
        description?: string;
        descriptionTemplate?: string;
        failExecution?: boolean;
        clientOnly?: boolean;
        functionality?: 'pairedItem';
        itemIndex?: number;
        messageTemplate?: string;
        nodeCause?: string;
        parameter?: string;
        runIndex?: number;
        type?: string;
    });
}
export declare class ExpressionExtensionError extends ExpressionError {
    constructor(message: string);
}
