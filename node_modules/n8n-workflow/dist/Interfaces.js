"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OAuth2GrantType = exports.ICredentialsHelper = exports.ICredentials = void 0;
class ICredentials {
    constructor(nodeCredentials, type, nodesAccess, data) {
        var _a;
        this.id = (_a = nodeCredentials.id) !== null && _a !== void 0 ? _a : undefined;
        this.name = nodeCredentials.name;
        this.type = type;
        this.nodesAccess = nodesAccess;
        this.data = data;
    }
}
exports.ICredentials = ICredentials;
class ICredentialsHelper {
    constructor(encryptionKey) {
        this.encryptionKey = encryptionKey;
    }
}
exports.ICredentialsHelper = ICredentialsHelper;
var OAuth2GrantType;
(function (OAuth2GrantType) {
    OAuth2GrantType["authorizationCode"] = "authorizationCode";
    OAuth2GrantType["clientCredentials"] = "clientCredentials";
})(OAuth2GrantType = exports.OAuth2GrantType || (exports.OAuth2GrantType = {}));
//# sourceMappingURL=Interfaces.js.map