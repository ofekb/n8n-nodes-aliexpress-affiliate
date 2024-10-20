import type { Primitives } from './utils';
export interface ReportingOptions {
    level?: 'warning' | 'error' | 'fatal';
    tags?: Record<string, Primitives>;
    extra?: Record<string, unknown>;
}
interface ErrorReporter {
    report: (error: Error | string, options?: ReportingOptions) => void;
}
export declare function init(errorReporter: ErrorReporter): void;
export declare const error: (e: unknown, options?: ReportingOptions) => void;
export declare const warn: (warning: Error | string, options?: ReportingOptions) => void;
export {};
