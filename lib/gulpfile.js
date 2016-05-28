/* eslint-disable camelcase */

const path = require('path');
const gulp = require('gulp');
const closure = require('gulp-closurecompiler');
const eslint = require('gulp-eslint');
const gulpif = require('gulp-if');
const mocha = require('gulp-mocha');
const rename = require('gulp-rename');
const replace = require('gulp-replace');
const mkdirp = require('mkdirp');
const yargs = require('yargs');
const pkg = require('./package');

require('babel-core/register');

//=========================================================
// Arguments
//=========================================================

const argv = yargs
  .boolean('d').alias('d', 'debug')
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
  return gulp.src(['../core/src/**/*.js', '!../core/src/debug/**', './src/**/*.js'])
    .pipe(closure(options, gccOptions))
    .pipe(replace('Symbol;', 'Symbol=this.Symbol;')) // Temporary workaround for https://github.com/google/closure-compiler/issues/1227
    .pipe(gulp.dest('../app/dist/static/'))
    .pipe(gulpif(argv.debug, rename('cfxnes.debug.js')))
    .pipe(gulp.dest('./dist/'));
});

gulp.task('build', gulp.series('dirs', 'compile'));

//=========================================================
// Watch
//=========================================================

gulp.task('watch', () => {
  gulp.watch(['../core/src/**', './src/**'], gulp.series('compile'));
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

gulp.task('test', () => {
  return gulp.src('./test/**/*Test.js')
    .pipe(mocha());
});

//=========================================================
// Default
//=========================================================

gulp.task('default', gulp.series('build', 'watch'));
