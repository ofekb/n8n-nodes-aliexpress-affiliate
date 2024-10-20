import type { INodeTypeBaseDescription, IVersionedNodeType, INodeType } from './Interfaces';
export declare class VersionedNodeType implements IVersionedNodeType {
    currentVersion: number;
    nodeVersions: IVersionedNodeType['nodeVersions'];
    description: INodeTypeBaseDescription;
    constructor(nodeVersions: IVersionedNodeType['nodeVersions'], description: INodeTypeBaseDescription);
    getLatestVersion(): number;
    getNodeType(version?: number): INodeType;
}
