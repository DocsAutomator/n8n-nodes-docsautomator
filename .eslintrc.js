module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'n8n-nodes-base'],
  extends: ['plugin:n8n-nodes-base/nodes'],
  rules: {
    'n8n-nodes-base/node-param-description-missing-for-return-all': 'off',
    'n8n-nodes-base/node-class-description-missing-subtitle': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-var-requires': 'off',
  },
};
