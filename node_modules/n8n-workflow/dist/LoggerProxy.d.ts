import type { ILogger, LogTypes } from './Interfaces';
export declare function init<L extends ILogger>(loggerInstance: L): L;
export declare function getInstance(): ILogger;
export declare function log(type: LogTypes, message: string, meta?: object): void;
export declare function debug(message: string, meta?: object): void;
export declare function info(message: string, meta?: object): void;
export declare function error(message: string, meta?: object): void;
export declare function verbose(message: string, meta?: object): void;
export declare function warn(message: string, meta?: object): void;
