const fs = require('fs');
const path = require('path');

const libDir = path.resolve(__dirname, '../lib');
const libFiles = [
  {name: 'dist/cfxnes.js', production: true},
  {name: 'dist/cfxnes.debug.js'},
  {name: 'src/cfxnes.js'},
];

function getLibFile(options = {}) {
  const {productionOnly = true, verbose = false} = options;
  const {stdout, stderr} = process;
  const log = verbose ? stdout.write.bind(stdout) : () => {};
  const logError = stderr.write.bind(stderr);
  const separator = '-'.repeat(80);

  log(`\n${separator}\n`);
  log('\nLooking for cfxnes.js...\n\n');

  const result = libFiles
    .filter(({production}) => !productionOnly || production)
    .map(({name}) => {
      const file = path.resolve(libDir, name);
      const exists = fs.existsSync(file);
      log(`[${(exists ? '\u2713' : '\u2717')}] ${file}\n`);
      return {file, exists};
    })
    .filter(({exists}) => exists)
    .map(({file}) => file)[0];

  log('\n');

  if (result) {
    log(`Using ${result}\n\n`);
  } else {
    logError('Unable to find cfxnes.js\n\n');
    logError('Use the following commands to build the library first:\n');
    logError(`    cd ${path.relative('.', libDir)}\n`);
    logError('    npm run build\n\n');
  }

  log(`${separator}\n\n`);

  return result;
}

module.exports = getLibFile;
