import * as tmpl from '@n8n_io/riot-tmpl';
import type { IExecuteData, INode, INodeExecutionData, INodeParameterResourceLocator, INodeParameters, IRunExecutionData, IWorkflowDataProxyAdditionalKeys, NodeParameterValue, NodeParameterValueType, WorkflowExecuteMode } from './Interfaces';
import type { Workflow } from './Workflow';
export declare class Expression {
    workflow: Workflow;
    constructor(workflow: Workflow);
    static resolveWithoutWorkflow(expression: string): tmpl.ReturnValue;
    convertObjectValueToString(value: object): string;
    resolveSimpleParameterValue(parameterValue: NodeParameterValue, siblingParameters: INodeParameters, runExecutionData: IRunExecutionData | null, runIndex: number, itemIndex: number, activeNodeName: string, connectionInputData: INodeExecutionData[], mode: WorkflowExecuteMode, timezone: string, additionalKeys: IWorkflowDataProxyAdditionalKeys, executeData?: IExecuteData, returnObjectAsString?: boolean, selfData?: {}): NodeParameterValue | INodeParameters | NodeParameterValue[] | INodeParameters[];
    private renderExpression;
    getSimpleParameterValue(node: INode, parameterValue: string | boolean | undefined, mode: WorkflowExecuteMode, timezone: string, additionalKeys: IWorkflowDataProxyAdditionalKeys, executeData?: IExecuteData, defaultValue?: boolean | number | string): boolean | number | string | undefined;
    getComplexParameterValue(node: INode, parameterValue: NodeParameterValue | INodeParameters | NodeParameterValue[] | INodeParameters[], mode: WorkflowExecuteMode, timezone: string, additionalKeys: IWorkflowDataProxyAdditionalKeys, executeData?: IExecuteData, defaultValue?: NodeParameterValueType | undefined, selfData?: {}): NodeParameterValueType | undefined;
    getParameterValue(parameterValue: NodeParameterValueType | INodeParameterResourceLocator, runExecutionData: IRunExecutionData | null, runIndex: number, itemIndex: number, activeNodeName: string, connectionInputData: INodeExecutionData[], mode: WorkflowExecuteMode, timezone: string, additionalKeys: IWorkflowDataProxyAdditionalKeys, executeData?: IExecuteData, returnObjectAsString?: boolean, selfData?: {}): NodeParameterValueType;
}
