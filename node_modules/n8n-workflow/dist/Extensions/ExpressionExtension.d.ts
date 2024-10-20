export declare const EXTENSION_OBJECTS: import("./Extensions").ExtensionMap[];
export declare const hasExpressionExtension: (str: string) => boolean;
export declare const hasNativeMethod: (method: string) => boolean;
export declare const extendTransform: (expression: string) => {
    code: string;
} | undefined;
export declare function extend(input: unknown, functionName: string, args: unknown[]): any;
export declare function extendOptional(input: unknown, functionName: string): Function | undefined;
export declare function extendSyntax(bracketedExpression: string, forceExtend?: boolean): string;
