import {
  IExecuteFunctions,
  IDataObject,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  ILoadOptionsFunctions,
  INodePropertyOptions,
  ResourceMapperFields,
  ResourceMapperField,
  IRequestOptions,
} from 'n8n-workflow';

export class DocsAutomator implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'DocsAutomator',
    name: 'docsAutomator',
    icon: 'file:docsautomator-icon.svg',
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
        type: 'resourceMapper',
        default: {
          mappingMode: 'defineBelow',
          value: null,
          matchingColumns: [],
          schema: [],
        },
        required: true,
        typeOptions: {
          resourceMapper: {
            resourceMapperMethod: 'getPlaceholderFields',
            mode: 'add',
            valuesLabel: 'Placeholder Values',
            addAllFields: true,
            supportAutoMap: false,
          },
        },
        displayOptions: {
          hide: {
            automationId: [''],
          },
        },
        description: 'Map values to the available placeholders',
      },
      {
        displayName: 'Line Items',
        name: 'lineItems',
        type: 'fixedCollection',
        placeholder: 'Add Line Item',
        default: {},
        typeOptions: {
          multipleValues: true,
        },
        displayOptions: {
          hide: {
            automationId: [''],
          },
        },
        description:
          'Define line items (dynamic table rows) for this automation',
        options: [
          {
            name: 'lineItemSets',
            displayName: 'Line Item Sets',
            values: [
              {
                displayName: 'Line Item Type',
                name: 'lineItemType',
                type: 'options',
                typeOptions: {
                  loadOptionsMethod: 'getLineItemTypes',
                },
                default: '',
                required: true,
                noDataExpression: true,
                description:
                  'Select the line item type (e.g., line_items_1, line_items_2)',
              },
              {
                displayName: 'Items (JSON)',
                name: 'items',
                type: 'json',
                default: '[]',
                description:
                  'Array of objects where each object represents a row with placeholder key-value pairs',
                hint: 'Example: [{"name": "Item 1", "quantity": 2, "price": 100}, {"name": "Item 2", "quantity": 1, "price": 50}]',
                displayOptions: {
                  hide: {
                    lineItemType: [''],
                  },
                },
              },
            ],
          },
        ],
      },
      {
        displayName: 'Preview Mode',
        name: 'isPreview',
        type: 'boolean',
        default: false,
        displayOptions: {
          hide: {
            automationId: [''],
          },
        },
        description:
          'Generate a preview of the document instead of the final version',
      },
      {
        displayName: 'Async Processing',
        name: 'async',
        type: 'boolean',
        default: false,
        displayOptions: {
          hide: {
            automationId: [''],
          },
        },
        description: 'Process the document creation asynchronously',
      },
    ],
  };

  methods = {
    loadOptions: {
      async getAutomations(
        this: ILoadOptionsFunctions
      ): Promise<INodePropertyOptions[]> {
        const credentials = await this.getCredentials('docsAutomatorApi');
        const apiKey = credentials.apiKey as string;

        try {
          const options: IRequestOptions = {
            method: 'GET',
            url: 'https://api.docsautomator.co/automations',
            headers: {
              Authorization: `Bearer ${apiKey}`,
            },
            json: true,
          };

          const response = await this.helpers.request!(options);

          let automations: any[] = [];

          if (Array.isArray(response)) {
            automations = response;
          } else if (response && typeof response === 'object') {
            if (Array.isArray(response.automations)) {
              automations = response.automations;
            } else if (Array.isArray(response.data)) {
              automations = response.data;
            } else if (Array.isArray(response.results)) {
              automations = response.results;
            }
          }

          if (!automations || automations.length === 0) {
            return [
              {
                name: 'No automations found',
                value: '',
              },
            ];
          }

          // Filter automations to only include those with datasource.name = "API"
          const apiAutomations = automations.filter((automation: any) => {
            return automation.dataSource?.name === 'API';
          });

          if (apiAutomations.length === 0) {
            return [
              {
                name: 'No API automations found',
                value: '',
              },
            ];
          }

          return apiAutomations.map((automation: any) => {
            const name =
              automation.name || automation.title || automation.id || 'Unnamed';
            const value =
              automation.id || automation._id || automation.docId || '';

            return {
              name: `${name} (${value})`,
              value: value,
            };
          });
        } catch (error) {
          console.error('Error fetching automations:', error);
          return [
            {
              name: 'Error loading automations',
              value: '',
            },
          ];
        }
      },

      async getLineItemTypes(
        this: ILoadOptionsFunctions
      ): Promise<INodePropertyOptions[]> {
        const automationId = this.getCurrentNodeParameter(
          'automationId'
        ) as string;

        if (!automationId) {
          return [
            {
              name: 'Please select an automation first',
              value: '',
            },
          ];
        }

        // Get already selected line item types to filter them out
        const lineItems = this.getCurrentNodeParameter('lineItems') as any;
        const selectedLineItemTypes = new Set<string>();

        if (
          lineItems &&
          lineItems.lineItemSets &&
          Array.isArray(lineItems.lineItemSets)
        ) {
          lineItems.lineItemSets.forEach((lineItemSet: any) => {
            if (lineItemSet.lineItemType) {
              selectedLineItemTypes.add(lineItemSet.lineItemType);
            }
          });
        }

        const credentials = await this.getCredentials('docsAutomatorApi');
        const apiKey = credentials.apiKey as string;

        try {
          const options: IRequestOptions = {
            method: 'GET',
            url: 'https://api.docsautomator.co/listPlaceholdersV2',
            qs: {
              automationId: automationId,
            },
            headers: {
              Authorization: `Bearer ${apiKey}`,
            },
            json: true,
          };

          const response = await this.helpers.request!(options);

          console.log(
            'DocsAutomator getLineItemTypes API Response:',
            JSON.stringify(response, null, 2)
          );

          const lineItemTypes: INodePropertyOptions[] = [];

          // Collect all available line item types from the response
          const allAvailableTypes = new Set<string>();
          if (response.placeholders) {
            // Look for keys that match the pattern "line_items_X"
            Object.keys(response.placeholders).forEach((key: string) => {
              if (key.match(/^line_items_\d+$/)) {
                const lineItemPlaceholders = response.placeholders[key];
                if (Array.isArray(lineItemPlaceholders)) {
                  allAvailableTypes.add(key);
                }
              }
            });
          }

          // Always include already selected items to prevent validation errors
          selectedLineItemTypes.forEach((selectedType) => {
            allAvailableTypes.add(selectedType);
          });

          // Build the options list - include ALL items to prevent validation errors
          allAvailableTypes.forEach((key) => {
            const match = key.match(/^line_items_(\d+)$/);
            const number = match ? match[1] : key;
            lineItemTypes.push({
              name: `Line Items ${number}`,
              value: key,
            });
          });

          // Check if all API types are selected (for showing message)
          const apiTypes = new Set<string>();
          if (response.placeholders) {
            Object.keys(response.placeholders).forEach((key: string) => {
              if (key.match(/^line_items_\d+$/)) {
                const lineItemPlaceholders = response.placeholders[key];
                if (Array.isArray(lineItemPlaceholders)) {
                  apiTypes.add(key);
                }
              }
            });
          }

          const unselectedApiTypes = Array.from(apiTypes).filter(
            (type) => !selectedLineItemTypes.has(type)
          );

          if (unselectedApiTypes.length === 0 && apiTypes.size > 0) {
            // All available line item types have been added - add message at top
            lineItemTypes.unshift({
              name: 'All available line item types have been added',
              value: '',
            });
          }

          if (lineItemTypes.length === 0) {
            return [
              {
                name: 'No line item types found for this automation',
                value: '',
              },
            ];
          }

          return lineItemTypes;
        } catch (error) {
          console.error('Error fetching line item types:', error);

          // Even on error, include any already selected items to prevent validation errors
          const fallbackOptions: INodePropertyOptions[] = [];
          if (selectedLineItemTypes.size > 0) {
            selectedLineItemTypes.forEach((selectedType) => {
              const match = selectedType.match(/^line_items_(\d+)$/);
              const number = match ? match[1] : selectedType;
              fallbackOptions.push({
                name: `Line Items ${number}`,
                value: selectedType,
              });
            });
          }

          fallbackOptions.push({
            name: 'Error loading line item types - please refresh',
            value: '',
          });

          return fallbackOptions;
        }
      },
    },

    resourceMapping: {
      async getPlaceholderFields(
        this: ILoadOptionsFunctions
      ): Promise<ResourceMapperFields> {
        const automationId = this.getCurrentNodeParameter(
          'automationId'
        ) as string;

        if (!automationId) {
          return {
            fields: [],
            emptyFieldsNotice: 'Please select an automation first',
          };
        }

        const credentials = await this.getCredentials('docsAutomatorApi');
        const apiKey = credentials.apiKey as string;

        try {
          const options: IRequestOptions = {
            method: 'GET',
            url: 'https://api.docsautomator.co/listPlaceholdersV2',
            qs: {
              automationId: automationId,
            },
            headers: {
              Authorization: `Bearer ${apiKey}`,
            },
            json: true,
          };

          const response = await this.helpers.request!(options);

          console.log(
            'DocsAutomator API Response:',
            JSON.stringify(response, null, 2)
          );

          const fields: ResourceMapperField[] = [];

          // Add main placeholders as individual fields
          if (
            response.placeholders?.main &&
            Array.isArray(response.placeholders.main)
          ) {
            response.placeholders.main.forEach((placeholder: string) => {
              fields.push({
                id: placeholder,
                displayName: placeholder
                  .replace(/_/g, ' ')
                  .replace(/\b\w/g, (l) => l.toUpperCase()),
                defaultMatch: false,
                canBeUsedToMatch: false,
                required: false,
                display: true,
                type: 'string',
                readOnly: false,
              });
            });
          }

          // Line item placeholders are configured separately in the Line Items section
          // No need to show them here as read-only fields

          if (fields.length === 0) {
            return {
              fields: [],
              emptyFieldsNotice: 'No placeholders found for this automation',
            };
          }

          return {
            fields,
          };
        } catch (error) {
          console.error('Error fetching placeholders:', error);
          return {
            fields: [],
            emptyFieldsNotice: 'Error loading placeholders',
          };
        }
      },
    },
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    const credentials = await this.getCredentials('docsAutomatorApi');
    const apiKey = credentials.apiKey as string;

    for (let i = 0; i < items.length; i++) {
      try {
        const automationId = this.getNodeParameter('automationId', i) as string;

        if (!automationId) {
          throw new Error('Please select an automation');
        }

        // Get placeholder values from resourceMapper
        const placeholderValues = this.getNodeParameter(
          'placeholderValues',
          i
        ) as any;

        // Get line items
        const lineItems = this.getNodeParameter('lineItems', i) as any;

        // Get options
        const isPreview = this.getNodeParameter('isPreview', i) as boolean;
        const async = this.getNodeParameter('async', i) as boolean;

        let body: IDataObject = {};

        // Extract values from resourceMapper format (main placeholders)
        if (placeholderValues && placeholderValues.value) {
          body = { ...placeholderValues.value };
        }

        // Add processing options to the body
        if (isPreview) {
          body.isPreview = true;
        }
        if (async) {
          body.async = true;
        }

        // Process line items
        if (
          lineItems &&
          lineItems.lineItemSets &&
          Array.isArray(lineItems.lineItemSets)
        ) {
          for (const lineItemSet of lineItems.lineItemSets) {
            if (lineItemSet.lineItemType && lineItemSet.items) {
              try {
                // Parse the JSON array of line items
                const itemsArray =
                  typeof lineItemSet.items === 'string'
                    ? JSON.parse(lineItemSet.items)
                    : lineItemSet.items;

                if (Array.isArray(itemsArray)) {
                  // Add line items to the body with the structure expected by DocsAutomator API
                  body[lineItemSet.lineItemType] = itemsArray;
                }
              } catch (parseError) {
                console.error(
                  `Error parsing line items for ${lineItemSet.lineItemType}:`,
                  parseError
                );
                throw new Error(
                  `Invalid JSON format for line items in ${lineItemSet.lineItemType}. Please check your JSON syntax.`
                );
              }
            }
          }
        }

        const createOptions: IRequestOptions = {
          method: 'POST',
          url: 'https://api.docsautomator.co/createDocument',
          qs: {
            docId: automationId,
          },
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
          body,
          json: true,
        };

        const response = await this.helpers.request!(createOptions);

        returnData.push({
          json: response,
          pairedItem: { item: i },
        });
      } catch (error: any) {
        if (this.continueOnFail()) {
          returnData.push({
            json: {
              error: error.message,
            },
            pairedItem: { item: i },
          });
          continue;
        }
        throw error;
      }
    }

    return [returnData];
  }
}
