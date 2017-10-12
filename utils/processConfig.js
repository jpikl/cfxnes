/* eslint-env node */
/* eslint-disable import/unambiguous */

const fs = require('fs');

const eslintDirectives = [
  'env node',
  'disable import/unambiguous',
];

function processConfig(config, file) {
  if (fs.existsSync(file)) {
    Object.assign(config, require(file));
  } else {
    fs.writeFileSync(file, serializeConfig(config));
  }
}

function serializeConfig(config) {
  const header = eslintDirectives.map(d => `/* eslint-${d} */`).join('\n');
  const data = JSON.stringify(config, null, '  ')
    .replace(/"(\w+)":/g, '$1:')
    .replace(/"/g, '\'')
    .replace(/\n}/, ',\n}');
  return `${header}\n\nmodule.exports = ${data};\n`;
}

module.exports = processConfig;
