module.exports = {
	nodeTypes: [
		require('./dist/nodes/DocsAutomator/DocsAutomator.node.js'),
	],
	credentialTypes: [
		require('./dist/credentials/DocsAutomatorApi.credentials.js'),
	],
}; 