# Changelog

## [Unreleased] - 2024-12-19

### Changed

- **BREAKING**: Completely redesigned the node interface for simplicity
- Removed resource/operation selection - node now focuses solely on document creation
- Replaced Doc ID input with an Automation dropdown that fetches available automations from the API
- Simplified placeholder handling with JSON input and automatic placeholder discovery

### Added

- **Automation Selection**: Dropdown that fetches and displays all available automations from `/automations` endpoint
- **Smart Template Generation**: Automatically generates a complete JSON template with all available placeholders pre-filled
- **Efficient Placeholder Workflow**: Copy template → Replace values → Paste back - no more clicking "Add Placeholder" repeatedly
- **Visual Placeholder Preview**: All available placeholders are displayed in an organized template format

### Improved

- **User Experience**: Ultra-efficient template-based approach eliminates repetitive clicking
- **Workflow Speed**: See all placeholders at once and fill them in bulk rather than one-by-one
- **Template Convenience**: Pre-filled JSON template makes it easy to see structure and required fields
- **API Integration**: Enhanced integration with both `/automations` and `/listPlaceholdersV2` endpoints
- **Workflow Simplicity**: Select automation → Copy template → Replace values → Execute

### Technical Changes

- Simplified node structure by removing resource/operation selection entirely
- Implemented smart template generation using `getPlaceholderInfo` method that creates pre-filled JSON templates
- Enhanced placeholder loading to support both main placeholders and line item placeholders in organized template format
- Streamlined execution method to parse JSON input and filter out empty values automatically
- Improved error handling for API requests and authentication
- Updated to use automations endpoint instead of requiring manual Doc ID entry
- Fixed authentication issues by using direct API calls with Bearer token headers
- Optimized user experience by eliminating repetitive "Add Placeholder" button clicking

### Migration Guide

If you're upgrading from a previous version:

**Old workflow**:

1. Select "Document" resource → "Create" operation
2. Enter Doc ID manually
3. Enter JSON object with placeholder values

**New workflow**:

1. Select automation from dropdown (automatically populated)
2. Copy the auto-generated JSON template from the notice
3. Replace empty values with your actual data
4. Paste the completed JSON into the placeholder values field
5. Execute to create document

**Example**:

- Select automation: "Invoice Template"
- Copy template: `{"customer_name": "", "invoice_number": "", "line_items_1.description": ""}`
- Replace values: `{"customer_name": "John Doe", "invoice_number": "INV-001", "line_items_1.description": "Product A"}`
- Execute to create document

The new approach provides all placeholders at once in a clean template format, eliminating repetitive clicking while maintaining JSON simplicity.
