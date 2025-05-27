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

- **Create Document**: Creates a document using a selected automation with automatic placeholder discovery
  - **Automation Selection**: Choose from a dropdown of all available automations
  - **Automatic Placeholder Discovery**: Available placeholders are automatically fetched and displayed
  - **JSON Input**: Simple JSON input for placeholder values with clear examples

## Usage

### Creating Documents with Placeholders

1. **Select Automation**: Choose from the dropdown of available automations (automatically loaded from your account)
2. **Discover Placeholders**: Run the workflow once with empty placeholder values `{}` to see what placeholders are available
3. **Enter Placeholder Values**: Update the JSON field with your actual placeholder values and run again to create the document

### Placeholder Types

The node automatically handles both types of placeholders:

- **Main Placeholders**: Simple placeholders like `customer_name`, `invoice_number`
- **Line Item Placeholders**: Complex placeholders for repeating data like `line_items_1.description`, `line_items_1.quantity`

### Benefits of This Approach

- **Automatic Discovery**: All automations and placeholders are loaded from your DocsAutomator account
- **Clear Visibility**: Available placeholders are shown in the execution output for easy reference
- **No Manual Entry**: No need to manually enter Doc IDs or guess placeholder names
- **Flexible Input**: Simple JSON input allows for easy copying/modification of placeholder values
- **Better Debugging**: Failed executions still show available placeholders for troubleshooting

### Example Workflow

1. Add the DocsAutomator node to your workflow
2. Configure your API credentials
3. Choose an automation from the dropdown (e.g., "Invoice Template")
4. First execution with empty values `{}`:
   - Shows available placeholders in execution output
   - Example output shows: `["customer_name", "invoice_number", "line_items_1.description"]`
5. Second execution with actual values:
   ```json
   {
     "customer_name": "John Doe",
     "invoice_number": "INV-001",
     "line_items_1.description": "Product A",
     "line_items_1.quantity": "2",
     "line_items_1.price": "50.00"
   }
   ```
6. Document is created and URLs are returned in the response

## Credentials

To use the DocsAutomator node, you'll need to create an API key in your DocsAutomator account and configure it in n8n's credentials section.

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
- [DocsAutomator API Documentation](https://docs.docsautomator.co/integrations-api/docsautomator-api)
