# Changelog

## [Unreleased] - 2024-12-19

### Changed

- **BREAKING**: Completely redesigned the node interface for simplicity
- Removed resource/operation selection - node now focuses solely on document creation
- Replaced Doc ID input with an Automation dropdown that fetches available automations from the API
- Simplified placeholder handling with JSON input and automatic placeholder discovery

### Added

- **Automation Selection**: Dropdown that fetches and displays all available automations from `/automations` endpoint
- **Automatic Placeholder Discovery**: Available placeholders are automatically fetched and displayed in the execution output
- **Simplified Interface**: Clean, focused interface with just automation selection and placeholder values
- **Enhanced Execution Output**: Returns document creation results along with available and used placeholder information

### Improved

- **User Experience**: Streamlined interface focused on the core functionality
- **Placeholder Visibility**: Available placeholders are automatically discovered and logged for easy reference
- **Error Handling**: Better error handling with detailed placeholder information even when document creation fails
- **API Integration**: Enhanced integration with both `/automations` and `/listPlaceholdersV2` endpoints
- **Development Workflow**: First run shows available placeholders, second run creates document with provided values

### Technical Changes

- Simplified node structure by removing resource/operation selection entirely
- Removed complex collection-based placeholder handling in favor of JSON input
- Enhanced execution method to automatically fetch placeholders using `/listPlaceholdersV2` endpoint with correct `automationId` parameter
- Improved error handling for API requests and authentication
- Updated to use automations endpoint instead of requiring manual Doc ID entry
- Fixed authentication issues by using direct API calls with Bearer token headers
- Enhanced output to include both document creation results and placeholder metadata

### Migration Guide

If you're upgrading from a previous version:

**Old workflow**:

1. Select "Document" resource → "Create" operation
2. Enter Doc ID manually
3. Enter JSON object with placeholder values

**New workflow**:

1. Select automation from dropdown (automatically populated)
2. Run workflow once with empty placeholder values `{}` to see available placeholders
3. Update placeholder values JSON with actual values and run again to create document

**Example**:

1. First run: `{}` → See available placeholders in execution output
2. Second run: `{"customer_name": "John Doe", "invoice_number": "INV-001"}` → Create document

The new approach provides better visibility into available placeholders and a cleaner interface focused solely on document creation.
