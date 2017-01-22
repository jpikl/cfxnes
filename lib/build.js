/* eslint-env node */
/* eslint-disable camelcase */

const {spawn} = require('child_process'); // eslint-disable-line import/unambiguous

const JAVA_BIN = 'java';
const COMPILER_PATH = 'node_modules/google-closure-compiler/compiler.jar';

const {stdout, argv} = process;
const debug = argv.indexOf('--debug') > 0;

compile({
  compilation_level: debug ? 'SIMPLE' : 'ADVANCED',
  language_in: 'ECMASCRIPT6_STRICT',
  language_out: 'ECMASCRIPT5_STRICT',
  rewrite_polyfills: false,
  output_wrapper_file: 'umd.template',
  assume_function_wrapper: true,
  formatting: debug ? ['SINGLE_QUOTES', 'PRETTY_PRINT', 'PRINT_INPUT_DELIMITER'] : 'SINGLE_QUOTES',
  externs: 'externs.js',
  jscomp_off: 'checkTypes', // TODO fix compiler warnings
  js: ['src/**.js', '../core/src/**.js'],
  js_output_file: 'dist/' + (debug ? 'cfxnes.debug.js' : 'cfxnes.js'),
});

function compile(params) {
  const javaArgs = ['-jar', COMPILER_PATH];
  const compilerArgs = makeArgs(params);
  const args = javaArgs.concat(compilerArgs);

  stdout.write(JAVA_BIN + ' ' + javaArgs.join(' '));
  stdout.write('\n    ');
  stdout.write(compilerArgs.join('\n    '));
  stdout.write('\n');

  spawn(JAVA_BIN, args, {stdio: 'inherit'});
}

function makeArgs(params) {
  const args = [];
  for (const key in params) {
    const value = params[key];
    if (Array.isArray(value)) {
      args.push(...value.map(item => makeArg(key, item)));
    } else {
      args.push(makeArg(key, value));
    }
  }
  return args;
}

function makeArg(key, value) {
  return `--${key}="${value}"`;
}
