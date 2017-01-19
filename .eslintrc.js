module.exports = {
    "extends": "airbnb",
    "installedESLint": true,
    "plugins": [
        "react",
        "jsx-a11y",
        "import"
    ],
    "rules": {
      "require-jsdoc": ["warn", {
          "require": {
              "FunctionDeclaration": true,
              "MethodDefinition": true,
              "ClassDeclaration": false,
              "ArrowFunctionExpression": false
          }
      }],
      "valid-jsdoc": "warn"
    }
};
