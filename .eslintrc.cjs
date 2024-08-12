/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  root: true,
  env: {
    webextensions: true
  },
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/eslint-config-prettier/skip-formatting'
  ],
  globals: {
    // We use this in content.js when using the CSS Custom Highlight API.
    Highlight: 'readonly'
  },
  parserOptions: {
    ecmaVersion: 'latest'
  }
}
