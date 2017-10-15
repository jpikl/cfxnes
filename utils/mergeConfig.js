const fs = require('fs');
const path = require('path');

function mergeConfig(config, file) {
  if (!fs.existsSync(file)) {
    const ext = path.extname(file);
    const prefix = file.substr(0, file.length - ext.length);
    const templateFile = `${prefix}.template${ext}`;
    if (fs.existsSync(templateFile)) {
      fs.copyFileSync(templateFile, file);
    }
  }
  if (fs.existsSync(file)) {
    Object.assign(config, require(file));
  }
}

module.exports = mergeConfig;
