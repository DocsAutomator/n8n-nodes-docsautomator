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
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Document',
            value: 'document',
          },
          {
            name: 'Automation',
            value: 'automation',
          },
          {
            name: 'Placeholder',
            value: 'placeholder',
          },
        ],
        default: 'document',
      },
      // Operations for Document resource
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
            description: 'Create a document',
            action: 'Create a document',
          },
        ],
        default: 'create',
      },
      // Operations for Automation resource
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
            name: 'Get All',
            value: 'getAll',
            description: 'Get all automations',
            action: 'Get all automations',
          },
        ],
        default: 'getAll',
      },
      // Operations for Placeholder resource
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
            description: 'List all placeholders for a template',
            action: 'List all placeholders for a template',
          },
        ],
        default: 'list',
      },
      // Parameters for Create Document operation
      {
        displayName: 'Doc ID',
        name: 'docId',
        type: 'string',
        displayOptions: {
          show: {
            resource: ['document'],
            operation: ['create'],
          },
        },
        default: '',
        required: true,
        description: 'ID of the automation to use for document creation',
      },
      {
        displayName: 'Placeholder Notice',
        name: 'placeholderNotice',
        type: 'notice',
        displayOptions: {
          show: {
            resource: ['document'],
            operation: ['create'],
          },
        },
        default:
          'Select a Doc ID first, then add values for each placeholder. Already mapped placeholders will not show up in the dropdown again.',
      },
      {
        displayName: 'Placeholder Values',
        name: 'placeholderValues',
        type: 'fixedCollection',
        typeOptions: {
          multipleValues: true,
          multipleValueButtonText: 'Add Placeholder Value',
          sortable: true,
        },
        displayOptions: {
          show: {
            resource: ['document'],
            operation: ['create'],
          },
        },
        default: {},
        options: [
          {
            name: 'values',
            displayName: 'Values',
            values: [
              {
                displayName: 'Placeholder Name',
                name: 'name',
                type: 'options',
                typeOptions: {
                  loadOptionsMethod: 'getPlaceholders',
                  loadOptionsDependsOn: ['docId', 'placeholderValues'],
                },
                default: '',
                description: 'Name of the placeholder',
              },
              {
                displayName: 'Placeholder Value',
                name: 'value',
                type: 'string',
                default: '',
                description: 'Value to fill in the placeholder',
              },
            ],
          },
        ],
        description: 'Values to fill in placeholders in the template',
      },
      // Parameters for List Placeholders operation
      {
        displayName: 'Doc ID',
        name: 'docId',
        type: 'string',
        displayOptions: {
          show: {
            resource: ['placeholder'],
            operation: ['list'],
          },
        },
        default: '',
        required: true,
        description: 'ID of the automation to list placeholders for',
      },
    ],
  };

  // Methods for loading options
  methods = {
    loadOptions: {
      async getPlaceholders(
        this: ILoadOptionsFunctions
      ): Promise<INodePropertyOptions[]> {
        const docId = this.getCurrentNodeParameter('docId') as string;
        const placeholderValues = this.getCurrentNodeParameter(
          'placeholderValues'
        ) as IDataObject;

        if (!docId) {
          return [{ name: 'Please provide a Doc ID first', value: '' }];
        }

        const credentials = await this.getCredentials('docsAutomatorApi');
        if (!credentials) {
          return [{ name: 'Please provide valid credentials', value: '' }];
        }

        const apiKey = credentials.apiKey as string;

        try {
          // Fetch placeholders from the API
          const options: OptionsWithUri = {
            method: 'GET',
            uri: 'https://api.docsautomator.co/listPlaceholdersV2',
            qs: {
              docId,
            },
            json: true,
            headers: {
              Authorization: `Bearer ${apiKey}`,
            },
          };

          const response = await this.helpers.requestWithAuthentication.call(
            this,
            'docsAutomatorApi',
            options
          );

          if (!response || !response.placeholders) {
            return [{ name: 'No placeholders found', value: '' }];
          }

          const placeholders: INodePropertyOptions[] = [];

          // Add main placeholders
          if (
            response.placeholders.main &&
            Array.isArray(response.placeholders.main)
          ) {
            for (const placeholder of response.placeholders.main) {
              placeholders.push({
                name: placeholder,
                value: placeholder,
              });
            }
          }

          // Add line items placeholders (if any)
          for (const key in response.placeholders) {
            if (
              key.startsWith('line_items_') &&
              Array.isArray(response.placeholders[key])
            ) {
              for (const placeholder of response.placeholders[key]) {
                const lineItemPlaceholder = `${key}.${placeholder}`;
                placeholders.push({
                  name: lineItemPlaceholder,
                  value: lineItemPlaceholder,
                });
              }
            }
          }

          // Filter out already selected placeholders
          const alreadySelected: string[] = [];
          if (placeholderValues && placeholderValues.values) {
            const values = placeholderValues.values as IDataObject[];
            for (const item of values) {
              if (item.name && typeof item.name === 'string') {
                alreadySelected.push(item.name);
              }
            }
          }

          return placeholders.filter(
            (placeholder) =>
              !alreadySelected.includes(placeholder.value as string)
          );
        } catch (error) {
          console.error('Error loading placeholders:', error);
          return [{ name: 'Error loading placeholders', value: '' }];
        }
      },
    },
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: IDataObject[] = [];
    const length = items.length;
    const resource = this.getNodeParameter('resource', 0) as string;
    const operation = this.getNodeParameter('operation', 0) as string;

    const credentials = await this.getCredentials('docsAutomatorApi');
    const apiKey = credentials.apiKey as string;

    // For each item
    for (let i = 0; i < length; i++) {
      let responseData;

      if (resource === 'document' && operation === 'create') {
        const docId = this.getNodeParameter('docId', i) as string;
        const placeholderValuesCollection = this.getNodeParameter(
          'placeholderValues',
          i
        ) as IDataObject;

        const placeholderValues: IDataObject = {};

        if (placeholderValuesCollection && placeholderValuesCollection.values) {
          for (const item of placeholderValuesCollection.values as IDataObject[]) {
            placeholderValues[item.name as string] = item.value;
          }
        }

        const options: OptionsWithUri = {
          method: 'POST',
          uri: 'https://api.docsautomator.co/createDocument',
          qs: {
            docId,
          },
          body: placeholderValues,
          json: true,
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        };

        responseData = await this.helpers.request(options);
      }

      if (resource === 'automation' && operation === 'getAll') {
        const options: OptionsWithUri = {
          method: 'GET',
          uri: 'https://api.docsautomator.co/automations',
          json: true,
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        };

        responseData = await this.helpers.request(options);
      }

      if (resource === 'placeholder' && operation === 'list') {
        const docId = this.getNodeParameter('docId', i) as string;

        const options: OptionsWithUri = {
          method: 'GET',
          uri: 'https://api.docsautomator.co/listPlaceholdersV2',
          qs: {
            docId,
          },
          json: true,
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        };

        responseData = await this.helpers.request(options);
      }

      if (Array.isArray(responseData)) {
        returnData.push.apply(returnData, responseData);
      } else if (responseData !== undefined) {
        returnData.push(responseData);
      }
    }

    return [this.helpers.returnJsonArray(returnData)];
  }
}
