import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class DocsAutomatorApi implements ICredentialType {
	name = 'docsAutomatorApi';
	displayName = 'DocsAutomator API';
	documentationUrl = 'https://docs.docsautomator.co/integrations-api/docsautomator-api';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'The API key for DocsAutomator',
		},
	];
} 