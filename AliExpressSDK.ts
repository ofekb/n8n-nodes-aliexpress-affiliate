import axios, { AxiosResponse, AxiosError } from 'axios';
import * as crypto from 'crypto';
import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';
import FormData from 'form-data';


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

function sign(secret: string, api: string, parameters: Record<string, string>): string {
    const sortedParams = Object.keys(parameters).sort();
    let parametersStr: string;
    
    if (api.includes("/")) {
        parametersStr = `${api}${sortedParams.map(key => `${key}${parameters[key]}`).join('')}`;
    } else {
        parametersStr = sortedParams.map(key => `${key}${parameters[key]}`).join('');
    }

    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(parametersStr);
    return hmac.digest('hex').toUpperCase();
}

function mixStr(pstr: any): string {
    if (typeof pstr === 'string') {
        return pstr;
    } else {
        return String(pstr);
    }
}

function logApiError(appkey: string, sdkVersion: string, requestUrl: string, code: string, message: string): void {
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
    private _api_params: Record<string, string> = {};
    private _file_params: Record<string, any> = {};
    private _api_name: string;
    private _http_method: string;
    private _simplify: string = "false";
    private _format: string = "json";

    constructor(api_name: string, http_method: string = 'POST') {
        this._api_name = api_name;
        this._http_method = http_method;
    }

    add_api_param(key: string, value: any): void {
        this._api_params[key] = value;
    }

    add_file_param(key: string, value: any): void {
        this._file_params[key] = value;
    }

    set_simplify(): void {
        this._simplify = "true";
    }

    set_format(value: string): void {
        this._format = value;
    }

    get api_name(): string {
        return this._api_name;
    }

    get http_method(): string {
        return this._http_method;
    }

    get api_params(): Record<string, string> {
        return this._api_params;
    }

    get file_params(): Record<string, any> {
        return this._file_params;
    }

    get simplify(): string {
        return this._simplify;
    }

    get format(): string {
        return this._format;
    }
}

class IopResponse {
    type: string | null = null;
    code: string | null = null;
    message: string | null = null;
    request_id: string | null = null;
    body: any = null;

    toString(): string {
        return `type=${mixStr(this.type)} code=${mixStr(this.code)} message=${mixStr(this.message)} requestId=${mixStr(this.request_id)}`;
    }
}

class IopClient {
    private _server_url: string;
    private _app_key: string;
    private _app_secret: string;
    private _timeout: number;
    log_level: string = P_LOG_LEVEL_ERROR;

    constructor(server_url: string, app_key: string, app_secret: string, timeout: number = 30000) {
        this._server_url = server_url;
        this._app_key = app_key;
        this._app_secret = app_secret;
        this._timeout = timeout;
    }

    async execute(request: IopRequest, access_token: string | null = null): Promise<IopResponse> {
        const sys_parameters: Record<string, string> = {
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
            let r: AxiosResponse;
            if (request.http_method === 'POST' || Object.keys(request.file_params).length !== 0) {
                const formData = new FormData();
                Object.entries(sign_parameter).forEach(([key, value]) => formData.append(key, value));
                Object.entries(request.file_params).forEach(([key, value]) => formData.append(key, value));
                r = await axios.post(api_url, formData, { 
                    headers: formData.getHeaders(),
                    timeout: this._timeout 
                });
            } else {
                r = await axios.get(api_url, { params: sign_parameter, timeout: this._timeout });
            }
    
            const response = new IopResponse();
            const jsonobj = r.data;
    
            if (P_CODE in jsonobj) response.code = jsonobj[P_CODE];
            if (P_TYPE in jsonobj) response.type = jsonobj[P_TYPE];
            if (P_MESSAGE in jsonobj) response.message = jsonobj[P_MESSAGE];
            if (P_REQUEST_ID in jsonobj) response.request_id = jsonobj[P_REQUEST_ID];
    
            if (response.code !== null && response.code !== "0") {
                logApiError(this._app_key, P_SDK_VERSION, full_url, response.code, response.message || '');
            } else if (this.log_level === P_LOG_LEVEL_DEBUG || this.log_level === P_LOG_LEVEL_INFO) {
                logApiError(this._app_key, P_SDK_VERSION, full_url, "", "");
            }
    
            response.body = jsonobj;
            return response;
        } catch (err) {
            logApiError(this._app_key, P_SDK_VERSION, full_url, "HTTP_ERROR", err instanceof Error ? err.message : String(err));
            throw err;
        }
        
}
}

export { IopClient, IopRequest, IopResponse };