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

// ============================================
// Interfaces
// ============================================

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

interface IUpdateFields {
  title?: string;
  docTemplateLink?: string;
  locale?: string;
  isActive?: boolean;
  formatNumbersWithLocale?: boolean;
  pdfExpiration?: number;
  newDocumentNameField?: string;
  attachmentField?: string;
  saveGoogleDoc?: boolean;
  imageOptions?: {
    quality?: number;
    maxWidth?: number;
  };
}

// ============================================
// Constants
// ============================================

const BASE_URL = 'https://api.docsautomator.co';

// ============================================
// Node Definition
// ============================================

export class DocsAutomator implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'DocsAutomator',
    name: 'docsAutomator',
    icon: 'file:docsautomator-icon.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
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
      // ============================================
      // Resource Selection
      // ============================================
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Automation',
            value: 'automation',
          },
          {
            name: 'Document',
            value: 'document',
          },
          {
            name: 'Placeholder',
            value: 'placeholder',
          },
          {
            name: 'Template',
            value: 'template',
          },
        ],
        default: 'document',
      },

      // ============================================
      // Automation Operations
      // ============================================
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['automation'],
          },
        },
        options: [
          {
            name: 'Create',
            value: 'create',
            description: 'Create a new automation',
            action: 'Create an automation',
          },
          {
            name: 'Delete',
            value: 'delete',
            description: 'Delete an automation',
            action: 'Delete an automation',
          },
          {
            name: 'Duplicate',
            value: 'duplicate',
            description: 'Duplicate an existing automation',
            action: 'Duplicate an automation',
          },
          {
            name: 'Get',
            value: 'get',
            description: 'Get a single automation by ID',
            action: 'Get an automation',
          },
          {
            name: 'Get Many',
            value: 'getAll',
            description: 'Get all automations',
            action: 'Get many automations',
          },
          {
            name: 'Update',
            value: 'update',
            description: 'Update an existing automation',
            action: 'Update an automation',
          },
        ],
        default: 'getAll',
      },

      // ============================================
      // Document Operations
      // ============================================
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['document'],
          },
        },
        options: [
          {
            name: 'Create',
            value: 'create',
            description: 'Create a new document from an automation',
            action: 'Create a document',
          },
        ],
        default: 'create',
      },

      // ============================================
      // Placeholder Operations
      // ============================================
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['placeholder'],
          },
        },
        options: [
          {
            name: 'List',
            value: 'list',
            description: 'List placeholders for an automation',
            action: 'List placeholders',
          },
        ],
        default: 'list',
      },

      // ============================================
      // Template Operations
      // ============================================
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['template'],
          },
        },
        options: [
          {
            name: 'Duplicate Google Doc',
            value: 'duplicateGoogleDoc',
            description: 'Duplicate a Google Doc template',
            action: 'Duplicate a Google Doc template',
          },
        ],
        default: 'duplicateGoogleDoc',
      },

      // ============================================
      // Automation Properties
      // ============================================

      // Automation ID for Get, Delete, Duplicate, Update operations
      {
        displayName: 'Automation Name or ID',
        name: 'automationId',
        type: 'options',
        typeOptions: {
          loadOptionsMethod: 'getAllAutomations',
        },
        default: '',
        required: true,
        displayOptions: {
          show: {
            resource: ['automation'],
            operation: ['get', 'delete', 'duplicate', 'update'],
          },
        },
        description:
          'Select the automation. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
      },

      // Create Automation - Title
      {
        displayName: 'Title',
        name: 'title',
        type: 'string',
        default: '',
        required: true,
        displayOptions: {
          show: {
            resource: ['automation'],
            operation: ['create'],
          },
        },
        description: 'The name for the new automation',
      },

      // Create Automation - Data Source
      {
        displayName: 'Data Source',
        name: 'dataSourceName',
        type: 'options',
        options: [
          { name: 'API', value: 'API' },
          { name: 'Airtable', value: 'Airtable' },
          { name: 'ClickUp', value: 'ClickUp' },
          { name: 'Glide', value: 'Glide' },
          { name: 'Google Sheets', value: 'Google Sheets' },
          { name: 'n8n', value: 'n8n' },
          { name: 'Noloco', value: 'Noloco' },
          { name: 'SmartSuite', value: 'SmartSuite' },
          { name: 'Zapier', value: 'Zapier' },
        ],
        default: 'API',
        required: true,
        displayOptions: {
          show: {
            resource: ['automation'],
            operation: ['create'],
          },
        },
        description: 'The data source type for the automation',
      },

      // Update Automation - Fields
      {
        displayName: 'Update Fields',
        name: 'updateFields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        displayOptions: {
          show: {
            resource: ['automation'],
            operation: ['update'],
          },
        },
        options: [
          {
            displayName: 'Title',
            name: 'title',
            type: 'string',
            default: '',
            description: 'New name for the automation',
          },
          {
            displayName: 'Google Doc Template Link',
            name: 'docTemplateLink',
            type: 'string',
            default: '',
            description: 'Google Doc template URL',
          },
          {
            displayName: 'Locale',
            name: 'locale',
            type: 'string',
            default: '',
            placeholder: 'en-us',
            description: 'Locale for number/date formatting (e.g., en-us, de-de)',
          },
          {
            displayName: 'Active',
            name: 'isActive',
            type: 'boolean',
            default: true,
            description: 'Whether the automation is active',
          },
          {
            displayName: 'Format Numbers with Locale',
            name: 'formatNumbersWithLocale',
            type: 'boolean',
            default: false,
            description: 'Whether to format numbers according to the locale',
          },
          {
            displayName: 'PDF Expiration (Days)',
            name: 'pdfExpiration',
            type: 'number',
            default: 0,
            description:
              'Number of days until the PDF link expires (0 = no expiration)',
          },
          {
            displayName: 'Document Name Field',
            name: 'newDocumentNameField',
            type: 'string',
            default: '',
            description: 'Field to use for naming generated documents',
          },
          {
            displayName: 'Attachment Field',
            name: 'attachmentField',
            type: 'string',
            default: '',
            description: 'Field to use for attachments',
          },
          {
            displayName: 'Save as Google Doc',
            name: 'saveGoogleDoc',
            type: 'boolean',
            default: false,
            description: 'Whether to save the output as a Google Doc',
          },
        ],
      },

      // ============================================
      // Document Properties (existing)
      // ============================================

      // Document - Automation ID
      {
        displayName: 'Automation Name or ID',
        name: 'automationId',
        type: 'options',
        typeOptions: {
          loadOptionsMethod: 'getAutomations',
        },
        default: '',
        required: true,
        displayOptions: {
          show: {
            resource: ['document'],
            operation: ['create'],
          },
        },
        description:
          'Select the automation to use for document creation. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
      },

      // Document - Placeholder Values
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
          show: {
            resource: ['document'],
            operation: ['create'],
          },
          hide: {
            automationId: [''],
          },
        },
        description: 'Map values to the available placeholders',
      },

      // Document - Line Items
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
          show: {
            resource: ['document'],
            operation: ['create'],
          },
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

      // Document - Preview Mode
      {
        displayName: 'Preview Mode',
        name: 'isPreview',
        type: 'boolean',
        default: false,
        displayOptions: {
          show: {
            resource: ['document'],
            operation: ['create'],
          },
          hide: {
            automationId: [''],
          },
        },
        description:
          'Whether to generate a preview of the document instead of the final version',
      },

      // Document - Async Processing
      {
        displayName: 'Async Processing',
        name: 'async',
        type: 'boolean',
        default: false,
        displayOptions: {
          show: {
            resource: ['document'],
            operation: ['create'],
          },
          hide: {
            automationId: [''],
          },
        },
        description:
          'Whether to process the document creation asynchronously. Returns a jobId for tracking.',
      },

      // ============================================
      // Placeholder Properties
      // ============================================

      // Placeholder - Automation ID
      {
        displayName: 'Automation Name or ID',
        name: 'automationId',
        type: 'options',
        typeOptions: {
          loadOptionsMethod: 'getAllAutomations',
        },
        default: '',
        required: true,
        displayOptions: {
          show: {
            resource: ['placeholder'],
            operation: ['list'],
          },
        },
        description:
          'Select the automation to list placeholders for. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
      },

      // ============================================
      // Template Properties
      // ============================================

      // Template - Automation ID
      {
        displayName: 'Automation Name or ID',
        name: 'automationId',
        type: 'options',
        typeOptions: {
          loadOptionsMethod: 'getAllAutomations',
        },
        default: '',
        required: true,
        displayOptions: {
          show: {
            resource: ['template'],
            operation: ['duplicateGoogleDoc'],
          },
        },
        description:
          'Select the automation whose template you want to duplicate. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
      },

      // Template - New Name
      {
        displayName: 'New Template Name',
        name: 'newTemplateName',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            resource: ['template'],
            operation: ['duplicateGoogleDoc'],
          },
        },
        description:
          'Optional name for the duplicated template. If not provided, uses the automation title.',
      },
    ],
  };

  methods = {
    loadOptions: {
      /**
       * Get automations filtered for API/n8n data sources (for document creation)
       */
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
                url: `${BASE_URL}/automations`,
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

          // Filter automations to only include those with datasource.name = "API" or "n8n"
          const apiAutomations = automations.filter(
            (automation: IAutomation) => {
              const dataSourceName = automation.dataSource?.name;
              return dataSourceName === 'API' || dataSourceName === 'n8n';
            }
          );

          if (apiAutomations.length === 0) {
            return [
              {
                name: 'No API or n8n Automations Found',
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

      /**
       * Get all automations (unfiltered - for automation management operations)
       */
      async getAllAutomations(
        this: ILoadOptionsFunctions
      ): Promise<INodePropertyOptions[]> {
        try {
          const response =
            (await this.helpers.httpRequestWithAuthentication.call(
              this,
              'docsAutomatorApi',
              {
                method: 'GET',
                url: `${BASE_URL}/automations`,
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

          return automations.map((automation: IAutomation) => {
            const name =
              automation.name || automation.title || automation.id || 'Unnamed';
            const value =
              automation.id || automation._id || automation.docId || '';
            const dataSource = automation.dataSource?.name || 'Unknown';

            return {
              name: `${name} [${dataSource}] (${value})`,
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

      /**
       * Get line item types for an automation
       */
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
                url: `${BASE_URL}/listPlaceholdersV2`,
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
      /**
       * Get placeholder fields for resource mapper
       */
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
                url: `${BASE_URL}/listPlaceholdersV2`,
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

    const resource = this.getNodeParameter('resource', 0) as string;
    const operation = this.getNodeParameter('operation', 0) as string;

    for (let i = 0; i < items.length; i++) {
      try {
        let responseData: IDataObject | IDataObject[];

        // ============================================
        // Automation Resource
        // ============================================
        if (resource === 'automation') {
          if (operation === 'getAll') {
            // GET /automations - List all automations
            responseData =
              await this.helpers.httpRequestWithAuthentication.call(
                this,
                'docsAutomatorApi',
                {
                  method: 'GET',
                  url: `${BASE_URL}/automations`,
                  json: true,
                }
              );
          } else if (operation === 'get') {
            // GET /automation - Get single automation
            const automationId = this.getNodeParameter(
              'automationId',
              i
            ) as string;

            if (!automationId) {
              throw new NodeOperationError(
                this.getNode(),
                'Please select an automation',
                { itemIndex: i }
              );
            }

            responseData =
              await this.helpers.httpRequestWithAuthentication.call(
                this,
                'docsAutomatorApi',
                {
                  method: 'GET',
                  url: `${BASE_URL}/automation`,
                  qs: { automationId },
                  json: true,
                }
              );
          } else if (operation === 'create') {
            // POST /createAutomation - Create new automation
            const title = this.getNodeParameter('title', i) as string;
            const dataSourceName = this.getNodeParameter(
              'dataSourceName',
              i
            ) as string;

            if (!title) {
              throw new NodeOperationError(
                this.getNode(),
                'Title is required',
                { itemIndex: i }
              );
            }

            const body: IDataObject = {
              title,
              dataSourceName,
            };

            responseData =
              await this.helpers.httpRequestWithAuthentication.call(
                this,
                'docsAutomatorApi',
                {
                  method: 'POST',
                  url: `${BASE_URL}/createAutomation`,
                  body,
                  json: true,
                }
              );
          } else if (operation === 'update') {
            // PUT /updateAutomation - Update automation
            const automationId = this.getNodeParameter(
              'automationId',
              i
            ) as string;
            const updateFields = this.getNodeParameter(
              'updateFields',
              i
            ) as IUpdateFields;

            if (!automationId) {
              throw new NodeOperationError(
                this.getNode(),
                'Please select an automation',
                { itemIndex: i }
              );
            }

            if (!updateFields || Object.keys(updateFields).length === 0) {
              throw new NodeOperationError(
                this.getNode(),
                'At least one field must be provided for update',
                { itemIndex: i }
              );
            }

            responseData =
              await this.helpers.httpRequestWithAuthentication.call(
                this,
                'docsAutomatorApi',
                {
                  method: 'PUT',
                  url: `${BASE_URL}/updateAutomation`,
                  qs: { docId: automationId },
                  body: updateFields,
                  json: true,
                }
              );
          } else if (operation === 'delete') {
            // DELETE /deleteAutomation - Delete automation
            const automationId = this.getNodeParameter(
              'automationId',
              i
            ) as string;

            if (!automationId) {
              throw new NodeOperationError(
                this.getNode(),
                'Please select an automation',
                { itemIndex: i }
              );
            }

            responseData =
              await this.helpers.httpRequestWithAuthentication.call(
                this,
                'docsAutomatorApi',
                {
                  method: 'DELETE',
                  url: `${BASE_URL}/deleteAutomation`,
                  qs: { docId: automationId },
                  json: true,
                }
              );
          } else if (operation === 'duplicate') {
            // POST /duplicateAutomation - Duplicate automation
            const automationId = this.getNodeParameter(
              'automationId',
              i
            ) as string;

            if (!automationId) {
              throw new NodeOperationError(
                this.getNode(),
                'Please select an automation',
                { itemIndex: i }
              );
            }

            responseData =
              await this.helpers.httpRequestWithAuthentication.call(
                this,
                'docsAutomatorApi',
                {
                  method: 'POST',
                  url: `${BASE_URL}/duplicateAutomation`,
                  qs: { automationId },
                  json: true,
                }
              );
          } else {
            throw new NodeOperationError(
              this.getNode(),
              `Unknown automation operation: ${operation}`,
              { itemIndex: i }
            );
          }
        }
        // ============================================
        // Document Resource
        // ============================================
        else if (resource === 'document') {
          if (operation === 'create') {
            // POST /createDocument - Create document (existing logic)
            const automationId = this.getNodeParameter(
              'automationId',
              i
            ) as string;

            if (!automationId) {
              throw new NodeOperationError(
                this.getNode(),
                'Please select an automation',
                { itemIndex: i }
              );
            }

            // Get placeholder values from resourceMapper
            const placeholderValues = this.getNodeParameter(
              'placeholderValues',
              i
            ) as any;

            // Get line items
            const lineItems = this.getNodeParameter(
              'lineItems',
              i
            ) as ILineItems;

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
                }
              }
            }

            responseData =
              await this.helpers.httpRequestWithAuthentication.call(
                this,
                'docsAutomatorApi',
                {
                  method: 'POST',
                  url: `${BASE_URL}/createDocument`,
                  qs: {
                    docId: automationId,
                  },
                  body,
                  json: true,
                }
              );
          } else {
            throw new NodeOperationError(
              this.getNode(),
              `Unknown document operation: ${operation}`,
              { itemIndex: i }
            );
          }
        }
        // ============================================
        // Placeholder Resource
        // ============================================
        else if (resource === 'placeholder') {
          const automationId = this.getNodeParameter(
            'automationId',
            i
          ) as string;

          if (!automationId) {
            throw new NodeOperationError(
              this.getNode(),
              'Please select an automation',
              { itemIndex: i }
            );
          }

          if (operation === 'list') {
            // GET /listPlaceholdersV2 - List placeholders (v2 format)
            responseData =
              await this.helpers.httpRequestWithAuthentication.call(
                this,
                'docsAutomatorApi',
                {
                  method: 'GET',
                  url: `${BASE_URL}/listPlaceholdersV2`,
                  qs: { automationId },
                  json: true,
                }
              );
          } else {
            throw new NodeOperationError(
              this.getNode(),
              `Unknown placeholder operation: ${operation}`,
              { itemIndex: i }
            );
          }
        }
        // ============================================
        // Template Resource
        // ============================================
        else if (resource === 'template') {
          if (operation === 'duplicateGoogleDoc') {
            // POST /duplicateGoogleDocTemplate - Duplicate Google Doc template
            const automationId = this.getNodeParameter(
              'automationId',
              i
            ) as string;
            const newTemplateName = this.getNodeParameter(
              'newTemplateName',
              i,
              ''
            ) as string;

            if (!automationId) {
              throw new NodeOperationError(
                this.getNode(),
                'Please select an automation',
                { itemIndex: i }
              );
            }

            const qs: IDataObject = { automationId };
            if (newTemplateName) {
              qs.newTemplateName = newTemplateName;
            }

            responseData =
              await this.helpers.httpRequestWithAuthentication.call(
                this,
                'docsAutomatorApi',
                {
                  method: 'POST',
                  url: `${BASE_URL}/duplicateGoogleDocTemplate`,
                  qs,
                  json: true,
                }
              );
          } else {
            throw new NodeOperationError(
              this.getNode(),
              `Unknown template operation: ${operation}`,
              { itemIndex: i }
            );
          }
        }
        // ============================================
        // Unknown Resource
        // ============================================
        else {
          throw new NodeOperationError(
            this.getNode(),
            `Unknown resource: ${resource}`,
            { itemIndex: i }
          );
        }

        // Handle array or single response
        const executionData = this.helpers.constructExecutionMetaData(
          this.helpers.returnJsonArray(responseData!),
          { itemData: { item: i } }
        );
        returnData.push(...executionData);
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
