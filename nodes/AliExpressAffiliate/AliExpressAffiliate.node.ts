import {
    IExecuteFunctions,
    INodeExecutionData,
    INodeType,
    INodeTypeDescription,
    IDataObject,
} from 'n8n-workflow';
import { IopClient, IopRequest } from '../../AliExpressSDK';

export class AliExpressAffiliate implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'AliExpress Affiliate',
        name: 'aliExpressAffiliate',
        icon: 'file:aliexpress.svg',
        group: ['transform'],
        version: 1,
        subtitle: '={{$parameter["operation"]}}',
        description: 'Use the AliExpress Affiliate API',
        defaults: {
            name: 'AliExpress Affiliate',
            color: '#e74c3c',
        },
        inputs: ['main'],
        outputs: ['main'],
        credentials: [
            {
                name: 'aliExpressAffiliateApi',
                required: true,
            },
        ],
        properties: [
            {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                options: [
					{
                        name: 'Generate Affiliate Link',
                        value: 'generateAffiliateLink',
                        description: 'Generate an affiliate link',
                    },
					{
                        name: 'Get Categories',
                        value: 'getCategories',
                        description: 'Get list of categories',
                    },
					{
						name: 'Get FeaturedPromo Info',
						value: 'getFeaturedPromoInfo',
						description: 'get featuredpromo info'
					},
					{
						name: 'Get FeaturedPromo Product',
						value: 'getFeaturedPromoProduct',
						description: 'get featuredpromo product'
					},
					{
						name: 'Get HotProduct Download',
						value: 'getHotProductDownload',
						description: 'get hotproduct download'
					},
					{
                        name: 'Get Hot Products',
                        value: 'getHotProducts',
                        description: 'Get hot products',
                    },
                    {
                        name: 'Get Order Info',
                        value: 'getOrderInfo',
                        description: 'Get order information',
                    },
                    {
                        name: 'Get Order List',
                        value: 'getOrderList',
                        description: 'Get orders list',
                    },
					{
                        name: 'Get Order List By Index',
                        value: 'getOrderListByIndex',
                        description: 'Get orders list by index',
                    },
                    {
                        name: 'Get ProductDetail Info',
                        value: 'getProductDetailInfo',
                        description: 'get productdetail info',
                    },
                    {
                        name: 'Get Products',
                        value: 'getProducts',
                        description: 'get products',
                    },
                ],
                default: 'generateAffiliateLink',
                noDataExpression: true,
            },
			{
				displayName: 'Promotion Link Type',
				name: 'promotion_link_type',
				type: 'number',
				default: 0,
				required: true,
				displayOptions: {
					show: {
						operation: [
							'generateAffiliateLink',
						],
					},
				},
				description: 'Promotion link type: 0 for normal link which has standard commission, and 2 for hot link which has hot product commission',
			},
			{
				displayName: 'Source Values',
				name: 'source_values',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						operation: [
							'generateAffiliateLink',
						],
					},
				},
				description: 'Original link or value',
			},
			{
				displayName: 'Tracking ID',
				name: 'tracking_id',
				type: 'string',
				default: '',
				required: false,
				description: 'Your trackingID',
			},
			{
				displayName: 'Category ID',
				name: 'category_id',
				type: 'string',
				default: '',
				required: false,
				displayOptions: {
					show: {
						operation: [
							'getFeaturedPromoProduct',
							'getHotProductDownload',
						],
					},
				},
				description: 'Category ID, you can get category ID via "get category" API https://developers.aliexpress.com/en/doc.htm?docId=45801&docType=2',
			},
			{
				displayName: 'Category IDs',
				name: 'category_ids',
				type: 'string',
				default: '',
				required: false,
				displayOptions: {
					show: {
						operation: [

							'getHotProducts',
							'getProducts'
						],
					},
				},
				description: 'List of category ID, you can get category ID ("111,222,333") via "get category" API https://developers.aliexpress.com/en/doc.htm?docId=45801&docType=2',
			},
			{
				displayName: 'Fields',
				name: 'fields',
				type: 'string',
				default: '',
				required: false,
				displayOptions: {
					show: {
						operation: [
							'getFeaturedPromoProduct',
							'getHotProductDownload',
							'getHotProducts',
							'getProducts',
							'getOrderInfo',
							'getProductDetailInfo'
						],
					},
				},
				description: 'Respond parameter list. eg: commission_rate, sale_price',
			},
			{
				displayName: 'Page No',
				name: 'page_no',
				type: 'number',
				default: 1,
				required: false,
				displayOptions: {
					show: {
						operation: [
							'getFeaturedPromoProduct',
							'getHotProductDownload',
							'getHotProducts',
							'getOrderList',
							'getOrderListByIndex',
							'getProducts',
						],
					},
				},
				description: 'Page number',
			},
			{
				displayName: 'Page Size',
				name: 'page_size',
				type: 'number',
				default: 10,
				required: false,
				displayOptions: {
					show: {
						operation: [
							'getFeaturedPromoProduct',
							'getHotProductDownload',
							'getHotProducts',
							'getOrderList',
							'getOrderListByIndex',
							'getProducts',
						],
					},
				},
				description: 'Record count of each page, 1 - 50',
			},
			{
				displayName: 'Locale Site',
				name: 'locale_site',
				type: 'string',
				default: 'global',
				required: false,
				displayOptions: {
					show: {
						operation: [
							'getHotProductDownload',
							'getOrderList',
						],
					},
				},
				description: 'Local site: global, it_site, es_site, ru_site',
			},
			{
				displayName: 'Target Currency',
				name: 'target_currency',
				type: 'string',
				default: 'USD',
				required: false,
				displayOptions: {
					show: {
						operation: [
							'getFeaturedPromoProduct',
							'getHotProductDownload',
							'getHotProducts',
							'getProducts',
							'getProductDetailInfo',
						],
					},
				},
				description: 'Target Currency: USD, GBP, CAD, EUR, UAH, MXN, TRY, RUB, BRL, AUD, INR, JPY, IDR, SEK, KRW, ILS, THB, CLP, VND',
			},
			{
				displayName: 'Target Language',
				name: 'target_language',
				type: 'string',
				default: 'EN',
				required: false,
				displayOptions: {
					show: {
						operation: [
							'getFeaturedPromoProduct',
							'getHotProductDownload',
							'getHotProducts',
							'getProducts',
							'getProductDetailInfo',
						],
					},
				},
				description: 'Target Language: EN, RU, PT, ES, FR, ID, IT, TH, JA, AR, VI, TR, DE, HE, KO, NL, PL, MX, CL, IN',
			},
			{
				displayName: 'Country',
				name: 'country',
				type: 'string',
				default: '',
				required: false,
				displayOptions: {
					show: {
						operation: [
							'getFeaturedPromoProduct',
							'getHotProductDownload',
							'getHotProducts',
							'getProductDetailInfo',
						],
					},
				},
				description: 'The Ship to country. Filter products that can be sent to that country; Returns the price according to the country’s tax rate policy',
			},
			{
				displayName: 'Keywords',
				name: 'keywords',
				type: 'string',
				default: '',
				required: false,
				displayOptions: {
					show: {
						operation: [
							'getHotProducts',
							'getProducts',
						],
					},
				},
				description: 'Filter products by keywords. eg: mp3',
			},
			{
				displayName: 'Sort',
				name: 'sort',
				type: 'string',
				default: '',
				required: false,
				displayOptions: {
					show: {
						operation: [
							'getFeaturedPromoProduct',
							'getHotProducts',
							'getProducts',
						],
					},
				},
				description: 'Sort by: SALE_PRICE_ASC, SALE_PRICE_DESC, LAST_VOLUME_ASC, LAST_VOLUME_DESC, etc.',
			},
			{
				displayName: 'Order Status',
				name: 'status',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						operation: [
							'getOrderList',
							'getOrderListByIndex',
						],
					},
				},
				description: 'Order status: Payment Completed, Buyer Confirmed Receipt, Completed Settlement, Invalid',
			},
			{
				displayName: 'Order IDs',
				name: 'order_ids',
				type: 'string',
				default: '',
				required: false,
				displayOptions: {
					show: {
						operation: [
							'getOrderInfo',
						],
					},
				},
				description: 'Order ID list, separated by comma. Query by sub order id is supported',
			},
			{
				displayName: 'Time Type',
				name: 'time_type',
				type: 'string',
				default: '',
				required: false,
				displayOptions: {
					show: {
						operation: [
							'getOrderList',
							'getOrderListByIndex',
						],
					},
				},
				description: 'The type of time you are querying: Payment Completed Time, Buyer Confirmed Receipt Time, Completed Settlement Time',
			},
			{
				displayName: 'Start Time',
				name: 'start_time',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						operation: [
							'getOrderList',
							'getOrderListByIndex',
						],
					},
				},
				description: 'Start time, PST time',
			},
			{
				displayName: 'End Time',
				name: 'end_time',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						operation: [
							'getOrderList',
							'getOrderListByIndex',
						],
					},
				},
				description: 'End time, PST time',
			},
			{
				displayName: 'Start Query Index ID',
				name: 'start_query_index_id',
				type: 'string',
				default: '',
				required: false,
				displayOptions: {
					show: {
						operation: [
							'getOrderListByIndex',
						],
					},
				},
				description: 'Query index start value: if not passed, You can only check the first page',
			},
			{
				displayName: 'Product IDs',
				name: 'product_ids',
				type: 'string',
				default: '',
				required: false,
				displayOptions: {
					show: {
						operation: [
							'getProductDetailInfo',
						],
					},
				},
				description: 'Product ids',
			},
			{
				displayName: 'Promotion Name',
				name: 'promotion_name',
				type: 'string',
				default: '',
				required: false,
				displayOptions: {
					show: {
						operation: [
							'getFeaturedPromoProduct',
						],
					},
				},
				description: 'Promotion name, eg. "Hot Product", "New Arrival", etc.',
			},
			{
				displayName: 'Promotion Start Time',
				name: 'promotion_start_time',
				type: 'string',
				default: '',
				required: false,
				displayOptions: {
					show: {
						operation: [
							'getFeaturedPromoProduct',
						],
					},
				},
				description: 'Start time of promotion, PST time',
			},
			{
				displayName: 'Promotion End Time',
				name: 'promotion_end_time',
				type: 'string',
				default: '',
				required: false,
				displayOptions: {
					show: {
						operation: [
							'getFeaturedPromoProduct',
						],
					},
				},
				description: 'End time of promotion, PST time',
			},
			{
				displayName: 'Max Sale Price',
				name: 'max_sale_price',
				type: 'number',
				default: 0,
				required: false,
				displayOptions: {
					show: {
						operation: [
							'getHotProducts',
							'getProducts',
						],
					},
				},
				description: 'Filter products by highest price, unit cent',
			},
			{
				displayName: 'Min Sale Price',
				name: 'min_sale_price',
				type: 'number',
				default: 0,
				required: false,
				displayOptions: {
					show: {
						operation: [
							'getHotProducts',
							'getProducts',
						],
					},
				},
				description: 'Filter products by lowest price, unit cent',
			},
			{
				displayName: 'Platform Product Type',
				name: 'platform_product_type',
				type: 'string',
				default: 'ALL',
				required: false,
				displayOptions: {
					show: {
						operation: [
							'getHotProducts',
							'getProducts',
						],
					},
				},
				description: 'Product type: ALL, PLAZA, TMALL',
			},
			{
				displayName: 'Delivery Days',
				name: 'delivery_days',
				type: 'string',
				default: '',
				required: false,
				displayOptions: {
					show: {
						operation: [
							'getHotProducts',
							'getProducts',
						],
					},
				},
				description: 'Estimated delivery days. 3: in 3 days, 5: in 5 days, etc.',
			},
			{
				displayName: 'Ship to Country',
				name: 'ship_to_country',
				type: 'string',
				default: '',
				required: false,
				displayOptions: {
					show: {
						operation: [
							'getHotProducts',
							'getProducts',
							'getProductDetailInfo',
						],
					},
				},
				description: 'The Ship to country. Filter products that can be sent to that country',
			},			
        ],
    };

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
	
		try {
			const credentials = await this.getCredentials('aliExpressAffiliateApi');
			
			if (!credentials) {
				throw new Error('No credentials returned!');
			}
	
			console.log('Credentials:', JSON.stringify(credentials, null, 2));
	
			const apiKey = credentials.apiKey as string;
			const apiSecret = credentials.apiSecret as string;
			const defaultTrackingId = credentials.trackingId as string; // Tracking ID from credentials
	
			if (!apiKey || !apiSecret) {
				throw new Error('Missing required credential fields');
			}
	
			const client = new IopClient(
				'https://api-sg.aliexpress.com/sync',
				apiKey,
				apiSecret
			);
	
			for (let i = 0; i < items.length; i++) {
				const operation = this.getNodeParameter('operation', i) as string;
				const request = new IopRequest(AliExpressAffiliate.getAliExpressMethod(operation));
				
				await AliExpressAffiliate.addParametersToRequest(this, request, operation, i); // Add await here for async
	
				// Get trackingId from parameters, if not provided use the one from credentials
				let trackingId = this.getNodeParameter('trackingId', i, '') as string; // Default to empty string
				if (!trackingId) {
					trackingId = defaultTrackingId; // Use trackingId from credentials if not provided
				}
	
				request.add_api_param('tracking_id', trackingId);
	
				try {
					const response = await client.execute(request);
					console.log("Full response:", JSON.stringify(response, null, 2));
	
					if (response.body) {
						returnData.push({ json: response.body });
					} else {
						throw new Error('Unexpected API response structure');
					}
				} catch (error: unknown) {
					console.error("Error executing request:", error);
					if (this.continueOnFail()) {
						returnData.push({ json: { error: error instanceof Error ? error.message : String(error) } });
					} else {
						throw error instanceof Error ? error : new Error(String(error));
					}
				}
			}
		} catch (error) {
			console.error('Error in execute function:', error);
			throw error;
		}
	
		return [returnData];
	}
	

	private static getAliExpressMethod(operation: string): string {
		const methodMap: { [key: string]: string } = {
			getProducts: 'aliexpress.affiliate.product.query',
			getHotProducts: 'aliexpress.affiliate.hotproduct.query',
			getProductDetailInfo: 'aliexpress.affiliate.productdetail.get',
			generateAffiliateLink: 'aliexpress.affiliate.link.generate',
			getCategories: 'aliexpress.affiliate.category.get',
			getOrders: 'aliexpress.affiliate.order.list',
			getReport: 'aliexpress.affiliate.report.get',
			getFeaturedPromoProduct: 'aliexpress.affiliate.featuredpromo.products.get',
			getHotProductDownload: 'aliexpress.affiliate.hotproduct.download',
			getOrderInfo: 'aliexpress.affiliate.order.get',
			getOrderListByIndex: 'aliexpress.affiliate.order.listbyindex',
			getOrderList: 'aliexpress.affiliate.order.list',
			getFeaturedPromoInfo: 'aliexpress.affiliate.featuredpromo.info.get',
		};
		return methodMap[operation] || '';
	}
	
	private static async addParametersToRequest(executeFunctions: IExecuteFunctions, request: IopRequest, operation: string, itemIndex: number): Promise<void> {
		switch (operation) {
			case 'getProducts':
				request.add_api_param('keywords', executeFunctions.getNodeParameter('keywords', itemIndex) as string);
				request.add_api_param('category_ids', executeFunctions.getNodeParameter('category_ids', itemIndex) as string);
				request.add_api_param('min_sale_price', executeFunctions.getNodeParameter('min_sale_price', itemIndex) as number);
				request.add_api_param('max_sale_price', executeFunctions.getNodeParameter('max_sale_price', itemIndex) as number);
				request.add_api_param('fields', executeFunctions.getNodeParameter('fields', itemIndex) as string);
				request.add_api_param('page_no', executeFunctions.getNodeParameter('page_no', itemIndex) as string);
				request.add_api_param('page_size', executeFunctions.getNodeParameter('page_size', itemIndex) as string);
				request.add_api_param('platform_product_type', executeFunctions.getNodeParameter('platform_product_type', itemIndex) as string);
				request.add_api_param('sort', executeFunctions.getNodeParameter('sort', itemIndex) as string);
				request.add_api_param('target_currency', executeFunctions.getNodeParameter('target_currency', itemIndex) as string);
				request.add_api_param('target_language', executeFunctions.getNodeParameter('target_language', itemIndex) as string);
				request.add_api_param('ship_to_country', executeFunctions.getNodeParameter('ship_to_country', itemIndex) as string);
				request.add_api_param('delivery_days', executeFunctions.getNodeParameter('delivery_days', itemIndex) as string);
				break;
			case 'getProductDetailInfo':
				request.add_api_param('product_ids', executeFunctions.getNodeParameter('product_ids', itemIndex) as string);
				request.add_api_param('target_currency', executeFunctions.getNodeParameter('target_currency', itemIndex) as string);
				request.add_api_param('target_language', executeFunctions.getNodeParameter('target_language', itemIndex) as string);
				request.add_api_param('fields', executeFunctions.getNodeParameter('fields', itemIndex) as string);
				break;
			case 'generateAffiliateLink':
				request.add_api_param('promotion_link_type', executeFunctions.getNodeParameter('promotion_link_type', itemIndex));
				request.add_api_param('source_values', executeFunctions.getNodeParameter('source_values', itemIndex) as string);
				break;
			case 'getHotProducts':
				request.add_api_param('category_ids', executeFunctions.getNodeParameter('category_ids', itemIndex) as string);
				request.add_api_param('keywords', executeFunctions.getNodeParameter('keywords', itemIndex) as string);
				request.add_api_param('min_sale_price', executeFunctions.getNodeParameter('min_sale_price', itemIndex) as number);
				request.add_api_param('max_sale_price', executeFunctions.getNodeParameter('max_sale_price', itemIndex) as number);
				request.add_api_param('fields', executeFunctions.getNodeParameter('fields', itemIndex) as string);
				request.add_api_param('page_no', executeFunctions.getNodeParameter('page_no', itemIndex) as string);
				request.add_api_param('page_size', executeFunctions.getNodeParameter('page_size', itemIndex) as string);
				request.add_api_param('platform_product_type', executeFunctions.getNodeParameter('platform_product_type', itemIndex) as string);
				request.add_api_param('sort', executeFunctions.getNodeParameter('sort', itemIndex) as string);
				request.add_api_param('target_currency', executeFunctions.getNodeParameter('target_currency', itemIndex) as string);
				request.add_api_param('target_language', executeFunctions.getNodeParameter('target_language', itemIndex) as string);
				request.add_api_param('ship_to_country', executeFunctions.getNodeParameter('ship_to_country', itemIndex) as string);
				request.add_api_param('delivery_days', executeFunctions.getNodeParameter('delivery_days', itemIndex) as string);
				break;
			case 'getOrders':
			case 'getOrderList':
			case 'getOrderListByIndex':
				request.add_api_param('start_time', executeFunctions.getNodeParameter('start_time', itemIndex) as string);
				request.add_api_param('end_time', executeFunctions.getNodeParameter('end_time', itemIndex) as string);
				request.add_api_param('status', executeFunctions.getNodeParameter('status', itemIndex) as string);
				break;
			case 'getFeaturedPromoProduct':
				request.add_api_param('category_id', executeFunctions.getNodeParameter('category_id', itemIndex) as string);
				request.add_api_param('promotion_name', executeFunctions.getNodeParameter('promotion_name', itemIndex) as string);
				request.add_api_param('sort', executeFunctions.getNodeParameter('sort', itemIndex) as string);
				break;
			case 'getHotProductDownload':
				request.add_api_param('category_id', executeFunctions.getNodeParameter('category_id', itemIndex) as string);
				request.add_api_param('locale_site', executeFunctions.getNodeParameter('locale_site', itemIndex) as string);
				break;
			case 'getOrderInfo':
				request.add_api_param('order_ids', executeFunctions.getNodeParameter('order_ids', itemIndex) as string);
				break;
		}
		// Handle tracking_id either from parameters or credentials
		let trackingId = executeFunctions.getNodeParameter('trackingId', itemIndex, '') as string;
		if (trackingId != "") {
			const credentials = await executeFunctions.getCredentials('aliExpressAffiliateApi');
			trackingId = credentials.trackingId as string;  // Ensure that the trackingId exists in credentials
		}
		request.add_api_param('tracking_id', trackingId);
		// // Handle additional fields
		// const additionalFields = executeFunctions.getNodeParameter('additionalFields', itemIndex) as IDataObject;
		// for (const [key, value] of Object.entries(additionalFields)) {
		// 	if (value !== undefined && value !== '') {
		// 		request.add_api_param(key, value as string);
		// 	}
		// }
	}
	
	
	
}