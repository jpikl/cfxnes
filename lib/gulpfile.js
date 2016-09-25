/* eslint-disable camelcase */

const path = require('path');
const del = require('del');
const closure = require('google-closure-compiler').gulp();
const gulp = require('gulp');
const eslint = require('gulp-eslint');
const gulpif = require('gulp-if');
const rename = require('gulp-rename');
const replace = require('gulp-replace');
const ip = require('ip');
const karma = require('karma');
const merge = require('merge-stream');
const mkdirp = require('mkdirp');
const yargs = require('yargs');
const pkg = require('./package');

//=========================================================
// Arguments
//=========================================================

const filesChoices = ['all', 'src', 'lib'];

const argv = yargs
  .usage('Usage: gulp command [options]')
  .command('build', 'Build library')
  .command('dev', 'Build library + watch sources')
  .command('lint', 'Run linter')
  .command('test', 'Run tests')
  .command('clean', 'Delete generated files')
  .option('d', {
    desc: 'Build debug version of library',
    alias: 'debug',
    type: 'boolean',
  })
  .option('f', {
    desc: 'Select test files',
    alias: 'files',
    type: 'string',
    choices: filesChoices,
    default: 'all',
  })
  .option('p', {
    desc: 'Disable polyfills',
    alias: 'no-polyfills',
    type: 'boolean',
  })
  .option('g', {
    desc: 'Filter tests using regular expression',
    alias: 'grep',
    type: 'string',
  })
  .option('b', {
    desc: 'Comma separeted list of browsers to run tests',
    alias: 'browsers',
    type: 'string',
    default: 'Chrome,Firefox,Edge,Opera,Safari',
  })
  .option('w', {
    desc: 'IP address and port "ip[:port]" of Windows host running webdriver server',
    alias: 'win-webdriver-host',
    type: 'string',
  })
  .option('o', {
    desc: 'IP address and port "ip[:port]" of OS X host running webdriver server',
    alias: 'osx-webdriver-host',
    type: 'string',
  })
  .option('c', {
    desc: 'Continuously run tests',
    alias: 'continuous',
    type: 'boolean',
  })
  .example('gulp build', 'Build library')
  .example('gulp build -d', 'Build library (debug version)')
  .example('gulp dev', 'Build library + watch sources')
  .example('gulp dev -d', 'Build debug library + watch sources')
  .example('gulp lint', 'Run linter')
  .example('gulp test', 'Run all tests')
  .example('gulp test -f src', 'Run tests for source files')
  .example('gulp test -f lib', 'Run tests for built library')
  .example('gulp test -g cpu', 'Run tests with "cpu" in their title')
  .example('gulp test -b Chrome,Firefox', 'Run tests only for Chrome and Firefox')
  .example('gulp test -w 10.0.0.3:4444', 'Specify Windows host running webdriver server')
  .example('gulp test -o 10.0.0.4:4444', 'Specify OS X host running webdriver server')
  .example('gulp test -c', 'Run tests continuously without exiting')
  .example('gulp clean', 'Delete generated files')
  .argv;

if (filesChoices.indexOf(argv.files) < 0) {
  process.stdout.write(`Wrong argument of -f, --files option, expected one of ${filesChoices}\n`);
  process.exit(1);
}

//=========================================================
// Help
//=========================================================

gulp.task('default', done => {
  yargs.showHelp();
  done();
});

//=========================================================
// Build
//=========================================================

gulp.task('dirs', done => {
  mkdirp.sync('./dist/');
  mkdirp.sync('../app/dist/static/');
  done();
});

gulp.task('compile', () => {
  const options = {
    compilation_level: argv.debug ? 'SIMPLE' : 'ADVANCED',
    language_in: 'ECMASCRIPT6_STRICT',
    language_out: 'ECMASCRIPT5_STRICT',
    warning_level: 'DEFAULT',
    js_module_root: path.join(__dirname, '..'),
    js_output_file: 'cfxnes.js',
    output_wrapper: '(function(){%output%}.call(this));',
    assume_function_wrapper: true,
    formatting: ['SINGLE_QUOTES'].concat(argv.debug ? ['PRETTY_PRINT', 'PRINT_INPUT_DELIMITER'] : []),
    externs: ['./externs/JSZip.js', './externs/w3c_gamepad.js'],
  };

  const main = gulp.src('src/cfxnes.js')
    .pipe(replace('<version-placeholder>', pkg.version));

  const others = gulp.src(['src/*/**/*.js', '../core/src/**/*.js']);

  return merge(main, others)
    .pipe(closure(options))
    .pipe(gulp.dest('../app/dist/static/'))
    .pipe(gulpif(argv.debug, rename('cfxnes.debug.js')))
    .pipe(gulp.dest('./dist/'));
});

gulp.task('build', gulp.series('dirs', 'compile'));

//=========================================================
// Develop
//=========================================================

gulp.task('watch', () => {
  return gulp.watch(['../core/src/**', './src/**'], gulp.series('compile'));
});

gulp.task('dev', gulp.series('build', 'watch'));

//=========================================================
// Lint
//=========================================================

gulp.task('lint', () => {
  return gulp.src(['./gulpfile.js', './{src,test}/**/*.js'])
    .pipe(eslint())
    .pipe(eslint.format());
});

//=========================================================
// Test
//=========================================================

gulp.task('karma', done => {
  const files = ['node_modules/jszip/dist/jszip.min.js'];
  if (!argv.noPolyfills) {
    files.push('node_modules/core-js/client/shim.min.js');
  }
  if (argv.files === 'all' || argv.files === 'src') {
    files.push('test/*/**/*.js', 'test/cfxnesSrcTest.js');
  }
  if (argv.files === 'all' || argv.files === 'lib') {
    files.push(argv.debug ? 'dist/cfxnes.debug.js' : 'dist/cfxnes.js');
    files.push('test/cfxnesLibTest.js');
  }
  files.push({pattern: 'test/roms/*', included: false, served: true});

  const options = {
    logLevel: 'ERROR',
    singleRun: !argv.continuous,
    browsers: argv.browsers.split(','),
    frameworks: ['mocha', 'chai-as-promised', 'chai', 'browserify'],
    reporters: ['mocha'],
    files,
    proxies: {'/roms/': '/base/test/roms/'},
    preprocessors: {
      'test/**/*.js': ['browserify'],
    },
    customLaunchers: {},
    client: {
      mocha: {
        grep: argv.grep,
        timeout: 5000,
      },
    },
    browserify: {
      debug: true,
      transform: ['babelify'],
    },
  };

  if (argv.winWebdriverHost || argv.osxWebdriverHost) {
    options.hostname = ip.address();
  }

  if (argv.winWebdriverHost) {
    options.customLaunchers.IE = webdriver('internet explorer', argv.winWebdriverHost);
    options.customLaunchers.Edge = webdriver('MicrosoftEdge', argv.winWebdriverHost);
  } else {
    options.browsers = options.browsers.filter(b => b !== 'IE' && b !== 'Edge');
  }

  if (argv.osxWebdriverHost) {
    options.customLaunchers.Safari = webdriver('safari', argv.osxWebdriverHost);
  } else {
    options.browsers = options.browsers.filter(b => b !== 'Safari');
  }

  if (options.browsers.length) {
    new karma.Server(options, () => done()).start();
  } else {
    process.stdout.write(`No browsers enabled or webdriver is not set\n`);
    done();
  }
});

if (argv.files === 'src') {
  gulp.task('test', gulp.series('karma'));
} else {
  gulp.task('test', gulp.series('build', 'karma'));
}

function webdriver(browserName, hostnamePort) {
  const [hostname, port] = hostnamePort.split(':');
  return {
    base: 'WebDriver',
    config: {
      hostname,
      port: parseInt(port) || 4444,
    },
    browserName,
    name: 'Karma',
  };
}

//=========================================================
// Clean
//=========================================================

gulp.task('clean', () => {
  return del(['dist']);
});
