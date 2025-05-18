# Installing DocsAutomator Node for n8n

## Local Installation

You can install the DocsAutomator node in your n8n instance by following these steps:

1. Navigate to your n8n installation directory
2. Run the following command:
   ```
   npm install n8n-nodes-docsautomator
   ```
3. Start or restart n8n

## Development Setup

If you want to develop or modify the node:

1. Clone this repository:
   ```
   git clone https://github.com/docsautomator/n8n-nodes-docsautomator.git
   ```
2. Navigate to the project directory:
   ```
   cd n8n-nodes-docsautomator
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Build the project:
   ```
   npm run build
   ```
5. Link the package to your n8n installation:
   ```
   npm link
   cd /path/to/n8n
   npm link n8n-nodes-docsautomator
   ```

## Usage

After installation, you can find the DocsAutomator node in the n8n node list. You'll need to provide your DocsAutomator API key in the credentials section. 