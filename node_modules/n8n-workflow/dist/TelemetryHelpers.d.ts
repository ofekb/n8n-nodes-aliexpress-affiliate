import type { INode, INodesGraphResult, IWorkflowBase, INodeTypes } from './Interfaces';
export declare function getNodeTypeForName(workflow: IWorkflowBase, nodeName: string): INode | undefined;
export declare function isNumber(value: unknown): value is number;
export declare function getDomainBase(raw: string, urlParts?: RegExp): string;
export declare const ANONYMIZATION_CHARACTER = "*";
export declare function getDomainPath(raw: string, urlParts?: RegExp): string;
export declare function generateNodesGraph(workflow: IWorkflowBase, nodeTypes: INodeTypes, options?: {
    sourceInstanceId?: string;
    nodeIdMap?: {
        [curr: string]: string;
    };
}): INodesGraphResult;
