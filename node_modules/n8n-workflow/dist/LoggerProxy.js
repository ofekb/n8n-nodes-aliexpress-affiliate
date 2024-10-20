"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.warn = exports.verbose = exports.error = exports.info = exports.debug = exports.log = exports.getInstance = exports.init = void 0;
let logger;
function init(loggerInstance) {
    logger = loggerInstance;
    return loggerInstance;
}
exports.init = init;
function getInstance() {
    if (logger === undefined) {
        throw new Error('LoggerProxy not initialized');
    }
    return logger;
}
exports.getInstance = getInstance;
function log(type, message, meta = {}) {
    getInstance().log(type, message, meta);
}
exports.log = log;
function debug(message, meta = {}) {
    getInstance().log('debug', message, meta);
}
exports.debug = debug;
function info(message, meta = {}) {
    getInstance().log('info', message, meta);
}
exports.info = info;
function error(message, meta = {}) {
    getInstance().log('error', message, meta);
}
exports.error = error;
function verbose(message, meta = {}) {
    getInstance().log('verbose', message, meta);
}
exports.verbose = verbose;
function warn(message, meta = {}) {
    getInstance().log('warn', message, meta);
}
exports.warn = warn;
//# sourceMappingURL=LoggerProxy.js.map