"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVersionedNodeTypeAll = exports.getVersionedNodeType = exports.mergeNodeProperties = exports.mergeIssues = exports.getParameterIssues = exports.getParameterValueByPath = exports.addToIssuesIfMissing = exports.validateResourceLocatorParameter = exports.nodeIssuesToString = exports.getNodeParametersIssues = exports.getNodeWebhookUrl = exports.getNodeWebhookPath = exports.getNodeWebhooks = exports.prepareOutputData = exports.getNodeParameters = exports.getParameterResolveOrder = exports.getContext = exports.displayParameterPath = exports.displayParameter = exports.applySpecialNodeParameters = exports.cronNodeOptions = void 0;
const lodash_get_1 = __importDefault(require("lodash.get"));
const lodash_isequal_1 = __importDefault(require("lodash.isequal"));
const type_guards_1 = require("./type-guards");
const utils_1 = require("./utils");
exports.cronNodeOptions = [
    {
        name: 'item',
        displayName: 'Item',
        values: [
            {
                displayName: 'Mode',
                name: 'mode',
                type: 'options',
                options: [
                    {
                        name: 'Every Minute',
                        value: 'everyMinute',
                    },
                    {
                        name: 'Every Hour',
                        value: 'everyHour',
                    },
                    {
                        name: 'Every Day',
                        value: 'everyDay',
                    },
                    {
                        name: 'Every Week',
                        value: 'everyWeek',
                    },
                    {
                        name: 'Every Month',
                        value: 'everyMonth',
                    },
                    {
                        name: 'Every X',
                        value: 'everyX',
                    },
                    {
                        name: 'Custom',
                        value: 'custom',
                    },
                ],
                default: 'everyDay',
                description: 'How often to trigger.',
            },
            {
                displayName: 'Hour',
                name: 'hour',
                type: 'number',
                typeOptions: {
                    minValue: 0,
                    maxValue: 23,
                },
                displayOptions: {
                    hide: {
                        mode: ['custom', 'everyHour', 'everyMinute', 'everyX'],
                    },
                },
                default: 14,
                description: 'The hour of the day to trigger (24h format)',
            },
            {
                displayName: 'Minute',
                name: 'minute',
                type: 'number',
                typeOptions: {
                    minValue: 0,
                    maxValue: 59,
                },
                displayOptions: {
                    hide: {
                        mode: ['custom', 'everyMinute', 'everyX'],
                    },
                },
                default: 0,
                description: 'The minute of the day to trigger',
            },
            {
                displayName: 'Day of Month',
                name: 'dayOfMonth',
                type: 'number',
                displayOptions: {
                    show: {
                        mode: ['everyMonth'],
                    },
                },
                typeOptions: {
                    minValue: 1,
                    maxValue: 31,
                },
                default: 1,
                description: 'The day of the month to trigger',
            },
            {
                displayName: 'Weekday',
                name: 'weekday',
                type: 'options',
                displayOptions: {
                    show: {
                        mode: ['everyWeek'],
                    },
                },
                options: [
                    {
                        name: 'Monday',
                        value: '1',
                    },
                    {
                        name: 'Tuesday',
                        value: '2',
                    },
                    {
                        name: 'Wednesday',
                        value: '3',
                    },
                    {
                        name: 'Thursday',
                        value: '4',
                    },
                    {
                        name: 'Friday',
                        value: '5',
                    },
                    {
                        name: 'Saturday',
                        value: '6',
                    },
                    {
                        name: 'Sunday',
                        value: '0',
                    },
                ],
                default: '1',
                description: 'The weekday to trigger',
            },
            {
                displayName: 'Cron Expression',
                name: 'cronExpression',
                type: 'string',
                displayOptions: {
                    show: {
                        mode: ['custom'],
                    },
                },
                default: '* * * * * *',
                description: 'Use custom cron expression. Values and ranges as follows:<ul><li>Seconds: 0-59</li><li>Minutes: 0 - 59</li><li>Hours: 0 - 23</li><li>Day of Month: 1 - 31</li><li>Months: 0 - 11 (Jan - Dec)</li><li>Day of Week: 0 - 6 (Sun - Sat)</li></ul>',
            },
            {
                displayName: 'Value',
                name: 'value',
                type: 'number',
                typeOptions: {
                    minValue: 0,
                    maxValue: 1000,
                },
                displayOptions: {
                    show: {
                        mode: ['everyX'],
                    },
                },
                default: 2,
                description: 'All how many X minutes/hours it should trigger',
            },
            {
                displayName: 'Unit',
                name: 'unit',
                type: 'options',
                displayOptions: {
                    show: {
                        mode: ['everyX'],
                    },
                },
                options: [
                    {
                        name: 'Minutes',
                        value: 'minutes',
                    },
                    {
                        name: 'Hours',
                        value: 'hours',
                    },
                ],
                default: 'hours',
                description: 'If it should trigger all X minutes or hours',
            },
        ],
    },
];
const specialNodeParameters = [
    {
        displayName: 'Poll Times',
        name: 'pollTimes',
        type: 'fixedCollection',
        typeOptions: {
            multipleValues: true,
            multipleValueButtonText: 'Add Poll Time',
        },
        default: { item: [{ mode: 'everyMinute' }] },
        description: 'Time at which polling should occur',
        placeholder: 'Add Poll Time',
        options: exports.cronNodeOptions,
    },
];
function applySpecialNodeParameters(nodeType) {
    if (nodeType.description.polling === true) {
        nodeType.description.properties.unshift(...specialNodeParameters);
    }
}
exports.applySpecialNodeParameters = applySpecialNodeParameters;
function displayParameter(nodeValues, parameter, node, nodeValuesRoot) {
    if (!parameter.displayOptions) {
        return true;
    }
    nodeValuesRoot = nodeValuesRoot || nodeValues;
    let value;
    const values = [];
    if (parameter.displayOptions.show) {
        for (const propertyName of Object.keys(parameter.displayOptions.show)) {
            if (propertyName.charAt(0) === '/') {
                value = (0, lodash_get_1.default)(nodeValuesRoot, propertyName.slice(1));
            }
            else if (propertyName === '@version') {
                value = (node === null || node === void 0 ? void 0 : node.typeVersion) || 0;
            }
            else {
                value = (0, lodash_get_1.default)(nodeValues, propertyName);
            }
            if (value && typeof value === 'object' && '__rl' in value && value.__rl) {
                value = value.value;
            }
            values.length = 0;
            if (!Array.isArray(value)) {
                values.push(value);
            }
            else {
                values.push.apply(values, value);
            }
            if (values.some((v) => typeof v === 'string' && v.charAt(0) === '=')) {
                return true;
            }
            if (values.length === 0 ||
                !parameter.displayOptions.show[propertyName].some((v) => values.includes(v))) {
                return false;
            }
        }
    }
    if (parameter.displayOptions.hide) {
        for (const propertyName of Object.keys(parameter.displayOptions.hide)) {
            if (propertyName.charAt(0) === '/') {
                value = (0, lodash_get_1.default)(nodeValuesRoot, propertyName.slice(1));
            }
            else if (propertyName === '@version') {
                value = (node === null || node === void 0 ? void 0 : node.typeVersion) || 0;
            }
            else {
                value = (0, lodash_get_1.default)(nodeValues, propertyName);
            }
            if (value && typeof value === 'object' && '__rl' in value && value.__rl) {
                value = value.value;
            }
            values.length = 0;
            if (!Array.isArray(value)) {
                values.push(value);
            }
            else {
                values.push.apply(values, value);
            }
            if (values.length !== 0 &&
                parameter.displayOptions.hide[propertyName].some((v) => values.includes(v))) {
                return false;
            }
        }
    }
    return true;
}
exports.displayParameter = displayParameter;
function displayParameterPath(nodeValues, parameter, path, node) {
    let resolvedNodeValues = nodeValues;
    if (path !== '') {
        resolvedNodeValues = (0, lodash_get_1.default)(nodeValues, path);
    }
    let nodeValuesRoot = nodeValues;
    if (path && path.split('.').indexOf('parameters') === 0) {
        nodeValuesRoot = (0, lodash_get_1.default)(nodeValues, 'parameters');
    }
    return displayParameter(resolvedNodeValues, parameter, node, nodeValuesRoot);
}
exports.displayParameterPath = displayParameterPath;
function getContext(runExecutionData, type, node) {
    if (runExecutionData.executionData === undefined) {
        throw new Error('The "executionData" is not initialized!');
    }
    let key;
    if (type === 'flow') {
        key = 'flow';
    }
    else if (type === 'node') {
        if (node === undefined) {
            throw new Error('The request data of context type "node" the node parameter has to be set!');
        }
        key = `node:${node.name}`;
    }
    else {
        throw new Error(`The context type "${type}" is not know. Only "flow" and node" are supported!`);
    }
    if (runExecutionData.executionData.contextData[key] === undefined) {
        runExecutionData.executionData.contextData[key] = {};
    }
    return runExecutionData.executionData.contextData[key];
}
exports.getContext = getContext;
function getParameterDependencies(nodePropertiesArray) {
    const dependencies = {};
    for (const nodeProperties of nodePropertiesArray) {
        const { name, displayOptions } = nodeProperties;
        if (!dependencies[name]) {
            dependencies[name] = [];
        }
        if (!displayOptions) {
            continue;
        }
        for (const displayRule of Object.values(displayOptions)) {
            for (const parameterName of Object.keys(displayRule)) {
                if (!dependencies[name].includes(parameterName)) {
                    if (parameterName.charAt(0) === '@') {
                        continue;
                    }
                    dependencies[name].push(parameterName);
                }
            }
        }
    }
    return dependencies;
}
function getParameterResolveOrder(nodePropertiesArray, parameterDependencies) {
    const executionOrder = [];
    const indexToResolve = Array.from({ length: nodePropertiesArray.length }, (v, k) => k);
    const resolvedParameters = [];
    let index;
    let property;
    let lastIndexLength = indexToResolve.length;
    let lastIndexReduction = -1;
    let iterations = 0;
    while (indexToResolve.length !== 0) {
        iterations += 1;
        index = indexToResolve.shift();
        property = nodePropertiesArray[index];
        if (parameterDependencies[property.name].length === 0) {
            executionOrder.push(index);
            resolvedParameters.push(property.name);
            continue;
        }
        for (const dependency of parameterDependencies[property.name]) {
            if (!resolvedParameters.includes(dependency)) {
                if (dependency.charAt(0) === '/') {
                    continue;
                }
                indexToResolve.push(index);
                continue;
            }
        }
        executionOrder.push(index);
        resolvedParameters.push(property.name);
        if (indexToResolve.length < lastIndexLength) {
            lastIndexReduction = iterations;
        }
        if (iterations > lastIndexReduction + nodePropertiesArray.length) {
            throw new Error('Could not resolve parameter dependencies. Max iterations reached! Hint: If `displayOptions` are specified in any child parameter of a parent `collection` or `fixedCollection`, remove the `displayOptions` from the child parameter.');
        }
        lastIndexLength = indexToResolve.length;
    }
    return executionOrder;
}
exports.getParameterResolveOrder = getParameterResolveOrder;
function getNodeParameters(nodePropertiesArray, nodeValues, returnDefaults, returnNoneDisplayed, node, onlySimpleTypes = false, dataIsResolved = false, nodeValuesRoot, parentType, parameterDependencies) {
    var _a, _b;
    if (parameterDependencies === undefined) {
        parameterDependencies = getParameterDependencies(nodePropertiesArray);
    }
    const duplicateParameterNames = [];
    const parameterNames = [];
    for (const nodeProperties of nodePropertiesArray) {
        if (parameterNames.includes(nodeProperties.name)) {
            if (!duplicateParameterNames.includes(nodeProperties.name)) {
                duplicateParameterNames.push(nodeProperties.name);
            }
        }
        else {
            parameterNames.push(nodeProperties.name);
        }
    }
    const nodeParameters = {};
    const nodeParametersFull = {};
    let nodeValuesDisplayCheck = nodeParametersFull;
    if (!dataIsResolved && !returnNoneDisplayed) {
        nodeValuesDisplayCheck = getNodeParameters(nodePropertiesArray, nodeValues, true, true, node, true, true, nodeValuesRoot, parentType, parameterDependencies);
    }
    nodeValuesRoot = nodeValuesRoot || nodeValuesDisplayCheck;
    const parameterItterationOrderIndex = getParameterResolveOrder(nodePropertiesArray, parameterDependencies);
    for (const parameterIndex of parameterItterationOrderIndex) {
        const nodeProperties = nodePropertiesArray[parameterIndex];
        if (nodeValues[nodeProperties.name] === undefined &&
            (!returnDefaults || parentType === 'collection')) {
            continue;
        }
        if (!returnNoneDisplayed &&
            !displayParameter(nodeValuesDisplayCheck, nodeProperties, node, nodeValuesRoot)) {
            if (!returnNoneDisplayed || !returnDefaults) {
                continue;
            }
        }
        if (!['collection', 'fixedCollection'].includes(nodeProperties.type)) {
            if (duplicateParameterNames.includes(nodeProperties.name)) {
                if (!displayParameter(nodeValuesDisplayCheck, nodeProperties, node, nodeValuesRoot)) {
                    continue;
                }
            }
            if (returnDefaults) {
                if (['boolean', 'number', 'options'].includes(nodeProperties.type)) {
                    nodeParameters[nodeProperties.name] =
                        nodeValues[nodeProperties.name] !== undefined
                            ? nodeValues[nodeProperties.name]
                            : nodeProperties.default;
                }
                else if (nodeProperties.type === 'resourceLocator' &&
                    typeof nodeProperties.default === 'object') {
                    nodeParameters[nodeProperties.name] =
                        nodeValues[nodeProperties.name] !== undefined
                            ? nodeValues[nodeProperties.name]
                            : { __rl: true, ...nodeProperties.default };
                }
                else {
                    nodeParameters[nodeProperties.name] =
                        nodeValues[nodeProperties.name] || nodeProperties.default;
                }
                nodeParametersFull[nodeProperties.name] = nodeParameters[nodeProperties.name];
            }
            else if ((nodeValues[nodeProperties.name] !== nodeProperties.default &&
                typeof nodeValues[nodeProperties.name] !== 'object') ||
                (typeof nodeValues[nodeProperties.name] === 'object' &&
                    !(0, lodash_isequal_1.default)(nodeValues[nodeProperties.name], nodeProperties.default)) ||
                (nodeValues[nodeProperties.name] !== undefined && parentType === 'collection')) {
                nodeParameters[nodeProperties.name] = nodeValues[nodeProperties.name];
                nodeParametersFull[nodeProperties.name] = nodeParameters[nodeProperties.name];
                continue;
            }
        }
        if (onlySimpleTypes) {
            continue;
        }
        let tempValue;
        if (nodeProperties.type === 'collection') {
            if (nodeProperties.typeOptions !== undefined &&
                nodeProperties.typeOptions.multipleValues === true) {
                if (nodeValues[nodeProperties.name] !== undefined) {
                    nodeParameters[nodeProperties.name] = nodeValues[nodeProperties.name];
                }
                else if (returnDefaults) {
                    if (Array.isArray(nodeProperties.default)) {
                        nodeParameters[nodeProperties.name] = (0, utils_1.deepCopy)(nodeProperties.default);
                    }
                    else {
                        nodeParameters[nodeProperties.name] = [];
                    }
                }
                nodeParametersFull[nodeProperties.name] = nodeParameters[nodeProperties.name];
            }
            else if (nodeValues[nodeProperties.name] !== undefined) {
                const tempNodeParameters = getNodeParameters(nodeProperties.options, nodeValues[nodeProperties.name], returnDefaults, returnNoneDisplayed, node, false, false, nodeValuesRoot, nodeProperties.type);
                if (tempNodeParameters !== null) {
                    nodeParameters[nodeProperties.name] = tempNodeParameters;
                    nodeParametersFull[nodeProperties.name] = nodeParameters[nodeProperties.name];
                }
            }
            else if (returnDefaults) {
                nodeParameters[nodeProperties.name] = (0, utils_1.deepCopy)(nodeProperties.default);
                nodeParametersFull[nodeProperties.name] = nodeParameters[nodeProperties.name];
            }
        }
        else if (nodeProperties.type === 'fixedCollection') {
            const collectionValues = {};
            let tempNodeParameters;
            let tempNodePropertiesArray;
            let nodePropertyOptions;
            let propertyValues = nodeValues[nodeProperties.name];
            if (returnDefaults) {
                if (propertyValues === undefined) {
                    propertyValues = (0, utils_1.deepCopy)(nodeProperties.default);
                }
            }
            if (!returnDefaults &&
                ((_a = nodeProperties.typeOptions) === null || _a === void 0 ? void 0 : _a.multipleValues) === false &&
                propertyValues &&
                Object.keys(propertyValues).length === 0) {
                return nodeValues;
            }
            for (const itemName of Object.keys(propertyValues || {})) {
                if (nodeProperties.typeOptions !== undefined &&
                    nodeProperties.typeOptions.multipleValues === true) {
                    const tempArrayValue = [];
                    for (const nodeValue of propertyValues[itemName]) {
                        nodePropertyOptions = nodeProperties.options.find((nodePropertyOptions) => nodePropertyOptions.name === itemName);
                        if (nodePropertyOptions === undefined) {
                            throw new Error(`Could not find property option "${itemName}" for "${nodeProperties.name}"`);
                        }
                        tempNodePropertiesArray = nodePropertyOptions.values;
                        tempValue = getNodeParameters(tempNodePropertiesArray, nodeValue, returnDefaults, returnNoneDisplayed, node, false, false, nodeValuesRoot, nodeProperties.type);
                        if (tempValue !== null) {
                            tempArrayValue.push(tempValue);
                        }
                    }
                    collectionValues[itemName] = tempArrayValue;
                }
                else {
                    tempNodeParameters = {};
                    const nodePropertyOptions = nodeProperties.options.find((data) => data.name === itemName);
                    if (nodePropertyOptions !== undefined) {
                        tempNodePropertiesArray = nodePropertyOptions.values;
                        tempValue = getNodeParameters(tempNodePropertiesArray, nodeValues[nodeProperties.name][itemName], returnDefaults, returnNoneDisplayed, node, false, false, nodeValuesRoot, nodeProperties.type);
                        if (tempValue !== null) {
                            Object.assign(tempNodeParameters, tempValue);
                        }
                    }
                    if (Object.keys(tempNodeParameters).length !== 0) {
                        collectionValues[itemName] = tempNodeParameters;
                    }
                }
            }
            if (!returnDefaults &&
                ((_b = nodeProperties.typeOptions) === null || _b === void 0 ? void 0 : _b.multipleValues) === false &&
                collectionValues &&
                Object.keys(collectionValues).length === 0 &&
                propertyValues &&
                (propertyValues === null || propertyValues === void 0 ? void 0 : propertyValues.constructor.name) === 'Object' &&
                Object.keys(propertyValues).length !== 0) {
                const returnValue = {};
                Object.keys(propertyValues || {}).forEach((value) => {
                    returnValue[value] = {};
                });
                nodeParameters[nodeProperties.name] = returnValue;
            }
            if (Object.keys(collectionValues).length !== 0 || returnDefaults) {
                if (returnDefaults) {
                    if (collectionValues === undefined) {
                        nodeParameters[nodeProperties.name] = (0, utils_1.deepCopy)(nodeProperties.default);
                    }
                    else {
                        nodeParameters[nodeProperties.name] = collectionValues;
                    }
                    nodeParametersFull[nodeProperties.name] = nodeParameters[nodeProperties.name];
                }
                else if (collectionValues !== nodeProperties.default) {
                    nodeParameters[nodeProperties.name] = collectionValues;
                    nodeParametersFull[nodeProperties.name] = nodeParameters[nodeProperties.name];
                }
            }
        }
    }
    return nodeParameters;
}
exports.getNodeParameters = getNodeParameters;
async function prepareOutputData(outputData, outputIndex = 0) {
    const returnData = [];
    for (let i = 0; i < outputIndex; i++) {
        returnData.push([]);
    }
    returnData.push(outputData);
    return returnData;
}
exports.prepareOutputData = prepareOutputData;
function getNodeWebhooks(workflow, node, additionalData, ignoreRestartWebhooks = false) {
    if (node.disabled === true) {
        return [];
    }
    const nodeType = workflow.nodeTypes.getByNameAndVersion(node.type, node.typeVersion);
    if (nodeType.description.webhooks === undefined) {
        return [];
    }
    const workflowId = workflow.id || '__UNSAVED__';
    const mode = 'internal';
    const returnData = [];
    for (const webhookDescription of nodeType.description.webhooks) {
        if (ignoreRestartWebhooks && webhookDescription.restartWebhook === true) {
            continue;
        }
        let nodeWebhookPath = workflow.expression.getSimpleParameterValue(node, webhookDescription.path, mode, additionalData.timezone, {});
        if (nodeWebhookPath === undefined) {
            console.error(`No webhook path could be found for node "${node.name}" in workflow "${workflowId}".`);
            continue;
        }
        nodeWebhookPath = nodeWebhookPath.toString();
        if (nodeWebhookPath.startsWith('/')) {
            nodeWebhookPath = nodeWebhookPath.slice(1);
        }
        if (nodeWebhookPath.endsWith('/')) {
            nodeWebhookPath = nodeWebhookPath.slice(0, -1);
        }
        const isFullPath = workflow.expression.getSimpleParameterValue(node, webhookDescription.isFullPath, 'internal', additionalData.timezone, {}, undefined, false);
        const restartWebhook = workflow.expression.getSimpleParameterValue(node, webhookDescription.restartWebhook, 'internal', additionalData.timezone, {}, undefined, false);
        const path = getNodeWebhookPath(workflowId, node, nodeWebhookPath, isFullPath, restartWebhook);
        const httpMethod = workflow.expression.getSimpleParameterValue(node, webhookDescription.httpMethod, mode, additionalData.timezone, {}, undefined, 'GET');
        if (httpMethod === undefined) {
            console.error(`The webhook "${path}" for node "${node.name}" in workflow "${workflowId}" could not be added because the httpMethod is not defined.`);
            continue;
        }
        let webhookId;
        if ((path.startsWith(':') || path.includes('/:')) && node.webhookId) {
            webhookId = node.webhookId;
        }
        returnData.push({
            httpMethod: httpMethod.toString(),
            node: node.name,
            path,
            webhookDescription,
            workflowId,
            workflowExecuteAdditionalData: additionalData,
            webhookId,
        });
    }
    return returnData;
}
exports.getNodeWebhooks = getNodeWebhooks;
function getNodeWebhookPath(workflowId, node, path, isFullPath, restartWebhook) {
    let webhookPath = '';
    if (restartWebhook === true) {
        return path;
    }
    if (node.webhookId === undefined) {
        webhookPath = `${workflowId}/${encodeURIComponent(node.name.toLowerCase())}/${path}`;
    }
    else {
        if (isFullPath === true) {
            return path;
        }
        webhookPath = `${node.webhookId}/${path}`;
    }
    return webhookPath;
}
exports.getNodeWebhookPath = getNodeWebhookPath;
function getNodeWebhookUrl(baseUrl, workflowId, node, path, isFullPath) {
    if ((path.startsWith(':') || path.includes('/:')) && node.webhookId) {
        isFullPath = false;
    }
    if (path.startsWith('/')) {
        path = path.slice(1);
    }
    return `${baseUrl}/${getNodeWebhookPath(workflowId, node, path, isFullPath)}`;
}
exports.getNodeWebhookUrl = getNodeWebhookUrl;
function getNodeParametersIssues(nodePropertiesArray, node, pinDataNodeNames) {
    const foundIssues = {};
    let propertyIssues;
    if (node.disabled === true || (pinDataNodeNames === null || pinDataNodeNames === void 0 ? void 0 : pinDataNodeNames.includes(node.name))) {
        return null;
    }
    for (const nodeProperty of nodePropertiesArray) {
        propertyIssues = getParameterIssues(nodeProperty, node.parameters, '', node);
        mergeIssues(foundIssues, propertyIssues);
    }
    if (Object.keys(foundIssues).length === 0) {
        return null;
    }
    return foundIssues;
}
exports.getNodeParametersIssues = getNodeParametersIssues;
function nodeIssuesToString(issues, node) {
    const nodeIssues = [];
    if (issues.execution !== undefined) {
        nodeIssues.push('Execution Error.');
    }
    const objectProperties = ['parameters', 'credentials'];
    let issueText;
    let parameterName;
    for (const propertyName of objectProperties) {
        if (issues[propertyName] !== undefined) {
            for (parameterName of Object.keys(issues[propertyName])) {
                for (issueText of issues[propertyName][parameterName]) {
                    nodeIssues.push(issueText);
                }
            }
        }
    }
    if (issues.typeUnknown !== undefined) {
        if (node !== undefined) {
            nodeIssues.push(`Node Type "${node.type}" is not known.`);
        }
        else {
            nodeIssues.push('Node Type is not known.');
        }
    }
    return nodeIssues;
}
exports.nodeIssuesToString = nodeIssuesToString;
const validateResourceLocatorParameter = (value, parameterMode) => {
    var _a;
    const valueToValidate = ((_a = value === null || value === void 0 ? void 0 : value.value) === null || _a === void 0 ? void 0 : _a.toString()) || '';
    if (valueToValidate.startsWith('=')) {
        return [];
    }
    const validationErrors = [];
    if (parameterMode.validation) {
        for (const validation of parameterMode.validation) {
            if (validation && validation.type === 'regex') {
                const regexValidation = validation;
                const regex = new RegExp(`^${regexValidation.properties.regex}$`);
                if (!regex.test(valueToValidate)) {
                    validationErrors.push(regexValidation.properties.errorMessage);
                }
            }
        }
    }
    return validationErrors;
};
exports.validateResourceLocatorParameter = validateResourceLocatorParameter;
function addToIssuesIfMissing(foundIssues, nodeProperties, value) {
    if ((nodeProperties.type === 'string' && (value === '' || value === undefined)) ||
        (nodeProperties.type === 'multiOptions' && Array.isArray(value) && value.length === 0) ||
        (nodeProperties.type === 'dateTime' && value === undefined) ||
        (nodeProperties.type === 'options' && (value === '' || value === undefined)) ||
        (nodeProperties.type === 'resourceLocator' &&
            !(0, type_guards_1.isValidResourceLocatorParameterValue)(value))) {
        if (foundIssues.parameters === undefined) {
            foundIssues.parameters = {};
        }
        if (foundIssues.parameters[nodeProperties.name] === undefined) {
            foundIssues.parameters[nodeProperties.name] = [];
        }
        foundIssues.parameters[nodeProperties.name].push(`Parameter "${nodeProperties.displayName}" is required.`);
    }
}
exports.addToIssuesIfMissing = addToIssuesIfMissing;
function getParameterValueByPath(nodeValues, parameterName, path) {
    return (0, lodash_get_1.default)(nodeValues, path ? `${path}.${parameterName}` : parameterName);
}
exports.getParameterValueByPath = getParameterValueByPath;
function isINodeParameterResourceLocator(value) {
    return typeof value === 'object' && value !== null && 'value' in value && 'mode' in value;
}
function getParameterIssues(nodeProperties, nodeValues, path, node) {
    var _a;
    const foundIssues = {};
    if (nodeProperties.required === true) {
        if (displayParameterPath(nodeValues, nodeProperties, path, node)) {
            const value = getParameterValueByPath(nodeValues, nodeProperties.name, path);
            if (nodeProperties.typeOptions !== undefined &&
                nodeProperties.typeOptions.multipleValues !== undefined) {
                if (Array.isArray(value)) {
                    for (const singleValue of value) {
                        addToIssuesIfMissing(foundIssues, nodeProperties, singleValue);
                    }
                }
            }
            else {
                addToIssuesIfMissing(foundIssues, nodeProperties, value);
            }
        }
    }
    if (nodeProperties.type === 'resourceLocator') {
        if (displayParameterPath(nodeValues, nodeProperties, path, node)) {
            const value = getParameterValueByPath(nodeValues, nodeProperties.name, path);
            if (isINodeParameterResourceLocator(value)) {
                const mode = (_a = nodeProperties.modes) === null || _a === void 0 ? void 0 : _a.find((option) => option.name === value.mode);
                if (mode) {
                    const errors = (0, exports.validateResourceLocatorParameter)(value, mode);
                    errors.forEach((error) => {
                        if (foundIssues.parameters === undefined) {
                            foundIssues.parameters = {};
                        }
                        if (foundIssues.parameters[nodeProperties.name] === undefined) {
                            foundIssues.parameters[nodeProperties.name] = [];
                        }
                        foundIssues.parameters[nodeProperties.name].push(error);
                    });
                }
            }
        }
    }
    if (nodeProperties.options === undefined) {
        return foundIssues;
    }
    let basePath = path ? `${path}.` : '';
    const checkChildNodeProperties = [];
    if (nodeProperties.type === 'collection') {
        for (const option of nodeProperties.options) {
            checkChildNodeProperties.push({
                basePath,
                data: option,
            });
        }
    }
    else if (nodeProperties.type === 'fixedCollection') {
        basePath = basePath ? `${basePath}.` : `${nodeProperties.name}.`;
        let propertyOptions;
        for (propertyOptions of nodeProperties.options) {
            const value = getParameterValueByPath(nodeValues, propertyOptions.name, basePath.slice(0, -1));
            if (value === undefined) {
                continue;
            }
            if (nodeProperties.typeOptions !== undefined &&
                nodeProperties.typeOptions.multipleValues !== undefined) {
                if (Array.isArray(value)) {
                    for (let i = 0; i < value.length; i++) {
                        for (const option of propertyOptions.values) {
                            checkChildNodeProperties.push({
                                basePath: `${basePath}${propertyOptions.name}[${i}]`,
                                data: option,
                            });
                        }
                    }
                }
            }
            else {
                for (const option of propertyOptions.values) {
                    checkChildNodeProperties.push({
                        basePath: basePath + propertyOptions.name,
                        data: option,
                    });
                }
            }
        }
    }
    else {
        return foundIssues;
    }
    let propertyIssues;
    for (const optionData of checkChildNodeProperties) {
        propertyIssues = getParameterIssues(optionData.data, nodeValues, optionData.basePath, node);
        mergeIssues(foundIssues, propertyIssues);
    }
    return foundIssues;
}
exports.getParameterIssues = getParameterIssues;
function mergeIssues(destination, source) {
    if (source === null) {
        return;
    }
    if (source.execution === true) {
        destination.execution = true;
    }
    const objectProperties = ['parameters', 'credentials'];
    let destinationProperty;
    for (const propertyName of objectProperties) {
        if (source[propertyName] !== undefined) {
            if (destination[propertyName] === undefined) {
                destination[propertyName] = {};
            }
            let parameterName;
            for (parameterName of Object.keys(source[propertyName])) {
                destinationProperty = destination[propertyName];
                if (destinationProperty[parameterName] === undefined) {
                    destinationProperty[parameterName] = [];
                }
                destinationProperty[parameterName].push.apply(destinationProperty[parameterName], source[propertyName][parameterName]);
            }
        }
    }
    if (source.typeUnknown === true) {
        destination.typeUnknown = true;
    }
}
exports.mergeIssues = mergeIssues;
function mergeNodeProperties(mainProperties, addProperties) {
    let existingIndex;
    for (const property of addProperties) {
        existingIndex = mainProperties.findIndex((element) => element.name === property.name);
        if (existingIndex === -1) {
            mainProperties.push(property);
        }
        else {
            mainProperties[existingIndex] = property;
        }
    }
}
exports.mergeNodeProperties = mergeNodeProperties;
function getVersionedNodeType(object, version) {
    if ('nodeVersions' in object) {
        return object.getNodeType(version);
    }
    return object;
}
exports.getVersionedNodeType = getVersionedNodeType;
function getVersionedNodeTypeAll(object) {
    if ('nodeVersions' in object) {
        return Object.values(object.nodeVersions).map((element) => {
            element.description.name = object.description.name;
            return element;
        });
    }
    return [object];
}
exports.getVersionedNodeTypeAll = getVersionedNodeTypeAll;
//# sourceMappingURL=NodeHelpers.js.map