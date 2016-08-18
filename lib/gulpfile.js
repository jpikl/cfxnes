/* eslint-disable camelcase */

const path = require('path');
const del = require('del');
const closure = require('google-closure-compiler').gulp();
const gulp = require('gulp');
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
    output_wrapper: `(function(){%output%this.CFxNES.version='${pkg.version}';}.call(this));`,
    assume_function_wrapper: true,
    formatting: ['SINGLE_QUOTES'].concat(argv.debug ? ['PRETTY_PRINT', 'PRINT_INPUT_DELIMITER'] : []),
    externs: ['./externs/JSZip.js', './externs/w3c_gamepad.js'],
  };
  return gulp.src(['src/**/*.js', '../core/src/**/*.js'])
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
    customLaunchers: {},
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

  if (argv.winWebdriverHost != null || argv.osxWebdriverHost != null) {
    options.hostname = ip.address();
  }

  if (argv.winWebdriverHost != null) {
    options.customLaunchers.IE = webdriver('internet explorer', argv.winWebdriverHost, '10.0.0.3');
    options.customLaunchers.Edge = webdriver('MicrosoftEdge', argv.winWebdriverHost, '10.0.0.3');
  } else {
    options.browsers = options.browsers.filter(b => b !== 'IE' && b !== 'Edge');
  }

  if (argv.osxWebdriverHost != null) {
    options.customLaunchers.IE = webdriver('safari', argv.osxWebdriverHost, '10.0.0.4');
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

function webdriver(browserName, hostnamePort, defaultIp) {
  const [hostname, port] = hostnamePort.split(':');
  return {
    base: 'WebDriver',
    config: {
      hostname: hostname || defaultIp,
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
