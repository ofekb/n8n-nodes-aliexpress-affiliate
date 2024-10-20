import type { IWorkflowBase, IWorkflowExecuteHooks, IWorkflowHooksOptionalParameters, WorkflowExecuteMode } from './Interfaces';
export declare class WorkflowHooks {
    mode: WorkflowExecuteMode;
    workflowData: IWorkflowBase;
    executionId: string;
    sessionId?: string;
    retryOf?: string;
    hookFunctions: IWorkflowExecuteHooks;
    constructor(hookFunctions: IWorkflowExecuteHooks, mode: WorkflowExecuteMode, executionId: string, workflowData: IWorkflowBase, optionalParameters?: IWorkflowHooksOptionalParameters);
    executeHookFunctions(hookName: string, parameters: any[]): Promise<void>;
}
