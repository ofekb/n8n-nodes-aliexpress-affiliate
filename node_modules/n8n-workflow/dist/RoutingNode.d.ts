import type { ICredentialsDecrypted, IN8nHttpFullResponse, INode, INodeExecuteFunctions, INodeExecutionData, INodePropertyOptions, INodeType, DeclarativeRestApiSettings, IRunExecutionData, ITaskDataConnections, IWorkflowDataProxyAdditionalKeys, IWorkflowExecuteAdditionalData, WorkflowExecuteMode, IDataObject, IExecuteData, IExecuteSingleFunctions, IN8nRequestOperations, INodeProperties, NodeParameterValueType, PostReceiveAction } from './Interfaces';
import type { Workflow } from './Workflow';
export declare class RoutingNode {
    additionalData: IWorkflowExecuteAdditionalData;
    connectionInputData: INodeExecutionData[];
    node: INode;
    mode: WorkflowExecuteMode;
    runExecutionData: IRunExecutionData;
    workflow: Workflow;
    constructor(workflow: Workflow, node: INode, connectionInputData: INodeExecutionData[], runExecutionData: IRunExecutionData, additionalData: IWorkflowExecuteAdditionalData, mode: WorkflowExecuteMode);
    runNode(inputData: ITaskDataConnections, runIndex: number, nodeType: INodeType, executeData: IExecuteData, nodeExecuteFunctions: INodeExecuteFunctions, credentialsDecrypted?: ICredentialsDecrypted): Promise<INodeExecutionData[][] | null | undefined>;
    mergeOptions(destinationOptions: DeclarativeRestApiSettings.ResultOptions, sourceOptions?: DeclarativeRestApiSettings.ResultOptions): void;
    runPostReceiveAction(executeSingleFunctions: IExecuteSingleFunctions, action: PostReceiveAction, inputData: INodeExecutionData[], responseData: IN8nHttpFullResponse, parameterValue: string | IDataObject | undefined, itemIndex: number, runIndex: number): Promise<INodeExecutionData[]>;
    postProcessResponseData(executeSingleFunctions: IExecuteSingleFunctions, responseData: IN8nHttpFullResponse, requestData: DeclarativeRestApiSettings.ResultOptions, itemIndex: number, runIndex: number): Promise<INodeExecutionData[]>;
    rawRoutingRequest(executeSingleFunctions: IExecuteSingleFunctions, requestData: DeclarativeRestApiSettings.ResultOptions, credentialType?: string, credentialsDecrypted?: ICredentialsDecrypted): Promise<IN8nHttpFullResponse>;
    makeRoutingRequest(requestData: DeclarativeRestApiSettings.ResultOptions, executeSingleFunctions: IExecuteSingleFunctions, itemIndex: number, runIndex: number, credentialType?: string, requestOperations?: IN8nRequestOperations, credentialsDecrypted?: ICredentialsDecrypted): Promise<INodeExecutionData[]>;
    getParameterValue(parameterValue: NodeParameterValueType, itemIndex: number, runIndex: number, executeData: IExecuteData, additionalKeys?: IWorkflowDataProxyAdditionalKeys, returnObjectAsString?: boolean): NodeParameterValueType;
    getRequestOptionsFromParameters(executeSingleFunctions: IExecuteSingleFunctions, nodeProperties: INodeProperties | INodePropertyOptions, itemIndex: number, runIndex: number, path: string, additionalKeys?: IWorkflowDataProxyAdditionalKeys): DeclarativeRestApiSettings.ResultOptions | undefined;
}
