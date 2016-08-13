const gulp = require('gulp');
const eslint = require('gulp-eslint');
const mocha = require('gulp-mocha');
const yargs = require('yargs');

require('babel-core/register');

//=========================================================
// Arguments
//=========================================================

const filesChoices = ['all', 'mod', 'roms'];

const argv = yargs
  .command('lint', 'Run linter')
  .command('test', 'Run tests')
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
  .example('gulp lint', 'Run linter')
  .example('gulp test', 'Run all tests')
  .example('gulp test -f mod', 'Run tests for source modules')
  .example('gulp test -f roms', 'Run tests for validation ROMs')
  .example('gulp test -g cpu', 'Run tests with "cpu" in their title')
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
// Lint
//=========================================================

gulp.task('lint', () => {
  return gulp.src(['gulpfile.js', '{src,test}/**/*.js'])
    .pipe(eslint())
    .pipe(eslint.format());
});

//=========================================================
// Test
//=========================================================

gulp.task('test', () => {
  const allFiles = 'test/**/*.js';
  const romFiles = 'test/roms/tests.js';

  let files;
  if (argv.files === 'mod') {
    files = [allFiles, '!' + romFiles];
  } else if (argv.files === 'roms') {
    files = [romFiles];
  } else {
    files = [allFiles];
  }

  return gulp.src(files)
    .pipe(mocha({timeout: 60000, grep: argv.grep}));
});
