module.exports = {
    // "extends": "airbnb",
    "installedESLint": true,
    "env": {
      "mocha": true,
    },
    "plugins": [
        // "react",
        // "jsx-a11y",
        // "import"
    ],
    "rules": {
      "import/no-extraneous-dependencies": ["error", {"devDependencies": ["**/*.spec.js"]}]
    }
};
