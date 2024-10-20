"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeApiError = exports.NodeOperationError = exports.ExecutionBaseError = void 0;
const xml2js_1 = require("xml2js");
const ERROR_MESSAGE_PROPERTIES = [
    'cause',
    'error',
    'message',
    'Message',
    'msg',
    'messages',
    'description',
    'reason',
    'detail',
    'details',
    'errors',
    'errorMessage',
    'errorMessages',
    'ErrorMessage',
    'error_message',
    '_error_message',
    'errorDescription',
    'error_description',
    'error_summary',
    'title',
    'text',
    'field',
    'err',
    'type',
];
const ERROR_STATUS_PROPERTIES = [
    'statusCode',
    'status',
    'code',
    'status_code',
    'errorCode',
    'error_code',
];
const ERROR_NESTING_PROPERTIES = ['error', 'err', 'response', 'body', 'data'];
class ExecutionBaseError extends Error {
    constructor(message, { cause }) {
        const options = cause instanceof Error ? { cause } : {};
        super(message, options);
        this.context = {};
        this.name = this.constructor.name;
        this.timestamp = Date.now();
        if (cause instanceof ExecutionBaseError) {
            this.context = cause.context;
        }
        else if (cause && !(cause instanceof Error)) {
            this.cause = cause;
        }
    }
    toJSON() {
        return {
            message: this.message,
            lineNumber: this.lineNumber,
            timestamp: this.timestamp,
            name: this.name,
            description: this.description,
            context: this.context,
            cause: this.cause,
        };
    }
}
exports.ExecutionBaseError = ExecutionBaseError;
class NodeError extends ExecutionBaseError {
    constructor(node, error) {
        const message = error instanceof Error ? error.message : '';
        super(message, { cause: error });
        this.node = node;
    }
    findProperty(jsonError, potentialKeys, traversalKeys = []) {
        for (const key of potentialKeys) {
            const value = jsonError[key];
            if (value) {
                if (typeof value === 'string')
                    return value;
                if (typeof value === 'number')
                    return value.toString();
                if (Array.isArray(value)) {
                    const resolvedErrors = value
                        .map((jsonError) => {
                        if (typeof jsonError === 'string')
                            return jsonError;
                        if (typeof jsonError === 'number')
                            return jsonError.toString();
                        if (this.isTraversableObject(jsonError)) {
                            return this.findProperty(jsonError, potentialKeys);
                        }
                        return null;
                    })
                        .filter((errorValue) => errorValue !== null);
                    if (resolvedErrors.length === 0) {
                        return null;
                    }
                    return resolvedErrors.join(' | ');
                }
                if (this.isTraversableObject(value)) {
                    const property = this.findProperty(value, potentialKeys);
                    if (property) {
                        return property;
                    }
                }
            }
        }
        for (const key of traversalKeys) {
            const value = jsonError[key];
            if (this.isTraversableObject(value)) {
                const property = this.findProperty(value, potentialKeys, traversalKeys);
                if (property) {
                    return property;
                }
            }
        }
        return null;
    }
    isTraversableObject(value) {
        return (value &&
            typeof value === 'object' &&
            !Array.isArray(value) &&
            !!Object.keys(value).length);
    }
    removeCircularRefs(obj, seen = new Set()) {
        seen.add(obj);
        Object.entries(obj).forEach(([key, value]) => {
            if (this.isTraversableObject(value)) {
                seen.has(value)
                    ? (obj[key] = { circularReference: true })
                    : this.removeCircularRefs(value, seen);
                return;
            }
            if (Array.isArray(value)) {
                value.forEach((val, index) => {
                    if (seen.has(val)) {
                        value[index] = { circularReference: true };
                        return;
                    }
                    if (this.isTraversableObject(val)) {
                        this.removeCircularRefs(val, seen);
                    }
                });
            }
        });
    }
}
class NodeOperationError extends NodeError {
    constructor(node, error, options = {}) {
        if (typeof error === 'string') {
            error = new Error(error);
        }
        super(node, error);
        if (options.message) {
            this.message = options.message;
        }
        this.description = options.description;
        this.context.runIndex = options.runIndex;
        this.context.itemIndex = options.itemIndex;
    }
}
exports.NodeOperationError = NodeOperationError;
const STATUS_CODE_MESSAGES = {
    '4XX': 'Your request is invalid or could not be processed by the service',
    '400': 'Bad request - please check your parameters',
    '401': 'Authorization failed - please check your credentials',
    '402': 'Payment required - perhaps check your payment details?',
    '403': 'Forbidden - perhaps check your credentials?',
    '404': 'The resource you are requesting could not be found',
    '405': 'Method not allowed - please check you are using the right HTTP method',
    '429': 'The service is receiving too many requests from you! Perhaps take a break?',
    '5XX': 'The service failed to process your request',
    '500': 'The service was not able to process your request',
    '502': 'Bad gateway - the service failed to handle your request',
    '503': 'Service unavailable - perhaps try again later?',
    '504': 'Gateway timed out - perhaps try again later?',
    ECONNREFUSED: 'The service refused the connection - perhaps it is offline',
};
const UNKNOWN_ERROR_MESSAGE = 'UNKNOWN ERROR - check the detailed error for more information';
const UNKNOWN_ERROR_MESSAGE_CRED = 'UNKNOWN ERROR';
class NodeApiError extends NodeError {
    constructor(node, error, { message, description, httpCode, parseXml, runIndex, itemIndex } = {}) {
        super(node, error);
        if (error.error) {
            this.removeCircularRefs(error.error);
        }
        if (error.reason) {
            const reason = error.reason;
            if (reason.isAxiosError && reason.response) {
                error = reason.response;
            }
        }
        if (message) {
            this.message = message;
            this.description = description;
            this.httpCode = httpCode !== null && httpCode !== void 0 ? httpCode : null;
            return;
        }
        this.httpCode = this.findProperty(error, ERROR_STATUS_PROPERTIES, ERROR_NESTING_PROPERTIES);
        this.setMessage();
        if (parseXml) {
            this.setDescriptionFromXml(error.error);
            return;
        }
        this.description = this.findProperty(error, ERROR_MESSAGE_PROPERTIES, ERROR_NESTING_PROPERTIES);
        if (runIndex !== undefined)
            this.context.runIndex = runIndex;
        if (itemIndex !== undefined)
            this.context.itemIndex = itemIndex;
    }
    setDescriptionFromXml(xml) {
        (0, xml2js_1.parseString)(xml, { explicitArray: false }, (_, result) => {
            if (!result)
                return;
            const topLevelKey = Object.keys(result)[0];
            this.description = this.findProperty(result[topLevelKey], ERROR_MESSAGE_PROPERTIES, ['Error'].concat(ERROR_NESTING_PROPERTIES));
        });
    }
    setMessage() {
        if (!this.httpCode) {
            this.httpCode = null;
            this.message = UNKNOWN_ERROR_MESSAGE;
            return;
        }
        if (STATUS_CODE_MESSAGES[this.httpCode]) {
            this.message = STATUS_CODE_MESSAGES[this.httpCode];
            return;
        }
        switch (this.httpCode.charAt(0)) {
            case '4':
                this.message = STATUS_CODE_MESSAGES['4XX'];
                break;
            case '5':
                this.message = STATUS_CODE_MESSAGES['5XX'];
                break;
            default:
                this.message = UNKNOWN_ERROR_MESSAGE;
        }
        if (this.node.type === 'n8n-nodes-base.noOp' && this.message === UNKNOWN_ERROR_MESSAGE) {
            this.message = `${UNKNOWN_ERROR_MESSAGE_CRED} - ${this.httpCode}`;
        }
    }
}
exports.NodeApiError = NodeApiError;
//# sourceMappingURL=NodeErrors.js.map