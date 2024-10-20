import type { BinaryFileType } from './Interfaces';
export type Primitives = string | number | boolean | bigint | symbol | null | undefined;
export declare const deepCopy: <T extends Primitives | ((object | Date) & {
    toJSON?: (() => string) | undefined;
})>(source: T, hash?: WeakMap<object, any>, path?: string) => T;
type MutuallyExclusive<T, U> = (T & {
    [k in Exclude<keyof U, keyof T>]?: never;
}) | (U & {
    [k in Exclude<keyof T, keyof U>]?: never;
});
type JSONParseOptions<T> = MutuallyExclusive<{
    errorMessage: string;
}, {
    fallbackValue: T;
}>;
export declare const jsonParse: <T>(jsonString: string, options?: JSONParseOptions<T> | undefined) => T;
type JSONStringifyOptions = {
    replaceCircularRefs?: boolean;
};
export declare const jsonStringify: (obj: unknown, options?: JSONStringifyOptions) => string;
export declare const sleep: (ms: number) => Promise<void>;
export declare function fileTypeFromMimeType(mimeType: string): BinaryFileType | undefined;
export declare function assert<T>(condition: T, msg?: string): asserts condition;
export {};
