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
  NodeOperationError,
} from 'n8n-workflow';

interface IAutomation {
  id?: string;
  _id?: string;
  docId?: string;
  name?: string;
  title?: string;
  dataSource?: {
    name: string;
  };
}

interface IAutomationsResponse {
  automations?: IAutomation[];
  data?: IAutomation[];
  results?: IAutomation[];
}

interface IPlaceholdersResponse {
  placeholders?: {
    main?: string[];
    [key: string]: string[] | undefined;
  };
}

interface ILineItemSet {
  lineItemType: string;
  items: string | any[];
}

interface ILineItems {
  lineItemSets?: ILineItemSet[];
}

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
        displayName: 'Automation Name or ID',
        name: 'automationId',
        type: 'options',
        typeOptions: {
          loadOptionsMethod: 'getAutomations',
        },
        default: '',
        required: true,
        description:
          'Select the automation to use for document creation. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
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
                displayName: 'Line Item Type Name or ID',
                name: 'lineItemType',
                type: 'options',
                typeOptions: {
                  loadOptionsMethod: 'getLineItemTypes',
                },
                default: '',
                required: true,
                noDataExpression: true,
                description:
                  'Select the line item type (e.g., line_items_1, line_items_2). Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
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
          'Whether to generate a preview of the document instead of the final version',
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
        description: 'Whether to process the document creation asynchronously',
      },
    ],
  };

  methods = {
    loadOptions: {
      async getAutomations(
        this: ILoadOptionsFunctions
      ): Promise<INodePropertyOptions[]> {
        try {
          const response =
            (await this.helpers.httpRequestWithAuthentication.call(
              this,
              'docsAutomatorApi',
              {
                method: 'GET',
                url: 'https://api.docsautomator.co/automations',
                json: true,
              }
            )) as IAutomation[] | IAutomationsResponse;

          let automations: IAutomation[] = [];

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
                name: 'No Automations Found',
                value: '',
              },
            ];
          }

          // Filter automations to only include those with datasource.name = "API"
          const apiAutomations = automations.filter(
            (automation: IAutomation) => {
              return automation.dataSource?.name === 'API';
            }
          );

          if (apiAutomations.length === 0) {
            return [
              {
                name: 'No API Automations Found',
                value: '',
              },
            ];
          }

          return apiAutomations.map((automation: IAutomation) => {
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
          this.logger.error('Error fetching automations', { error });
          return [
            {
              name: 'Error Loading Automations',
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
              name: 'Please Select an Automation First',
              value: '',
            },
          ];
        }

        // Get already selected line item types to filter them out
        const lineItems = this.getCurrentNodeParameter(
          'lineItems'
        ) as ILineItems;
        const selectedLineItemTypes = new Set<string>();

        if (
          lineItems &&
          lineItems.lineItemSets &&
          Array.isArray(lineItems.lineItemSets)
        ) {
          lineItems.lineItemSets.forEach((lineItemSet: ILineItemSet) => {
            if (lineItemSet.lineItemType) {
              selectedLineItemTypes.add(lineItemSet.lineItemType);
            }
          });
        }

        try {
          const response =
            (await this.helpers.httpRequestWithAuthentication.call(
              this,
              'docsAutomatorApi',
              {
                method: 'GET',
                url: 'https://api.docsautomator.co/listPlaceholdersV2',
                qs: {
                  automationId: automationId,
                },
                json: true,
              }
            )) as IPlaceholdersResponse;

          const lineItemTypes: INodePropertyOptions[] = [];

          // Collect all available line item types from the response
          const allAvailableTypes = new Set<string>();
          if (response.placeholders) {
            // Look for keys that match the pattern "line_items_X"
            Object.keys(response.placeholders).forEach((key: string) => {
              if (key.match(/^line_items_\d+$/) && response.placeholders) {
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
              if (key.match(/^line_items_\d+$/) && response.placeholders) {
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
                name: 'No Line Item Types Found for This Automation',
                value: '',
              },
            ];
          }

          return lineItemTypes;
        } catch (error) {
          this.logger.error('Error fetching line item types', { error });

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

        try {
          const response =
            (await this.helpers.httpRequestWithAuthentication.call(
              this,
              'docsAutomatorApi',
              {
                method: 'GET',
                url: 'https://api.docsautomator.co/listPlaceholdersV2',
                qs: {
                  automationId: automationId,
                },
                json: true,
              }
            )) as IPlaceholdersResponse;

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
          this.logger.error('Error fetching placeholders', { error });
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

    for (let i = 0; i < items.length; i++) {
      try {
        const automationId = this.getNodeParameter('automationId', i) as string;

        if (!automationId) {
          throw new NodeOperationError(
            this.getNode(),
            'Please select an automation'
          );
        }

        // Get placeholder values from resourceMapper
        const placeholderValues = this.getNodeParameter(
          'placeholderValues',
          i
        ) as any;

        // Get line items
        const lineItems = this.getNodeParameter('lineItems', i) as ILineItems;

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
                let itemsArray;
                if (typeof lineItemSet.items === 'string') {
                  const trimmedItems = lineItemSet.items.trim();
                  if (!trimmedItems) {
                    // Skip empty items
                    continue;
                  }
                  try {
                    itemsArray = JSON.parse(trimmedItems);
                  } catch (jsonError: any) {
                    throw new NodeOperationError(
                      this.getNode(),
                      `Invalid JSON format for line items in ${lineItemSet.lineItemType}: ${jsonError.message}`,
                      {
                        description: `Please ensure your JSON is valid. Example: [{"name": "Item 1", "quantity": 2}]`,
                        itemIndex: i,
                      }
                    );
                  }
                } else {
                  itemsArray = lineItemSet.items;
                }

                if (!Array.isArray(itemsArray)) {
                  throw new NodeOperationError(
                    this.getNode(),
                    `Line items for ${lineItemSet.lineItemType} must be an array`,
                    {
                      description: `Expected an array but got ${typeof itemsArray}`,
                      itemIndex: i,
                    }
                  );
                }

                // Validate each item in the array is an object
                for (let idx = 0; idx < itemsArray.length; idx++) {
                  if (
                    typeof itemsArray[idx] !== 'object' ||
                    itemsArray[idx] === null
                  ) {
                    throw new NodeOperationError(
                      this.getNode(),
                      `Invalid item at index ${idx} in ${lineItemSet.lineItemType}`,
                      {
                        description: `Each line item must be an object with key-value pairs`,
                        itemIndex: i,
                      }
                    );
                  }
                }

                // Add line items to the body with the structure expected by DocsAutomator API
                body[lineItemSet.lineItemType] = itemsArray;
              } catch (error) {
                // Re-throw if it's already a NodeOperationError
                if (error instanceof NodeOperationError) {
                  throw error;
                }
                // Otherwise wrap it
                throw new NodeOperationError(
                  this.getNode(),
                  `Error processing line items for ${lineItemSet.lineItemType}: ${(error as Error).message}`,
                  { itemIndex: i }
                );
              }
            }
          }
        }

        const response = await this.helpers.httpRequestWithAuthentication.call(
          this,
          'docsAutomatorApi',
          {
            method: 'POST',
            url: 'https://api.docsautomator.co/createDocument',
            qs: {
              docId: automationId,
            },
            body,
            json: true,
          }
        );

        returnData.push({
          json: response,
          pairedItem: i,
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
        // If it's already a NodeOperationError, rethrow it, otherwise wrap it
        if (error instanceof NodeOperationError) {
          throw error;
        }
        throw new NodeOperationError(this.getNode(), error, { itemIndex: i });
      }
    }

    return [returnData];
  }
}
