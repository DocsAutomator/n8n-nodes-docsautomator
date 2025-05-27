# Changelog

## [Unreleased] - 2024-12-19

### Changed

- **BREAKING**: Completely redesigned the node interface for simplicity
- Removed resource/operation selection - node now focuses solely on document creation
- Replaced Doc ID input with an Automation dropdown that fetches available automations from the API
- Simplified placeholder handling with JSON input and automatic placeholder discovery

### Added

- **Automation Selection**: Dropdown that fetches and displays all available automations from `/automations` endpoint
- **Individual Placeholder Fields**: User-friendly interface with individual input fields for each placeholder
- **Dynamic Placeholder Loading**: Available placeholders are automatically loaded when an automation is selected
- **Smart Field Generation**: Separate input fields for both main placeholders and line item placeholders with descriptive labels

### Improved

- **User Experience**: Intuitive interface with individual labeled input fields for each placeholder
- **Error Prevention**: No more JSON syntax errors - each placeholder has its own dedicated input field
- **Field Discovery**: Placeholder names are automatically loaded and presented in dropdown selections
- **API Integration**: Enhanced integration with both `/automations` and `/listPlaceholdersV2` endpoints
- **Workflow Simplicity**: Select automation → add placeholder values → create document

### Technical Changes

- Simplified node structure by removing resource/operation selection entirely
- Implemented fixedCollection type with dynamic placeholder loading via `loadOptionsMethod`
- Enhanced placeholder loading to support both main placeholders and line item placeholders with proper descriptions
- Added `getPlaceholderOptions` method to dynamically load available placeholders based on selected automation
- Improved error handling for API requests and authentication
- Updated to use automations endpoint instead of requiring manual Doc ID entry
- Fixed authentication issues by using direct API calls with Bearer token headers
- Enhanced execution method to convert fixedCollection format to API-compatible key-value pairs

### Migration Guide

If you're upgrading from a previous version:

**Old workflow**:

1. Select "Document" resource → "Create" operation
2. Enter Doc ID manually
3. Enter JSON object with placeholder values

**New workflow**:

1. Select automation from dropdown (automatically populated)
2. Click "Add Placeholder" to add placeholder entries
3. For each placeholder: select name from dropdown → enter value in text field
4. Execute to create document

**Example**:

- Select automation: "Invoice Template"
- Add Placeholder 1: Name = "customer_name", Value = "John Doe"
- Add Placeholder 2: Name = "invoice_number", Value = "INV-001"
- Add Placeholder 3: Name = "line_items_1.description", Value = "Product A"
- Execute to create document

The new approach provides individual input fields for each placeholder, eliminating JSON syntax errors and making the interface much more user-friendly.
