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
exports.IopResponse = exports.IopRequest = exports.IopClient = void 0;
const axios_1 = __importDefault(require("axios"));
const crypto = __importStar(require("crypto"));
const os = __importStar(require("os"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const form_data_1 = __importDefault(require("form-data"));
const P_SDK_VERSION = "iop44-sdk-typescript-20231021";
const P_APPKEY = "app_key";
const P_ACCESS_TOKEN = "session";
const P_TIMESTAMP = "timestamp";
const P_SIGN = "sign";
const P_SIGN_METHOD = "sign_method";
const P_PARTNER_ID = "partner_id";
const P_METHOD = "method";
const P_DEBUG = "debug";
const P_SIMPLIFY = "simplify";
const P_FORMAT = "format";
const P_CODE = 'code';
const P_TYPE = 'type';
const P_MESSAGE = 'message';
const P_REQUEST_ID = 'request_id';
const P_LOG_LEVEL_DEBUG = "DEBUG";
const P_LOG_LEVEL_INFO = "INFO";
const P_LOG_LEVEL_ERROR = "ERROR";
function sign(secret, api, parameters) {
    const sortedParams = Object.keys(parameters).sort();
    let parametersStr;
    if (api.includes("/")) {
        parametersStr = `${api}${sortedParams.map(key => `${key}${parameters[key]}`).join('')}`;
    }
    else {
        parametersStr = sortedParams.map(key => `${key}${parameters[key]}`).join('');
    }
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(parametersStr);
    return hmac.digest('hex').toUpperCase();
}
function mixStr(pstr) {
    if (typeof pstr === 'string') {
        return pstr;
    }
    else {
        return String(pstr);
    }
}
function logApiError(appkey, sdkVersion, requestUrl, code, message) {
    const localIp = 'unknown';
    const platformType = `${process.platform}-${process.arch}`;
    const logMessage = `${appkey}^_^${sdkVersion}^_^${new Date().toISOString()}^_^${localIp}^_^${platformType}^_^${requestUrl}^_^${code}^_^${message}`;
    const homeDir = os.homedir();
    const logDir = path.join(homeDir, 'logs');
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir);
    }
    const logFile = path.join(logDir, `iopsdk.log.${new Date().toISOString().split('T')[0]}`);
    fs.appendFileSync(logFile, logMessage + '\n');
}
class IopRequest {
    constructor(api_name, http_method = 'POST') {
        this._api_params = {};
        this._file_params = {};
        this._simplify = "false";
        this._format = "json";
        this._api_name = api_name;
        this._http_method = http_method;
    }
    add_api_param(key, value) {
        this._api_params[key] = value;
    }
    add_file_param(key, value) {
        this._file_params[key] = value;
    }
    set_simplify() {
        this._simplify = "true";
    }
    set_format(value) {
        this._format = value;
    }
    get api_name() {
        return this._api_name;
    }
    get http_method() {
        return this._http_method;
    }
    get api_params() {
        return this._api_params;
    }
    get file_params() {
        return this._file_params;
    }
    get simplify() {
        return this._simplify;
    }
    get format() {
        return this._format;
    }
}
exports.IopRequest = IopRequest;
class IopResponse {
    constructor() {
        this.type = null;
        this.code = null;
        this.message = null;
        this.request_id = null;
        this.body = null;
    }
    toString() {
        return `type=${mixStr(this.type)} code=${mixStr(this.code)} message=${mixStr(this.message)} requestId=${mixStr(this.request_id)}`;
    }
}
exports.IopResponse = IopResponse;
class IopClient {
    constructor(server_url, app_key, app_secret, timeout = 30000) {
        this.log_level = P_LOG_LEVEL_ERROR;
        this._server_url = server_url;
        this._app_key = app_key;
        this._app_secret = app_secret;
        this._timeout = timeout;
    }
    async execute(request, access_token = null) {
        const sys_parameters = {
            [P_APPKEY]: this._app_key,
            [P_SIGN_METHOD]: "sha256",
            [P_TIMESTAMP]: String(Math.floor(Date.now() / 1000)) + '000',
            [P_PARTNER_ID]: P_SDK_VERSION,
            [P_METHOD]: request.api_name,
            [P_SIMPLIFY]: request.simplify,
            [P_FORMAT]: request.format
        };
        if (this.log_level === P_LOG_LEVEL_DEBUG) {
            sys_parameters[P_DEBUG] = 'true';
        }
        if (access_token) {
            sys_parameters[P_ACCESS_TOKEN] = access_token;
        }
        const application_parameter = request.api_params;
        const sign_parameter = { ...sys_parameters, ...application_parameter };
        sign_parameter[P_SIGN] = sign(this._app_secret, request.api_name, sign_parameter);
        const api_url = this._server_url;
        const full_url = `${api_url}?${Object.entries(sign_parameter).map(([key, value]) => `${key}=${value}`).join('&')}`;
        try {
            let r;
            if (request.http_method === 'POST' || Object.keys(request.file_params).length !== 0) {
                const formData = new form_data_1.default();
                Object.entries(sign_parameter).forEach(([key, value]) => formData.append(key, value));
                Object.entries(request.file_params).forEach(([key, value]) => formData.append(key, value));
                r = await axios_1.default.post(api_url, formData, {
                    headers: formData.getHeaders(),
                    timeout: this._timeout
                });
            }
            else {
                r = await axios_1.default.get(api_url, { params: sign_parameter, timeout: this._timeout });
            }
            const response = new IopResponse();
            const jsonobj = r.data;
            if (P_CODE in jsonobj)
                response.code = jsonobj[P_CODE];
            if (P_TYPE in jsonobj)
                response.type = jsonobj[P_TYPE];
            if (P_MESSAGE in jsonobj)
                response.message = jsonobj[P_MESSAGE];
            if (P_REQUEST_ID in jsonobj)
                response.request_id = jsonobj[P_REQUEST_ID];
            if (response.code !== null && response.code !== "0") {
                logApiError(this._app_key, P_SDK_VERSION, full_url, response.code, response.message || '');
            }
            else if (this.log_level === P_LOG_LEVEL_DEBUG || this.log_level === P_LOG_LEVEL_INFO) {
                logApiError(this._app_key, P_SDK_VERSION, full_url, "", "");
            }
            response.body = jsonobj;
            return response;
        }
        catch (err) {
            logApiError(this._app_key, P_SDK_VERSION, full_url, "HTTP_ERROR", err instanceof Error ? err.message : String(err));
            throw err;
        }
    }
}
exports.IopClient = IopClient;
