# Changelog

## [0.3.0] - 2024-12-27

### Updated

- **n8n Compatibility**: Updated to latest n8n versions for improved compatibility
- Updated `n8n-core` from `^0.140.0` to `^1.94.0`
- Updated `n8n-workflow` from `^0.120.0` to `^1.82.0`
- Updated TypeScript from `~4.8.4` to `~5.3.0` for better compatibility
- Updated `@typescript-eslint/parser` from `~5.45` to `~6.21.0`

### Technical Changes

- Enhanced TypeScript configuration for latest n8n package compatibility
- Added path mapping for `@/*` imports to resolve n8n-workflow dependencies
- Added `skipLibCheck` option to handle third-party type checking
- Updated target to ES2020 for better modern JavaScript support
- Improved module resolution for latest n8n API interfaces

### Fixed

- Resolved TypeScript compilation errors with latest n8n-workflow package
- Fixed module resolution issues for `@/errors/error.types` imports
- Fixed `export type *` syntax compatibility issues

## [0.2.0] - 2024-12-19

### Changed

- **BREAKING**: Completely redesigned the node interface for simplicity
- Removed resource/operation selection - node now focuses solely on document creation
- Replaced Doc ID input with an Automation dropdown that fetches available automations from the API
- Simplified placeholder value entry with a JSON editor

### Added

- **Automation Selection**: Dropdown that fetches and displays all available automations from `/automations` endpoint
- **Placeholder Discovery**: "Available Placeholders" dropdown that shows all placeholders for the selected automation
- **Example JSON Format**: Automatically generated example JSON shown in the placeholder dropdown
- **Expression Support**: Full support for n8n expressions in the JSON values

### Improved

- **User Experience**: Clear display of available placeholders with example format
- **Placeholder Discovery**: Click dropdown to see all available placeholders with their types
- **Flexible Input**: Use JSON format with full expression support
- **Better Error Messages**: Clear error when JSON syntax is invalid
- **API Integration**: Enhanced integration with both `/automations` and `/listPlaceholdersV2` endpoints

### Technical Changes

- Simplified node structure by removing resource/operation selection entirely
- Implemented JSON editor for placeholder values with expression support
- Added placeholder discovery through loadOptionsMethod dropdown
- Streamlined execution method to parse JSON and send to API
- Improved error handling for API requests and JSON parsing
- Fixed authentication issues by using direct Bearer token headers
- Fixed parameter naming (using `automationId` instead of `docId` for API calls)

### Migration Guide

If you're upgrading from a previous version:

**Old workflow**:

1. Select "Document" resource → "Create" operation
2. Enter Doc ID manually
3. Enter JSON object with placeholder values

**New workflow**:

1. Select automation from dropdown (automatically populated from your DocsAutomator account)
2. Click "Available Placeholders" dropdown to see all available placeholders and example format
3. Enter placeholder values in the JSON editor using the exact names shown
4. Execute to create document

**Example**:

- Select automation: "Invoice Template"
- Click "Available Placeholders" dropdown to see:
  - customer_name (text)
  - invoice_number (text)
  - invoice_date (text)
  - Example JSON format
- Enter values in JSON editor:
  ```json
  {
    "customer_name": "John Doe",
    "invoice_number": "INV-001",
    "invoice_date": "2024-12-19"
  }
  ```
- Execute to create document

The new approach provides:

- Automatic automation discovery
- Easy placeholder discovery through dropdown
- JSON editor with expression support
- Clear example format for each automation
