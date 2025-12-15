# n8n-nodes-docsautomator

This is an n8n community node for DocsAutomator, a powerful document automation tool. It allows you to create documents, manage automations, and access various DocsAutomator features directly from your n8n workflows.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)
[Operations](#operations)
[Credentials](#credentials)
[Usage](#usage)
[Resources](#resources)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

The DocsAutomator node supports the following resources and operations:

### Automation

Manage your DocsAutomator automations:

| Operation | Description |
|-----------|-------------|
| **Get Many** | List all automations in your workspace |
| **Get** | Get a single automation by ID |
| **Create** | Create a new automation |
| **Update** | Update an existing automation |
| **Delete** | Delete an automation |
| **Duplicate** | Create a copy of an automation |

### Document

Create documents using your automations:

| Operation | Description |
|-----------|-------------|
| **Create** | Generate a document from an automation with placeholder data |

### Placeholder

Discover placeholders in your templates:

| Operation | Description |
|-----------|-------------|
| **List** | List placeholders for an automation (structured format with line item grouping) |

### Template

Manage Google Doc templates:

| Operation | Description |
|-----------|-------------|
| **Duplicate Google Doc** | Create a copy of a Google Doc template |

## Credentials

This node requires DocsAutomator API credentials:

1. Log in to your DocsAutomator account.
2. Navigate to your workspace settings > API Key.
3. Copy the API key.
4. In n8n, create new "DocsAutomator API" credentials and paste your API key into the provided field.

## Usage

### Creating Documents

1. **Add the DocsAutomator node** to your n8n workflow.
2. **Set up Credentials**: Select your configured DocsAutomator API credentials.
3. **Select Resource**: Choose "Document" and operation "Create".
4. **Select an Automation**: Choose from the dropdown (only API/n8n automations are shown).
5. **Map Placeholder Values**: Fill in values for each placeholder in your template.
6. **Configure Line Items (Optional)**: Add line item data as JSON arrays.
7. **Set Processing Options**:
   - **Preview Mode**: Generate a preview instead of the final document.
   - **Async Processing**: Return immediately with a jobId for tracking.

### Managing Automations

Use the Automation resource to programmatically manage your automations:

```
Automation > Get Many    → List all automations
Automation > Create      → Create new automation with title and data source
Automation > Update      → Modify settings like locale, PDF expiration, template link, etc.
Automation > Duplicate   → Clone an existing automation
Automation > Delete      → Remove an automation
```

### Discovering Placeholders

Before creating documents, you can discover what placeholders are available:

```
Placeholder > List → Returns structured placeholder data:
{
  "placeholders": {
    "main": ["customer_name", "invoice_number"],
    "line_items_1": ["item_name", "quantity", "price"]
  }
}
```

### Example: Invoice Generation with Line Items

1. **Select**: Document > Create
2. **Automation**: Choose "Invoice Generation"
3. **Placeholder Values**:
   - `customer_name`: `{{ $json.customer.fullName }}`
   - `invoice_number`: `{{ $json.invoiceDetails.id }}`
   - `invoice_date`: `{{ $now.toFormat('yyyy-MM-dd') }}`
4. **Line Items**:
   - Type: "Line Items 1"
   - JSON:
     ```json
     [
       {
         "item_description": "Widget A",
         "item_quantity": 2,
         "item_unit_price": 10.00
       },
       {
         "item_description": "Widget B",
         "item_quantity": 1,
         "item_unit_price": 25.50
       }
     ]
     ```

### Tips for Success

- **JSON Structure for Line Items**: Ensure valid JSON array of objects matching your template placeholders.
- **Use n8n Expressions**: Dynamically map data from previous nodes.
- **Error Handling**: Use "Continue On Fail" or error workflows.

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
- [DocsAutomator API documentation](https://docs.docsautomator.co/)
- [DocsAutomator website](https://docsautomator.co/)
