module.exports = {
  root: true,
  env: {
    node: true,
    mocha: true,
    es6: true
  },

  parser: '@typescript-eslint/parser',
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  plugins: [
    "@typescript-eslint",
    "chai-expect"
  ],

  globals: {
    expect: true,
  },
  rules: {
  },

  "overrides": [
    {
      "files": ["*.ts"],
      "excludedFiles": ["*.d.ts"],
      "rules": {
        "indent": "off"
      }
    }
  ]

}
