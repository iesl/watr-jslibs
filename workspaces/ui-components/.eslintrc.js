module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  parserOptions: {
    parser: 'babel-eslint'
  },
  extends: [
    '@nuxtjs',
    'plugin:nuxt/recommended'
  ],
  plugins: [
  ],
  // add your custom rules here
  rules: {
    'no-unused-vars': 0,
    'vue/no-unused-components': 0,
    'vue/multiline-html-element-content-newline': 0,

    "vue/html-indent": ["warn", 4, {
      "attribute": 1,
      "baseIndent": 0,
      "closeBracket": 0,
      "alignAttributesVertically": true,
      "ignores": []
    }],

    "vue/script-indent": ["warn", 2, {
      "baseIndent": 1,
      "switchCase": 0,
      "ignores": []
    }],

    'vue/html-self-closing': ['warn', {
      'html': {
        void: 'any',
        normal: 'any'
      }

    }],
    'space-before-function-paren': ['off']
  },

  "overrides": [
    {
      "files": ["*.vue"],
      "rules": {
        "indent": "off"
      }
    }
  ]

}
