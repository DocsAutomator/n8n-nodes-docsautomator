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

- **Create Document**: Creates a document using a selected automation with smart template generation
  - **Automation Selection**: Choose from a dropdown of all available automations
  - **Smart Template Generation**: Automatically creates JSON templates with all available placeholders
  - **Efficient Workflow**: Copy template, replace values, execute - no repetitive clicking required

## Usage

### Creating Documents with Placeholders

1. **Select Automation**: Choose from the dropdown of available automations (automatically loaded from your account)
2. **Copy Template**: The node automatically generates a complete JSON template with all available placeholders
3. **Replace Values**: Edit the copied template by replacing empty strings with your actual data
4. **Execute**: Run the workflow to create your document with the specified placeholder values

### Placeholder Types

The node automatically handles both types of placeholders:

- **Main Placeholders**: Simple placeholders like `customer_name`, `invoice_number`
- **Line Item Placeholders**: Complex placeholders for repeating data like `line_items_1.description`, `line_items_1.quantity`

### Benefits of This Approach

- **Ultra-Efficient**: See all placeholders at once instead of adding them one by one
- **Template-Based**: Pre-filled JSON template shows exactly what placeholders are available
- **No Repetitive Clicking**: Single copy-paste operation replaces multiple "Add Placeholder" clicks
- **Dynamic Loading**: All automations and placeholders are automatically loaded from your account
- **Clear Structure**: JSON template format makes it easy to see relationships between placeholders

### Example Workflow

1. Add the DocsAutomator node to your workflow
2. Configure your API credentials
3. Choose an automation from the dropdown (e.g., "Invoice Template")
4. Copy the auto-generated template from the notice field:
   ```json
   {
     "customer_name": "",
     "invoice_number": "",
     "line_items_1.description": "",
     "line_items_1.quantity": "",
     "line_items_1.price": ""
   }
   ```
5. Replace the empty values with your data:
   ```json
   {
     "customer_name": "John Doe",
     "invoice_number": "INV-001",
     "line_items_1.description": "Product A",
     "line_items_1.quantity": "2",
     "line_items_1.price": "50.00"
   }
   ```
6. Paste the completed JSON into the placeholder values field
7. Execute the workflow to create your document
8. Document is created and URLs are returned in the response

## Credentials

To use the DocsAutomator node, you'll need to create an API key in your DocsAutomator account and configure it in n8n's credentials section.

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
- [DocsAutomator API Documentation](https://docs.docsautomator.co/integrations-api/docsautomator-api)
