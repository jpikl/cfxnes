const advancedVariablesPlugin = require('postcss-advanced-variables');
const cssnextPlugin = require('postcss-cssnext');
const importPlugin = require('postcss-import');
const mixinsPlugin = require('postcss-mixins');
const urlPlugin = require('postcss-url');

module.exports = {
  plugins: [
    importPlugin,
    mixinsPlugin,
    advancedVariablesPlugin,
    cssnextPlugin,
    urlPlugin,
  ],
};
