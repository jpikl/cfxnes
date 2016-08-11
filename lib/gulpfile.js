/* eslint-disable camelcase */

const path = require('path');
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

const argv = yargs
  .boolean('d').alias('d', 'debug')
  .boolean('c').alias('c', 'continuous')
  .string('g').alias('g', 'grep')
  .string('w').alias('w', 'webrdiver')
  .string('b').alias('b', 'browser')
  .argv;

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
// Watch
//=========================================================

gulp.task('watch', () => {
  return gulp.watch(['../core/src/**', './src/**'], gulp.series('compile'));
});

//=========================================================
// Linter
//=========================================================

gulp.task('lint', () => {
  return gulp.src(['./gulpfile.js', './{src,test}/**/*.js'])
    .pipe(eslint())
    .pipe(eslint.format());
});

//=========================================================
// Tests
//=========================================================

gulp.task('test-base', done => {
  const files = ['test/*/**/*Test.js'];
  runKarma({files}, done);
});

gulp.task('test-lib', gulp.series('build', done => {
  const files = [
    argv.debug ? 'dist/cfxnes.debug.js' : 'dist/cfxnes.js',
    'node_modules/jszip/dist/jszip.min.js',
    'test/cfxnesTest.js',
  ];
  runKarma({files}, done);
}));

function runKarma(extraOptions, done) {
  const options = {
    logLevel: 'ERROR',
    singleRun: !argv.continuous,
    browsers: ['Chrome', 'Firefox', 'Opera'],
    frameworks: ['mocha', 'chai-as-promised', 'chai', 'browserify'],
    reporters: ['mocha'],
    files: [
      {pattern: 'test/roms/*', included: false, served: true},
    ],
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
  if (extraOptions.files) {
    options.files = options.files.concat(extraOptions.files);
  }
  if (argv.webrdiver != null) {
    const [hostname, port] = argv.webrdiver.split(':');
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
    options.browsers.push('Edge');
  }
  if (argv.browser) {
    options.browsers = [argv.browser];
  }
  new karma.Server(options, () => done()).start();
}

gulp.task('test', gulp.series('test-base', 'test-lib'));

//=========================================================
// Default
//=========================================================

gulp.task('default', gulp.series('build', 'watch'));
