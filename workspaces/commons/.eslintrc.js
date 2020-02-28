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
    "@typescript-eslint/no-explicit-any": ["off"],
    "@typescript-eslint/explicit-function-return-type": ["off"],
    "@typescript-eslint/explicit-function-return-type": ["off"],
    "@typescript-eslint/no-inferrable-types": ["off"],
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
