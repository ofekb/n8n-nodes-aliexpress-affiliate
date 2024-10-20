import type { IDataObject, IObservableObject } from './Interfaces';
interface IObservableOptions {
    ignoreEmptyOnFirstChild?: boolean;
}
export declare function create(target: IDataObject, parent?: IObservableObject, option?: IObservableOptions, depth?: number): IDataObject;
export {};
