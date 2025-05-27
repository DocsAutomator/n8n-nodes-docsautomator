import {
  IExecuteFunctions,
  IDataObject,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  ILoadOptionsFunctions,
  INodePropertyOptions,
} from 'n8n-workflow';
import { OptionsWithUri } from 'request-promise-native';

export class DocsAutomator implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'DocsAutomator',
    name: 'docsAutomator',
    icon: 'file:docsautomator.svg',
    group: ['transform'],
    version: 1,
    subtitle: 'Create Document',
    description: 'Create and manage documents with DocsAutomator',
    defaults: {
      name: 'DocsAutomator',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'docsAutomatorApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Automation',
        name: 'automationId',
        type: 'options',
        typeOptions: {
          loadOptionsMethod: 'getAutomations',
        },
        default: '',
        required: true,
        description: 'Select the automation to use for document creation',
      },
      {
        displayName: 'Placeholder Values',
        name: 'placeholderValues',
        type: 'json',
        displayOptions: {
          hide: {
            automationId: [''],
          },
        },
        default: '{}',
        description:
          'Enter placeholder values as a JSON object. Run the workflow once to see available placeholders in the execution log, then edit this field with the actual values.',
      },
    ],
  };

  // Methods for loading options
  methods = {
    loadOptions: {
      async getAutomations(
        this: ILoadOptionsFunctions
      ): Promise<INodePropertyOptions[]> {
        const credentials = await this.getCredentials('docsAutomatorApi');
        if (!credentials) {
          return [{ name: 'Please provide valid credentials', value: '' }];
        }

        const apiKey = credentials.apiKey as string;

        try {
          const options: OptionsWithUri = {
            method: 'GET',
            uri: 'https://api.docsautomator.co/automations',
            json: true,
            headers: {
              Authorization: `Bearer ${apiKey}`,
            },
          };

          const response = await this.helpers.request?.(options);

          console.log(
            'Full automations response:',
            JSON.stringify(response, null, 2)
          );
          console.log('Response type:', typeof response);
          console.log('Is array:', Array.isArray(response));

          // Handle different response formats
          let automations: any[] = [];

          if (Array.isArray(response)) {
            automations = response;
          } else if (response && typeof response === 'object') {
            // Check if automations are nested in the response
            if (response.automations && Array.isArray(response.automations)) {
              automations = response.automations;
            } else if (response.data && Array.isArray(response.data)) {
              automations = response.data;
            } else if (response.results && Array.isArray(response.results)) {
              automations = response.results;
            } else {
              // If it's an object but not in expected format, try to extract values
              const values = Object.values(response);
              if (values.length > 0 && Array.isArray(values[0])) {
                automations = values[0] as any[];
              }
            }
          }

          console.log('Extracted automations:', automations);
          console.log('Automations count:', automations.length);

          if (!automations || automations.length === 0) {
            return [{ name: 'No automations found', value: '' }];
          }

          const mappedAutomations = automations.map((automation: any) => {
            console.log('Processing automation:', automation);
            return {
              name:
                automation.name ||
                automation.title ||
                automation.id ||
                'Unnamed Automation',
              value: automation.id || automation._id || automation.docId,
            };
          });

          console.log('Mapped automations:', mappedAutomations);
          return mappedAutomations;
        } catch (error: any) {
          console.error('Error loading automations:', error);
          return [
            { name: `Error: ${error?.message || 'Unknown error'}`, value: '' },
          ];
        }
      },
    },
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: IDataObject[] = [];
    const length = items.length;

    const credentials = await this.getCredentials('docsAutomatorApi');
    const apiKey = credentials.apiKey as string;

    // For each item
    for (let i = 0; i < length; i++) {
      const automationId = this.getNodeParameter('automationId', i) as string;
      const placeholderValuesStr = this.getNodeParameter(
        'placeholderValues',
        i
      ) as string;

      // First, fetch available placeholders for this automation
      const placeholdersOptions: OptionsWithUri = {
        method: 'GET',
        uri: 'https://api.docsautomator.co/listPlaceholdersV2',
        qs: {
          automationId: automationId,
        },
        json: true,
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      };

      let availablePlaceholders: any = {};
      try {
        const placeholdersResponse = await this.helpers.request?.(
          placeholdersOptions
        );
        availablePlaceholders = placeholdersResponse?.placeholders || {};

        console.log('Available placeholders for automation:', automationId);
        console.log('Main placeholders:', availablePlaceholders.main || []);

        // Log line items placeholders
        for (const key in availablePlaceholders) {
          if (
            key.startsWith('line_items_') &&
            Array.isArray(availablePlaceholders[key])
          ) {
            console.log(`${key} placeholders:`, availablePlaceholders[key]);
          }
        }
      } catch (error) {
        console.error('Error fetching placeholders:', error);
      }

      // Parse placeholder values from JSON string
      let placeholderValues: IDataObject = {};
      try {
        placeholderValues = JSON.parse(placeholderValuesStr);
      } catch (error) {
        console.error('Error parsing placeholder values JSON:', error);
        placeholderValues = {};
      }

      // Create the document
      const createDocOptions: OptionsWithUri = {
        method: 'POST',
        uri: 'https://api.docsautomator.co/createDocument',
        qs: {
          docId: automationId,
        },
        body: placeholderValues,
        json: true,
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      };

      try {
        const documentResponse = await this.helpers.request?.(createDocOptions);

        // Combine the response with placeholder information
        const responseData = {
          ...documentResponse,
          automationId,
          availablePlaceholders,
          usedPlaceholders: placeholderValues,
        };

        returnData.push(responseData);
      } catch (error) {
        console.error('Error creating document:', error);

        // Still return placeholder information even if document creation fails
        const errorResponse = {
          error: error.message || 'Unknown error',
          automationId,
          availablePlaceholders,
          usedPlaceholders: placeholderValues,
        };

        returnData.push(errorResponse);
      }
    }

    return [this.helpers.returnJsonArray(returnData)];
  }
}
