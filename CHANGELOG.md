# Changelog

## [0.4.4] - 2024-12-27

### Added

- **Unique Line Item Selection**: Each line item type can now only be selected once
- Line item types already added are automatically filtered out from the dropdown
- Shows "All available line item types have been added" message when all types are used

### Improved

- **Better User Experience**: Prevents duplicate line item configurations
- **Clear Feedback**: Helpful message when no more line item types are available to add
- **Automatic Filtering**: Already selected line item types are excluded from future selections

## [0.4.3] - 2024-12-27

### Improved

- **Cleaner Line Item Names**: Line item dropdown now shows clean names like "Line Items 1", "Line Items 2" instead of listing all placeholders
- Removed placeholder list from line item type names for better readability
- Users can still see available placeholders in the main placeholder section as reference

## [0.4.2] - 2024-12-27

### Fixed

- **Line Items UI Visibility**: Fixed Line Items section not appearing when automation is selected
- Corrected `displayOptions` syntax from `show: { automationId: ['!', ''] }` to `hide: { automationId: [''] }`
- Line Items section now properly appears below placeholder values when an automation is selected
- Users can now click "Add Line Item" button to configure line item data

## [0.4.1] - 2024-12-27

### Fixed

- **Line Items API Structure**: Fixed line items parsing to match actual DocsAutomator API response structure
- Line item types are now correctly read from separate keys (`line_items_1`, `line_items_2`, etc.) at the same level as `main`
- Placeholders within line item types no longer expect prefixes and are read directly from each line item array
- Updated both `getLineItemTypes` and `getPlaceholderFields` methods to handle the correct API response format
- Enhanced logging shows correct API response structure for debugging

### Technical Changes

- Modified line item parsing logic to iterate through response.placeholders keys matching `/^line_items_\d+$/` pattern
- Updated placeholder field generation to correctly display line item placeholders as informational fields
- Fixed line item detection for showing helpful notices about separate line item configuration

## [0.4.0] - 2024-12-27

### Added

- **Line Items Support**: Added comprehensive support for DocsAutomator line items (dynamic tables)
- **Line Item Types Dropdown**: Automatically loads available line item types from the API (e.g., line_items_1, line_items_2)
- **JSON Array Input**: Each line item type accepts a JSON array where each object represents a table row
- **Dynamic Placeholder Discovery**: Shows available placeholders for each line item type in the dropdown description
- **Array Data Processing**: Properly structures line item arrays for the DocsAutomator API

### Technical Implementation

- Added `getLineItemTypes` loadOptions method to fetch available line item types from `listPlaceholdersV2` endpoint
- Implemented `fixedCollection` UI component for managing multiple line item sets
- Enhanced execute method to process both main placeholders and line item arrays
- Added JSON parsing with error handling for line item data validation
- Maintains backward compatibility with existing main placeholder functionality

### User Experience

- **Line Item Configuration**: Users can add multiple line item sets via "Add Line Item" button
- **Type Selection**: Dropdown shows available line item types with their placeholder names
- **JSON Input**: Rich JSON editor with syntax highlighting and validation
- **Example Format**: Helpful hints showing the expected JSON array structure
- **Error Handling**: Clear error messages for malformed JSON input

### API Integration

- Correctly structures data for DocsAutomator API with separate main placeholders and line item arrays
- Line items are passed as `{ "line_items_1": [...], "line_items_2": [...] }` format
- Maintains compatibility with existing document creation workflow

## [0.3.1] - 2024-12-27

### Changed

- **Icon Update**: Changed node icon from `docsautomator.svg` to `docsautomator-icon.svg`

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
