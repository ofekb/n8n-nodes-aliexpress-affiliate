export declare const extendedFunctions: {
    min: (...values: number[]) => number;
    max: (...values: number[]) => number;
    not: (value: unknown) => boolean;
    average: (...args: number[]) => number;
    numberList: (start: number, end: number) => number[];
    zip: (keys: unknown[], values: unknown[]) => unknown;
    $min: (...values: number[]) => number;
    $max: (...values: number[]) => number;
    $average: (...args: number[]) => number;
    $not: (value: unknown) => boolean;
};
