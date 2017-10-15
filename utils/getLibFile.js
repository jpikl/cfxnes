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
  const {stdout} = process;
  const log = verbose ? stdout.write.bind(stdout) : () => {};

  log('\n********************************************************************************\n');
  log('\nLooking for cfxnes library files...\n\n');

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
  log(result ? `Using ${result}` : 'Found none :(');
  log('\n');

  if (!result && productionOnly) {
    log('\nUse the following commands to build the library first:\n');
    log(`    cd ${path.relative('.', libDir)}\n`);
    log('    npm run build\n');
  }

  log('\n********************************************************************************\n\n');

  return result;
}

module.exports = getLibFile;
