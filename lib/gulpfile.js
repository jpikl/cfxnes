/* eslint-disable camelcase */

const path = require('path');
const gulp = require('gulp');
const closure = require('gulp-closurecompiler');
const eslint = require('gulp-eslint');
const gulpif = require('gulp-if');
const karma = require('karma');
const rename = require('gulp-rename');
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
  const options = {
    browsers: ['Chrome', 'Firefox'],
    frameworks: ['mocha', 'chai-as-promised', 'chai', 'browserify'],
    files: [
      'test/*/**/*Test.js',
      {pattern: 'test/roms/*', included: false, served: true},
    ],
    preprocessors: {
      'test/*/**/*Test.js': ['browserify'],
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
    proxies: {'/roms/': '/base/test/roms/'},
    reporters: ['mocha'],
    logLevel: 'ERROR',
    singleRun: !argv.continuous,
  };
  runKarma(options, done);
});

gulp.task('test-lib', gulp.series('build', done => {
  const options = {
    browsers: ['Chrome', 'Firefox'],
    frameworks: ['mocha', 'chai-as-promised', 'chai'],
    files: [
      argv.debug ? 'dist/cfxnes.debug.js' : 'dist/cfxnes.js',
      'node_modules/jszip/dist/jszip.min.js',
      'test/cfxnesTest.js',
      {pattern: 'test/roms/*', included: false, served: true},
    ],
    proxies: {'/roms/': '/base/test/roms/'},
    reporters: ['mocha'],
    logLevel: 'ERROR',
    singleRun: !argv.continuous,
  };
  runKarma(options, done);
}));

function runKarma(options, done) {
  new karma.Server(options, () => done()).start();
}

gulp.task('test', gulp.series('test-base', 'test-lib'));

//=========================================================
// Default
//=========================================================

gulp.task('default', gulp.series('build', 'watch'));
