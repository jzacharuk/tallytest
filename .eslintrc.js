module.exports = {
  extends: 'airbnb',
  installedESLint: true,
  plugins: [
    'react',
    'jsx-a11y',
    'import',
  ],
  rules: {
    'require-jsdoc': [1, {
      'require': {
        'ClassDeclaration': false,
        'MethodDefinition': true,
        'FunctionDeclaration': true,
        'ArrowFunctionExpression': false,
      }
    }],
    'valid-jsdoc': 1,
  },
};
