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
        type: 'fixedCollection',
        displayOptions: {
          hide: {
            automationId: [''],
          },
        },
        default: {},
        placeholder: 'Add Placeholder',
        typeOptions: {
          multipleValues: true,
        },
        options: [
          {
            name: 'placeholder',
            displayName: 'Placeholder',
            values: [
              {
                displayName: 'Placeholder Name',
                name: 'name',
                type: 'options',
                typeOptions: {
                  loadOptionsMethod: 'getPlaceholderOptions',
                  loadOptionsDependsOn: ['automationId'],
                },
                default: '',
                required: true,
                description: 'Select the placeholder to set a value for',
              },
              {
                displayName: 'Value',
                name: 'value',
                type: 'string',
                default: '',
                required: true,
                description: 'Enter the value for this placeholder',
              },
            ],
          },
        ],
        description:
          'Set values for the document placeholders. Select an automation first to see available placeholders.',
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

      async getPlaceholderOptions(
        this: ILoadOptionsFunctions
      ): Promise<INodePropertyOptions[]> {
        const automationId = this.getCurrentNodeParameter(
          'automationId'
        ) as string;

        console.log(
          'getPlaceholderOptions called with automationId:',
          automationId
        );

        if (!automationId) {
          console.log('No automation ID provided');
          return [];
        }

        const credentials = await this.getCredentials('docsAutomatorApi');
        if (!credentials) {
          console.log('No credentials found');
          return [];
        }

        const apiKey = credentials.apiKey as string;

        try {
          const options: OptionsWithUri = {
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

          console.log(
            'Making request to listPlaceholdersV2 with options:',
            options
          );
          const response = await this.helpers.request?.(options);
          console.log(
            'Placeholders response:',
            JSON.stringify(response, null, 2)
          );

          if (!response || !response.placeholders) {
            console.log('No placeholders found in response');
            return [];
          }

          const placeholderOptions: INodePropertyOptions[] = [];

          // Add main placeholders
          if (
            response.placeholders.main &&
            Array.isArray(response.placeholders.main)
          ) {
            console.log(
              'Processing main placeholders:',
              response.placeholders.main
            );
            for (const placeholder of response.placeholders.main) {
              placeholderOptions.push({
                name: placeholder,
                value: placeholder,
                description: `Main placeholder: ${placeholder}`,
              });
            }
          }

          // Add line items placeholders
          for (const key in response.placeholders) {
            if (
              key.startsWith('line_items_') &&
              Array.isArray(response.placeholders[key])
            ) {
              console.log(
                `Processing line items for ${key}:`,
                response.placeholders[key]
              );
              for (const placeholder of response.placeholders[key]) {
                const lineItemPlaceholder = `${key}.${placeholder}`;
                placeholderOptions.push({
                  name: lineItemPlaceholder,
                  value: lineItemPlaceholder,
                  description: `Line item placeholder: ${lineItemPlaceholder}`,
                });
              }
            }
          }

          console.log('Generated placeholder options:', placeholderOptions);
          return placeholderOptions;
        } catch (error) {
          console.error('Error loading placeholder options:', error);
          return [];
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
      const placeholderValuesRaw = this.getNodeParameter(
        'placeholderValues',
        i
      ) as IDataObject;

      // Convert fixedCollection format to simple key-value object
      const placeholderValues: IDataObject = {};

      if (
        placeholderValuesRaw.placeholder &&
        Array.isArray(placeholderValuesRaw.placeholder)
      ) {
        for (const item of placeholderValuesRaw.placeholder) {
          if (item.name && item.value !== undefined) {
            placeholderValues[item.name] = item.value;
          }
        }
      }

      console.log('Converted placeholder values:', placeholderValues);

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
          usedPlaceholders: placeholderValues,
        };

        returnData.push(responseData);
      } catch (error) {
        console.error('Error creating document:', error);

        // Still return placeholder information even if document creation fails
        const errorResponse = {
          error: error.message || 'Unknown error',
          automationId,
          usedPlaceholders: placeholderValues,
        };

        returnData.push(errorResponse);
      }
    }

    return [this.helpers.returnJsonArray(returnData)];
  }
}
