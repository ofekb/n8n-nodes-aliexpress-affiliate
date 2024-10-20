import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class AliExpressAffiliateApi implements ICredentialType {
	name = 'aliExpressAffiliateApi';
	displayName = 'AliExpress Affiliate API';
	properties: INodeProperties[] = [
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