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


    "vue/html-indent": ["warn", 4, {
      "attribute": 1,
      "baseIndent": 0,
      "closeBracket": 0,
      "alignAttributesVertically": true,
      "ignores": []
    }],


    'vue/html-self-closing': ['warn', {
      'html': {
        void: 'any',
        normal: 'any'
      }

    }],
    'space-before-function-paren': ['off']
  }
}
