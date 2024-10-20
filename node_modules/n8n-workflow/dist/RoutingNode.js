"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoutingNode = void 0;
const lodash_get_1 = __importDefault(require("lodash.get"));
const lodash_merge_1 = __importDefault(require("lodash.merge"));
const lodash_set_1 = __importDefault(require("lodash.set"));
const NodeErrors_1 = require("./NodeErrors");
const NodeHelpers = __importStar(require("./NodeHelpers"));
class RoutingNode {
    constructor(workflow, node, connectionInputData, runExecutionData, additionalData, mode) {
        this.additionalData = additionalData;
        this.connectionInputData = connectionInputData;
        this.runExecutionData = runExecutionData;
        this.mode = mode;
        this.node = node;
        this.workflow = workflow;
    }
    async runNode(inputData, runIndex, nodeType, executeData, nodeExecuteFunctions, credentialsDecrypted) {
        var _a, _b;
        const items = inputData.main[0];
        const returnData = [];
        let responseData;
        let credentialType;
        if ((_a = nodeType.description.credentials) === null || _a === void 0 ? void 0 : _a.length) {
            credentialType = nodeType.description.credentials[0].name;
        }
        const executeFunctions = nodeExecuteFunctions.getExecuteFunctions(this.workflow, this.runExecutionData, runIndex, this.connectionInputData, inputData, this.node, this.additionalData, executeData, this.mode);
        let credentials;
        if (credentialsDecrypted) {
            credentials = credentialsDecrypted.data;
        }
        else if (credentialType) {
            try {
                credentials = (await executeFunctions.getCredentials(credentialType)) || {};
            }
            catch (error) {
                if (((_b = nodeType.description.credentials) === null || _b === void 0 ? void 0 : _b.length) &&
                    nodeType.description.credentials[0].required) {
                    throw error;
                }
                else {
                    credentialType = undefined;
                }
            }
        }
        for (let i = 0; i < items.length; i++) {
            try {
                const thisArgs = nodeExecuteFunctions.getExecuteSingleFunctions(this.workflow, this.runExecutionData, runIndex, this.connectionInputData, inputData, this.node, i, this.additionalData, executeData, this.mode);
                const requestData = {
                    options: {
                        qs: {},
                        body: {},
                        headers: {},
                    },
                    preSend: [],
                    postReceive: [],
                    requestOperations: {},
                };
                if (nodeType.description.requestOperations) {
                    requestData.requestOperations = { ...nodeType.description.requestOperations };
                }
                if (nodeType.description.requestDefaults) {
                    for (const key of Object.keys(nodeType.description.requestDefaults)) {
                        let value = nodeType.description.requestDefaults[key];
                        value = this.getParameterValue(value, i, runIndex, executeData, { $credentials: credentials, $version: this.node.typeVersion }, false);
                        requestData.options[key] = value;
                    }
                }
                for (const property of nodeType.description.properties) {
                    let value = (0, lodash_get_1.default)(this.node.parameters, property.name, []);
                    value = this.getParameterValue(value, i, runIndex, executeData, { $credentials: credentials, $version: this.node.typeVersion }, false);
                    const tempOptions = this.getRequestOptionsFromParameters(thisArgs, property, i, runIndex, '', { $credentials: credentials, $value: value, $version: this.node.typeVersion });
                    this.mergeOptions(requestData, tempOptions);
                }
                responseData = await this.makeRoutingRequest(requestData, thisArgs, i, runIndex, credentialType, requestData.requestOperations, credentialsDecrypted);
                if (requestData.maxResults) {
                    responseData.splice(requestData.maxResults);
                }
                returnData.push(...responseData);
            }
            catch (error) {
                if ((0, lodash_get_1.default)(this.node, 'continueOnFail', false)) {
                    returnData.push({ json: {}, error: error.message });
                    continue;
                }
                throw new NodeErrors_1.NodeApiError(this.node, error, {
                    runIndex,
                    itemIndex: i,
                    message: error === null || error === void 0 ? void 0 : error.message,
                    description: error === null || error === void 0 ? void 0 : error.description,
                });
            }
        }
        return [returnData];
    }
    mergeOptions(destinationOptions, sourceOptions) {
        var _a;
        if (sourceOptions) {
            destinationOptions.paginate = (_a = destinationOptions.paginate) !== null && _a !== void 0 ? _a : sourceOptions.paginate;
            destinationOptions.maxResults = sourceOptions.maxResults
                ? sourceOptions.maxResults
                : destinationOptions.maxResults;
            (0, lodash_merge_1.default)(destinationOptions.options, sourceOptions.options);
            destinationOptions.preSend.push(...sourceOptions.preSend);
            destinationOptions.postReceive.push(...sourceOptions.postReceive);
            if (sourceOptions.requestOperations && destinationOptions.requestOperations) {
                destinationOptions.requestOperations = Object.assign(destinationOptions.requestOperations, sourceOptions.requestOperations);
            }
        }
    }
    async runPostReceiveAction(executeSingleFunctions, action, inputData, responseData, parameterValue, itemIndex, runIndex) {
        if (typeof action === 'function') {
            return action.call(executeSingleFunctions, inputData, responseData);
        }
        if (action.type === 'rootProperty') {
            try {
                return inputData.flatMap((item) => {
                    let itemContent = (0, lodash_get_1.default)(item.json, action.properties.property);
                    if (!Array.isArray(itemContent)) {
                        itemContent = [itemContent];
                    }
                    return itemContent.map((json) => {
                        return {
                            json,
                        };
                    });
                });
            }
            catch (error) {
                throw new NodeErrors_1.NodeOperationError(this.node, error, {
                    runIndex,
                    itemIndex,
                    description: `The rootProperty "${action.properties.property}" could not be found on item.`,
                });
            }
        }
        if (action.type === 'filter') {
            const passValue = action.properties.pass;
            inputData = inputData.filter((item) => {
                return this.getParameterValue(passValue, itemIndex, runIndex, executeSingleFunctions.getExecuteData(), {
                    $response: responseData,
                    $responseItem: item.json,
                    $value: parameterValue,
                    $version: this.node.typeVersion,
                }, false);
            });
            return inputData;
        }
        if (action.type === 'limit') {
            const maxResults = this.getParameterValue(action.properties.maxResults, itemIndex, runIndex, executeSingleFunctions.getExecuteData(), { $response: responseData, $value: parameterValue, $version: this.node.typeVersion }, false);
            return inputData.slice(0, parseInt(maxResults, 10));
        }
        if (action.type === 'set') {
            const { value } = action.properties;
            return [
                {
                    json: this.getParameterValue(value, itemIndex, runIndex, executeSingleFunctions.getExecuteData(), { $response: responseData, $value: parameterValue, $version: this.node.typeVersion }, false),
                },
            ];
        }
        if (action.type === 'sort') {
            const sortKey = action.properties.key;
            inputData.sort((a, b) => {
                var _a, _b;
                const aSortValue = a.json[sortKey]
                    ? (_a = a.json[sortKey]) === null || _a === void 0 ? void 0 : _a.toString().toLowerCase()
                    : '';
                const bSortValue = b.json[sortKey]
                    ? (_b = b.json[sortKey]) === null || _b === void 0 ? void 0 : _b.toString().toLowerCase()
                    : '';
                if (aSortValue < bSortValue) {
                    return -1;
                }
                if (aSortValue > bSortValue) {
                    return 1;
                }
                return 0;
            });
            return inputData;
        }
        if (action.type === 'setKeyValue') {
            const returnData = [];
            inputData.forEach((item) => {
                const returnItem = {};
                for (const key of Object.keys(action.properties)) {
                    let propertyValue = action.properties[key];
                    propertyValue = this.getParameterValue(propertyValue, itemIndex, runIndex, executeSingleFunctions.getExecuteData(), {
                        $response: responseData,
                        $responseItem: item.json,
                        $value: parameterValue,
                        $version: this.node.typeVersion,
                    }, false);
                    returnItem[key] = propertyValue;
                }
                returnData.push({ json: returnItem });
            });
            return returnData;
        }
        if (action.type === 'binaryData') {
            const body = (responseData.body = Buffer.from(responseData.body));
            let { destinationProperty } = action.properties;
            destinationProperty = this.getParameterValue(destinationProperty, itemIndex, runIndex, executeSingleFunctions.getExecuteData(), { $response: responseData, $value: parameterValue, $version: this.node.typeVersion }, false);
            const binaryData = await executeSingleFunctions.helpers.prepareBinaryData(body);
            return inputData.map((item) => {
                if (typeof item.json === 'string') {
                    item.json = {};
                }
                item.binary = {
                    [destinationProperty]: binaryData,
                };
                return item;
            });
        }
        return [];
    }
    async postProcessResponseData(executeSingleFunctions, responseData, requestData, itemIndex, runIndex) {
        let returnData = [
            {
                json: responseData.body,
            },
        ];
        if (requestData.postReceive.length) {
            for (const postReceiveMethod of requestData.postReceive) {
                for (const action of postReceiveMethod.actions) {
                    returnData = await this.runPostReceiveAction(executeSingleFunctions, action, returnData, responseData, postReceiveMethod.data.parameterValue, itemIndex, runIndex);
                }
            }
        }
        else {
            if (Array.isArray(responseData.body)) {
                returnData = responseData.body.map((json) => {
                    return {
                        json,
                    };
                });
            }
            else {
                returnData[0].json = responseData.body;
            }
        }
        return returnData;
    }
    async rawRoutingRequest(executeSingleFunctions, requestData, credentialType, credentialsDecrypted) {
        let responseData;
        requestData.options.returnFullResponse = true;
        if (credentialType) {
            responseData = (await executeSingleFunctions.helpers.httpRequestWithAuthentication.call(executeSingleFunctions, credentialType, requestData.options, { credentialsDecrypted }));
        }
        else {
            responseData = (await executeSingleFunctions.helpers.httpRequest(requestData.options));
        }
        return responseData;
    }
    async makeRoutingRequest(requestData, executeSingleFunctions, itemIndex, runIndex, credentialType, requestOperations, credentialsDecrypted) {
        let responseData;
        for (const preSendMethod of requestData.preSend) {
            requestData.options = await preSendMethod.call(executeSingleFunctions, requestData.options);
        }
        const executePaginationFunctions = {
            ...executeSingleFunctions,
            makeRoutingRequest: async (requestOptions) => {
                return this.rawRoutingRequest(executeSingleFunctions, requestOptions, credentialType, credentialsDecrypted).then(async (data) => this.postProcessResponseData(executeSingleFunctions, data, requestData, itemIndex, runIndex));
            },
        };
        if (requestData.paginate && (requestOperations === null || requestOperations === void 0 ? void 0 : requestOperations.pagination)) {
            if (typeof requestOperations.pagination === 'function') {
                responseData = await requestOperations.pagination.call(executePaginationFunctions, requestData);
            }
            else {
                responseData = [];
                if (!requestData.options.qs) {
                    requestData.options.qs = {};
                }
                if (requestOperations.pagination.type === 'generic') {
                    let tempResponseData;
                    let tempResponseItems;
                    let makeAdditionalRequest;
                    let paginateRequestData;
                    const additionalKeys = {
                        $request: requestData.options,
                        $response: {},
                        $version: this.node.typeVersion,
                    };
                    do {
                        additionalKeys.$request = requestData.options;
                        paginateRequestData = this.getParameterValue(requestOperations.pagination.properties.request, itemIndex, runIndex, executeSingleFunctions.getExecuteData(), additionalKeys, false);
                        tempResponseData = await this.rawRoutingRequest(executeSingleFunctions, { ...requestData, options: { ...requestData.options, ...paginateRequestData } }, credentialType, credentialsDecrypted);
                        additionalKeys.$response = tempResponseData;
                        tempResponseItems = await this.postProcessResponseData(executeSingleFunctions, tempResponseData, requestData, itemIndex, runIndex);
                        responseData.push(...tempResponseItems);
                        makeAdditionalRequest = this.getParameterValue(requestOperations.pagination.properties.continue, itemIndex, runIndex, executeSingleFunctions.getExecuteData(), additionalKeys, false);
                    } while (makeAdditionalRequest);
                }
                else if (requestOperations.pagination.type === 'offset') {
                    const { properties } = requestOperations.pagination;
                    const optionsType = properties.type === 'body' ? 'body' : 'qs';
                    if (properties.type === 'body' && !requestData.options.body) {
                        requestData.options.body = {};
                    }
                    requestData.options[optionsType][properties.limitParameter] =
                        properties.pageSize;
                    requestData.options[optionsType][properties.offsetParameter] = 0;
                    let tempResponseData;
                    do {
                        if (requestData === null || requestData === void 0 ? void 0 : requestData.maxResults) {
                            const resultsMissing = (requestData === null || requestData === void 0 ? void 0 : requestData.maxResults) - responseData.length;
                            if (resultsMissing < 1) {
                                break;
                            }
                            requestData.options[optionsType][properties.limitParameter] =
                                Math.min(properties.pageSize, resultsMissing);
                        }
                        tempResponseData = await this.rawRoutingRequest(executeSingleFunctions, requestData, credentialType, credentialsDecrypted).then(async (data) => this.postProcessResponseData(executeSingleFunctions, data, requestData, itemIndex, runIndex));
                        requestData.options[optionsType][properties.offsetParameter] =
                            requestData.options[optionsType][properties.offsetParameter] + properties.pageSize;
                        if (properties.rootProperty) {
                            const tempResponseValue = (0, lodash_get_1.default)(tempResponseData[0].json, properties.rootProperty);
                            if (tempResponseValue === undefined) {
                                throw new NodeErrors_1.NodeOperationError(this.node, `The rootProperty "${properties.rootProperty}" could not be found on item.`, { runIndex, itemIndex });
                            }
                            tempResponseData = tempResponseValue.map((item) => {
                                return {
                                    json: item,
                                };
                            });
                        }
                        responseData.push(...tempResponseData);
                    } while (tempResponseData.length && tempResponseData.length === properties.pageSize);
                }
            }
        }
        else {
            responseData = await this.rawRoutingRequest(executeSingleFunctions, requestData, credentialType, credentialsDecrypted).then(async (data) => this.postProcessResponseData(executeSingleFunctions, data, requestData, itemIndex, runIndex));
        }
        return responseData;
    }
    getParameterValue(parameterValue, itemIndex, runIndex, executeData, additionalKeys, returnObjectAsString = false) {
        var _a;
        if (typeof parameterValue === 'object' ||
            (typeof parameterValue === 'string' && parameterValue.charAt(0) === '=')) {
            return this.workflow.expression.getParameterValue(parameterValue, (_a = this.runExecutionData) !== null && _a !== void 0 ? _a : null, runIndex, itemIndex, this.node.name, this.connectionInputData, this.mode, this.additionalData.timezone, additionalKeys !== null && additionalKeys !== void 0 ? additionalKeys : {}, executeData, returnObjectAsString);
        }
        return parameterValue;
    }
    getRequestOptionsFromParameters(executeSingleFunctions, nodeProperties, itemIndex, runIndex, path, additionalKeys) {
        var _a;
        const returnData = {
            options: {
                qs: {},
                body: {},
                headers: {},
            },
            preSend: [],
            postReceive: [],
            requestOperations: {},
        };
        let basePath = path ? `${path}.` : '';
        if (!NodeHelpers.displayParameter(this.node.parameters, nodeProperties, this.node, this.node.parameters)) {
            return undefined;
        }
        if (nodeProperties.routing) {
            let parameterValue;
            if (basePath + nodeProperties.name && 'type' in nodeProperties) {
                const shouldExtractValue = nodeProperties.extractValue !== undefined || nodeProperties.type === 'resourceLocator';
                parameterValue = executeSingleFunctions.getNodeParameter(basePath + nodeProperties.name, undefined, { extractValue: shouldExtractValue });
            }
            if (nodeProperties.routing.operations) {
                returnData.requestOperations = { ...nodeProperties.routing.operations };
            }
            if (nodeProperties.routing.request) {
                for (const key of Object.keys(nodeProperties.routing.request)) {
                    let propertyValue = nodeProperties.routing.request[key];
                    propertyValue = this.getParameterValue(propertyValue, itemIndex, runIndex, executeSingleFunctions.getExecuteData(), { ...additionalKeys, $value: parameterValue }, false);
                    returnData.options[key] = propertyValue;
                }
            }
            if (nodeProperties.routing.send) {
                let propertyName = nodeProperties.routing.send.property;
                if (propertyName !== undefined) {
                    propertyName = this.getParameterValue(propertyName, itemIndex, runIndex, executeSingleFunctions.getExecuteData(), additionalKeys, true);
                    let value = parameterValue;
                    if (nodeProperties.routing.send.value) {
                        const valueString = nodeProperties.routing.send.value;
                        value = this.getParameterValue(valueString, itemIndex, runIndex, executeSingleFunctions.getExecuteData(), { ...additionalKeys, $value: value }, false);
                    }
                    if (nodeProperties.routing.send.type === 'body') {
                        if (nodeProperties.routing.send.propertyInDotNotation === false) {
                            returnData.options.body[propertyName] = value;
                        }
                        else {
                            (0, lodash_set_1.default)(returnData.options.body, propertyName, value);
                        }
                    }
                    else {
                        if (nodeProperties.routing.send.propertyInDotNotation === false) {
                            returnData.options.qs[propertyName] = value;
                        }
                        else {
                            (0, lodash_set_1.default)(returnData.options.qs, propertyName, value);
                        }
                    }
                }
                if (nodeProperties.routing.send.paginate !== undefined) {
                    let paginateValue = nodeProperties.routing.send.paginate;
                    if (typeof paginateValue === 'string' && paginateValue.charAt(0) === '=') {
                        paginateValue = this.getParameterValue(paginateValue, itemIndex, runIndex, executeSingleFunctions.getExecuteData(), { ...additionalKeys, $value: parameterValue }, true);
                    }
                    returnData.paginate = !!paginateValue;
                }
                if (nodeProperties.routing.send.preSend) {
                    returnData.preSend.push(...nodeProperties.routing.send.preSend);
                }
            }
            if (nodeProperties.routing.output) {
                if (nodeProperties.routing.output.maxResults !== undefined) {
                    let maxResultsValue = nodeProperties.routing.output.maxResults;
                    if (typeof maxResultsValue === 'string' && maxResultsValue.charAt(0) === '=') {
                        maxResultsValue = this.getParameterValue(maxResultsValue, itemIndex, runIndex, executeSingleFunctions.getExecuteData(), { ...additionalKeys, $value: parameterValue }, true);
                    }
                    returnData.maxResults = maxResultsValue;
                }
                if (nodeProperties.routing.output.postReceive) {
                    const postReceiveActions = nodeProperties.routing.output.postReceive.filter((action) => {
                        if (typeof action === 'function') {
                            return true;
                        }
                        if (typeof action.enabled === 'string' && action.enabled.charAt(0) === '=') {
                            return this.getParameterValue(action.enabled, itemIndex, runIndex, executeSingleFunctions.getExecuteData(), { ...additionalKeys, $value: parameterValue }, true);
                        }
                        return action.enabled !== false;
                    });
                    if (postReceiveActions.length) {
                        returnData.postReceive.push({
                            data: {
                                parameterValue,
                            },
                            actions: postReceiveActions,
                        });
                    }
                }
            }
        }
        if (!Object.prototype.hasOwnProperty.call(nodeProperties, 'options')) {
            return returnData;
        }
        nodeProperties = nodeProperties;
        let value;
        if (nodeProperties.type === 'options') {
            const optionValue = NodeHelpers.getParameterValueByPath(this.node.parameters, nodeProperties.name, basePath.slice(0, -1));
            const selectedOption = nodeProperties.options.filter((option) => option.value === optionValue);
            if (selectedOption.length) {
                const tempOptions = this.getRequestOptionsFromParameters(executeSingleFunctions, selectedOption[0], itemIndex, runIndex, `${basePath}${nodeProperties.name}`, { $value: optionValue, $version: this.node.typeVersion });
                this.mergeOptions(returnData, tempOptions);
            }
        }
        else if (nodeProperties.type === 'collection') {
            value = NodeHelpers.getParameterValueByPath(this.node.parameters, nodeProperties.name, basePath.slice(0, -1));
            for (const propertyOption of nodeProperties.options) {
                if (Object.keys(value).includes(propertyOption.name) &&
                    propertyOption.type !== undefined) {
                    const tempOptions = this.getRequestOptionsFromParameters(executeSingleFunctions, propertyOption, itemIndex, runIndex, `${basePath}${nodeProperties.name}`, { $version: this.node.typeVersion });
                    this.mergeOptions(returnData, tempOptions);
                }
            }
        }
        else if (nodeProperties.type === 'fixedCollection') {
            basePath = `${basePath}${nodeProperties.name}.`;
            for (const propertyOptions of nodeProperties.options) {
                value = NodeHelpers.getParameterValueByPath(this.node.parameters, propertyOptions.name, basePath.slice(0, -1));
                if (value === undefined) {
                    continue;
                }
                if (!Array.isArray(value)) {
                    value = [value];
                }
                value = this.getParameterValue(value, itemIndex, runIndex, executeSingleFunctions.getExecuteData(), { ...additionalKeys }, false);
                const loopBasePath = `${basePath}${propertyOptions.name}`;
                for (let i = 0; i < value.length; i++) {
                    for (const option of propertyOptions.values) {
                        const tempOptions = this.getRequestOptionsFromParameters(executeSingleFunctions, option, itemIndex, runIndex, ((_a = nodeProperties.typeOptions) === null || _a === void 0 ? void 0 : _a.multipleValues) ? `${loopBasePath}[${i}]` : loopBasePath, { ...(additionalKeys || {}), $index: i, $parent: value[i] });
                        this.mergeOptions(returnData, tempOptions);
                    }
                }
            }
        }
        return returnData;
    }
}
exports.RoutingNode = RoutingNode;
//# sourceMappingURL=RoutingNode.js.map