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

          return automations.map((automation: any) => {
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

        let body: IDataObject = {};

        // Extract values from resourceMapper format
        if (placeholderValues && placeholderValues.value) {
          body = placeholderValues.value;
        }

        // Create the document
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
