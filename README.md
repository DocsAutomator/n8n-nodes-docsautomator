# n8n-nodes-docsautomator

This is an n8n community node for DocsAutomator, a powerful document automation tool. It includes nodes to create documents and work with automations.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)  
[Operations](#operations)  
[Credentials](#credentials)  
[Resources](#resources)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

### Document Creation

- **Create Document**: Creates a document using a selected automation with individual placeholder input fields
  - **Automation Selection**: Choose from a dropdown of all available automations
  - **Individual Placeholder Fields**: Add placeholder entries with name/value pairs
  - **Dynamic Field Loading**: Available placeholders are automatically loaded based on selected automation

## Usage

### Creating Documents with Placeholders

1. **Select Automation**: Choose from the dropdown of available automations (automatically loaded from your account)
2. **Add Placeholder Values**: Click "Add Placeholder" to create entries for each placeholder you want to set
3. **Configure Each Placeholder**: For each entry, select the placeholder name from the dropdown and enter its value
4. **Execute**: Run the workflow to create your document with the specified placeholder values

### Placeholder Types

The node automatically handles both types of placeholders:

- **Main Placeholders**: Simple placeholders like `customer_name`, `invoice_number`
- **Line Item Placeholders**: Complex placeholders for repeating data like `line_items_1.description`, `line_items_1.quantity`

### Benefits of This Approach

- **User-Friendly Interface**: Individual input fields eliminate JSON syntax errors and confusion
- **Dynamic Loading**: All automations and placeholders are loaded from your DocsAutomator account
- **Clear Placeholder Selection**: Dropdown lists show all available placeholders for easy selection
- **No Manual Entry**: No need to manually enter Doc IDs or guess placeholder names
- **Error Prevention**: Individual fields prevent common JSON formatting mistakes

### Example Workflow

1. Add the DocsAutomator node to your workflow
2. Configure your API credentials
3. Choose an automation from the dropdown (e.g., "Invoice Template")
4. Add placeholder entries:
   - Click "Add Placeholder"
   - Select "customer_name" from dropdown, enter "John Doe"
   - Click "Add Placeholder" again
   - Select "invoice_number" from dropdown, enter "INV-001"
   - Click "Add Placeholder" again
   - Select "line_items_1.description" from dropdown, enter "Product A"
   - Add more placeholders as needed
5. Execute the workflow to create your document
6. Document is created and URLs are returned in the response

## Credentials

To use the DocsAutomator node, you'll need to create an API key in your DocsAutomator account and configure it in n8n's credentials section.

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
- [DocsAutomator API Documentation](https://docs.docsautomator.co/integrations-api/docsautomator-api)
