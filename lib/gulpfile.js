// jscs:disable requireCamelCaseOrUpperCaseIdentifiers

var gulp = require('gulp');
var closure = require('gulp-closurecompiler');
var gulpif = require('gulp-if');
var jscs = require('gulp-jscs');
var mocha = require('gulp-mocha');
var rename = require('gulp-rename');
var replace = require('gulp-replace');
var mkdirp = require('mkdirp');
var yargs = require('yargs');

require('babel/register');

//=========================================================
// Arguments
//=========================================================

var argv = yargs
  .boolean('d').alias('d', 'debug')
  .argv;

//=========================================================
// Build
//=========================================================

gulp.task('dirs', function(done) {
  mkdirp.sync('./dist/');
  mkdirp.sync('../app/dist/static/');
  done();
});

gulp.task('compile', function() {
  var options = {fileName: 'cfxnes.js'};
  var gccOptions = {
      compilation_level: argv.debug ? 'SIMPLE' : 'ADVANCED',
      language_in: 'ECMASCRIPT6',
      language_out: 'ES5',
      warning_level: 'VERBOSE',
      js_module_root: __dirname + '/..',
      output_wrapper: '(function(){%output%}.call(this));',
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

gulp.task('watch', function() {
  gulp.watch(['../core/src/**', './src/**'], gulp.series('compile'));
});

//=========================================================
// Validate code style
//=========================================================

gulp.task('validate', function() {
  return gulp.src('./{src,test}/**/*.js')
    .pipe(jscs())
    .pipe(jscs.reporter());
});

//=========================================================
// Tests
//=========================================================

gulp.task('test', function() {
  return gulp.src('./test/**/*Test.js')
    .pipe(mocha());
});

//=========================================================
// Default
//=========================================================

gulp.task('default', gulp.series('build', 'watch'));
