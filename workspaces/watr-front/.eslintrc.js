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
    // 'prettier',
    // 'prettier/vue',
    // 'plugin:prettier/recommended',
    'plugin:nuxt/recommended'
  ],
  plugins: [
    'prettier'
  ],
  // add your custom rules here
  rules: {
    'no-unused-vars': 0,
    'vue/no-unused-components': 0,
    'vue/multiline-html-element-content-newline': 0,

    "vue/html-indent": ["off"],
    "vue/max-attributes-per-line": ["off"],
    "vue/attributes-order": ["off"],

    "vue/script-indent": ['off'],

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
