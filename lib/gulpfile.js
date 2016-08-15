/* eslint-disable camelcase */

const path = require('path');
const del = require('del');
const gulp = require('gulp');
const closure = require('gulp-closurecompiler');
const eslint = require('gulp-eslint');
const gulpif = require('gulp-if');
const rename = require('gulp-rename');
const ip = require('ip');
const karma = require('karma');
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
  .option('e', {
    desc: 'IP address and port "ip[:port]" of host running webdriver server for Edge',
    alias: 'edge-webdriver-host',
    type: 'string',
  })
  .option('s', {
    desc: 'IP address and port "ip[:port]" of host running webdriver server for Safari',
    alias: 'safari-webdriver-host',
    type: 'string',
  })
  .option('c', {
    desc: 'Continuously run tests',
    alias: 'continuous',
    type: 'boolean',
  })
  .example('gulp build', 'Build library (optimized version)')
  .example('gulp build -d', 'Build library (debug version)')
  .example('gulp dev', 'Build optimized library + watch sources')
  .example('gulp dev -d', 'Build debug library + watch sources')
  .example('gulp lint', 'Run linter')
  .example('gulp test', 'Run all tests')
  .example('gulp test -f src', 'Run tests for source files')
  .example('gulp test -f lib', 'Run tests for built library')
  .example('gulp test -g cpu', 'Run tests with "cpu" in their title')
  .example('gulp test -b Chrome,Firefox', 'Run tests only for Chrome and Firefox')
  .example('gulp test -e 10.0.0.3:4444', 'Run tests for Edge using webdriver server on the specified host')
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
  const versionSet = 'this.CFxNES.version="' + pkg.version + '";';
  const options = {fileName: 'cfxnes.js'};
  const gccOptions = {
    compilation_level: argv.debug ? 'SIMPLE' : 'ADVANCED',
    language_in: 'ECMASCRIPT6',
    language_out: 'ES5',
    warning_level: 'VERBOSE',
    js_module_root: path.join(__dirname, '..'),
    output_wrapper: '(function(){%output%' + versionSet + '}.call(this));',
    formatting: argv.debug ? ['PRETTY_PRINT', 'PRINT_INPUT_DELIMITER'] : [],
    externs: [
      './externs/JSZip.js',
      './externs/md5.js',
      './externs/misc.js',
      './externs/screenfull.js',
      './externs/w3c_gamepad.js',
    ],
  };
  return gulp.src(['../core/src/**/*.js', './src/**/*.js'])
    .pipe(closure(options, gccOptions))
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
  const sourceFiles = ['test/*/**/*.js'];
  const libraryBuild = argv.debug ? 'dist/cfxnes.debug.js' : 'dist/cfxnes.js';
  const libraryFiles = [libraryBuild, 'test/cfxnesTest.js'];

  let files;
  if (argv.files === 'src') {
    files = sourceFiles;
  } else if (argv.files === 'lib') {
    files = libraryFiles;
  } else {
    files = sourceFiles.concat(libraryFiles);
  }

  const options = {
    logLevel: 'ERROR',
    singleRun: !argv.continuous,
    browsers: argv.browsers.split(','),
    frameworks: ['mocha', 'chai-as-promised', 'chai', 'browserify'],
    reporters: ['mocha'],
    files: files.concat([
      'node_modules/jszip/dist/jszip.min.js',
      {pattern: 'test/roms/*', included: false, served: true},
    ]),
    proxies: {'/roms/': '/base/test/roms/'},
    preprocessors: {
      'test/**/*.js': ['browserify'],
    },
    client: {
      mocha: {
        grep: argv.grep,
      },
    },
    browserify: {
      debug: true,
      transform: ['babelify'],
    },
  };

  if (argv.edgeWebdriverHost != null) {
    const [hostname, port] = argv.edgeWebdriverHost.split(':');
    options.customLaunchers = {
      'Edge': {
        base: 'WebDriver',
        config: {
          hostname: hostname || '10.0.0.3',
          port: parseInt(port) || 4444,
        },
        browserName: 'MicrosoftEdge',
        name: 'Karma',
      },
    };
    options.hostname = ip.address();
  } else {
    options.browsers = options.browsers.filter(b => b !== 'Edge');
  }

  if (argv.safariWebdriverHost != null) {
    const [hostname, port] = argv.safariWebdriverHost.split(':');
    options.customLaunchers = {
      'Safari': {
        base: 'WebDriver',
        config: {
          hostname: hostname || '10.0.0.4',
          port: parseInt(port) || 4444,
        },
        browserName: 'safari',
        name: 'Karma',
      },
    };
    options.hostname = ip.address();
  } else {
    options.browsers = options.browsers.filter(b => b !== 'Safari');
  }

  new karma.Server(options, () => done()).start();
});

if (argv.files === 'src') {
  gulp.task('test', gulp.series('karma'));
} else {
  gulp.task('test', gulp.series('build', 'karma'));
}

//=========================================================
// Clean
//=========================================================

gulp.task('clean', () => {
  return del(['dist']);
});
