import type { IDataObject, INode, JsonObject } from './Interfaces';
interface ExecutionBaseErrorOptions {
    cause?: Error | JsonObject;
}
export declare abstract class ExecutionBaseError extends Error {
    description: string | null | undefined;
    cause: Error | JsonObject | undefined;
    timestamp: number;
    context: IDataObject;
    lineNumber: number | undefined;
    constructor(message: string, { cause }: ExecutionBaseErrorOptions);
    toJSON?(): any;
}
declare abstract class NodeError extends ExecutionBaseError {
    node: INode;
    constructor(node: INode, error: Error | JsonObject);
    protected findProperty(jsonError: JsonObject, potentialKeys: string[], traversalKeys?: string[]): string | null;
    protected isTraversableObject(value: any): value is JsonObject;
    protected removeCircularRefs(obj: JsonObject, seen?: Set<unknown>): void;
}
interface NodeOperationErrorOptions {
    message?: string;
    description?: string;
    runIndex?: number;
    itemIndex?: number;
}
export declare class NodeOperationError extends NodeError {
    lineNumber: number | undefined;
    constructor(node: INode, error: Error | string, options?: NodeOperationErrorOptions);
}
interface NodeApiErrorOptions extends NodeOperationErrorOptions {
    message?: string;
    httpCode?: string;
    parseXml?: boolean;
}
export declare class NodeApiError extends NodeError {
    httpCode: string | null;
    constructor(node: INode, error: JsonObject, { message, description, httpCode, parseXml, runIndex, itemIndex }?: NodeApiErrorOptions);
    private setDescriptionFromXml;
    private setMessage;
}
export {};
