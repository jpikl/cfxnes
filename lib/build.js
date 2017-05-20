/* eslint-env node */
/* eslint-disable camelcase, import/unambiguous */

const fs = require('fs');
const Compiler = require('google-closure-compiler').compiler;

const {stdout, stderr, argv} = process;
const debug = argv.indexOf('--debug') > 0;
const filename = debug ? 'cfxnes.debug.js' : 'cfxnes.js';
const file = `dist/${filename}`;

const compiler = new Compiler({
  compilation_level: debug ? 'SIMPLE' : 'ADVANCED',
  language_in: 'ECMASCRIPT6_STRICT',
  language_out: 'ECMASCRIPT5_STRICT',
  create_source_map: '%outname%.map',
  source_map_location_mapping: ['../core|../../core', 'src|../src'],
  module_resolution: 'NODE',
  rewrite_polyfills: false,
  output_wrapper_file: 'umd.template',
  assume_function_wrapper: true,
  formatting: debug ? ['SINGLE_QUOTES', 'PRETTY_PRINT', 'PRINT_INPUT_DELIMITER'] : 'SINGLE_QUOTES',
  externs: 'externs.js',
  jscomp_off: 'checkTypes', // TODO fix compiler warnings
  js: ['../core/src/**.js', 'src/**.js'],
  js_output_file: file,
});

compiler.run((code, out, err) => {
  if (code === 0) {
    fs.appendFileSync(file, `//# sourceMappingURL=${filename}.map\n`);
  }
  stdout.write(out);
  stderr.write(err);
  process.exit(code);
});
