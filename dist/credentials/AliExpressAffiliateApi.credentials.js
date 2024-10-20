"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AliExpressAffiliateApi = void 0;
class AliExpressAffiliateApi {
    constructor() {
        this.name = 'aliExpressAffiliateApi';
        this.displayName = 'AliExpress Affiliate API';
        this.properties = [
            {
                displayName: 'API Key',
                name: 'apiKey',
                type: 'string',
                default: '',
            },
            {
                displayName: 'API Secret',
                name: 'apiSecret',
                type: 'string',
                default: '',
            },
            {
                displayName: 'Tracking ID',
                name: 'trackingId',
                type: 'string',
                default: '',
            },
        ];
    }
}
exports.AliExpressAffiliateApi = AliExpressAffiliateApi;
