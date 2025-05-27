# n8n-nodes-docsautomator

This is an n8n community node for DocsAutomator, a powerful document automation tool. It allows you to create documents automatically using your existing automations.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)  
[Operations](#operations)  
[Credentials](#credentials)  
[Usage](#usage)  
[Resources](#resources)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

### Document Creation

The DocsAutomator node focuses on one primary operation:

- **Create Document**: Creates a document using a selected automation with customizable placeholder values

## Credentials

This node requires DocsAutomator API credentials:

1. Log in to your DocsAutomator account
2. Navigate to API settings
3. Generate an API key
4. In n8n, create new DocsAutomator credentials and enter your API key

## Usage

### How to Use the Node

1. **Add the DocsAutomator node** to your workflow

2. **Set up credentials**: Configure your DocsAutomator API credentials

3. **Select an automation**: Choose from the dropdown list of available automations

4. **View available placeholders**:

   - Click on the "Available Placeholders" dropdown
   - You'll see all available placeholders for the selected automation
   - An example JSON format is shown at the bottom of the dropdown

5. **Enter placeholder values**:
   - In the "Placeholder Values" field, enter a JSON object with your values
   - Use the exact placeholder names shown in the dropdown
   - You can use n8n expressions to pull data from previous nodes

### Example Workflow

Here's a simple example of creating an invoice:

1. Select the "Invoice Template" automation
2. Click the "Available Placeholders" dropdown to see placeholders like:

   - `customer_name (text)`
   - `invoice_number (text)`
   - `invoice_date (text)`
   - Example JSON format shown in dropdown

3. Enter placeholder values in JSON format:
   ```json
   {
     "customer_name": "John Doe",
     "invoice_number": "INV-001",
     "invoice_date": "2024-12-19"
   }
   ```

### Using Expressions

You can use n8n expressions to dynamically set values:

```json
{
  "customer_name": "{{ $json.customer.name }}",
  "invoice_number": "{{ $json.invoiceId }}",
  "invoice_date": "{{ $now.format('yyyy-MM-dd') }}"
}
```

### Tips

- **Copy placeholder names exactly**: The placeholder names are case-sensitive
- **Check the dropdown**: Always click the "Available Placeholders" dropdown to see the exact placeholder names and example format
- **Use expressions**: Leverage n8n's expression system to pull data from previous nodes
- **JSON validation**: Make sure your JSON is valid - the node will show an error if the syntax is incorrect
- **Handle errors**: Enable "Continue On Fail" in the node settings to handle errors gracefully

### Migration from Old Version

If you're upgrading from an older version of this node:

1. The node no longer requires manual Doc ID entry
2. Resource and operation selections have been removed
3. Placeholder values are entered as JSON instead of individual fields
4. Use the "Available Placeholders" dropdown to see available placeholders and example format

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
- [DocsAutomator API documentation](https://docs.docsautomator.co/)
- [DocsAutomator website](https://docsautomator.co/)
