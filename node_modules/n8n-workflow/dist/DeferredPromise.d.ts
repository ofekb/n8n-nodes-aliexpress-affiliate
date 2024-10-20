export interface IDeferredPromise<T> {
    promise: () => Promise<T>;
    reject: (error: Error) => void;
    resolve: (result: T) => void;
}
export declare function createDeferredPromise<T = void>(): Promise<IDeferredPromise<T>>;
