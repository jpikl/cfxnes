const path = require('path');
const browser = require('browser-sync').create();
const babel = require('gulp-babel');
const concat = require('gulp-concat');
const gulp = require('gulp');
const server = require('gulp-develop-server');
const gulpif = require('gulp-if');
const less = require('gulp-less');
const riot = require('gulp-riot');
const uglify = require('gulp-uglify');
const Autoprefix = require('less-plugin-autoprefix');
const CleanCSS = require('less-plugin-clean-css');
const merge = require('merge2');
const mkdirp = require('mkdirp');
const yargs = require('yargs');

//=========================================================
// Arguments
//=========================================================

const argv = yargs
  .usage('Usage: gulp command [options]')
  .command('build', 'Build application')
  .command('start', 'Start server with browser-sync')
  .command('dev', 'Build app + start server with browser-sync + watch sources')
  .option('d', {
    desc: 'Build debug version of application',
    alias: 'debug',
    type: 'boolean',
  })
  .example('gulp build', 'Build application')
  .example('gulp build -d', 'Build application (debug version)')
  .example('node dist/app.js', 'Start server at http://localhost:5000')
  .example('gulp start', 'Start server with browser-sync at http://localhost:3000')
  .example('gulp dev', 'Build application + start server + watch sources')
  .example('gulp dev -d', 'Build debug application + start server + watch sources')
  .epilogue('Library needs to be build separately before building the application.')
  .argv;

//=========================================================
// Help
//=========================================================

gulp.task('default', done => {
  yargs.showHelp();
  done();
});

//=========================================================
// Client
//=========================================================

gulp.task('libs', () => {
  const sources = [
    './node_modules/core-js/client/' + (argv.debug ? 'shim.js' : 'shim.min.js'),
    './node_modules/jszip/dist/' + (argv.debug ? 'jszip.js' : 'jszip.min.js'),
    './node_modules/jquery/dist/' + (argv.debug ? 'jquery.js' : 'jquery.min.js'),
    './node_modules/jquery.browser/dist/' + (argv.debug ? 'jquery.browser.js' : 'jquery.browser.min.js'),
    './node_modules/bootstrap/dist/js/' + (argv.debug ? 'bootstrap.js' : 'bootstrap.min.js'),
    './node_modules/bootstrap-slider/dist/' + (argv.debug ? 'bootstrap-slider.js' : 'bootstrap-slider.min.js'),
    './node_modules/riot/' + (argv.debug ? 'riot.js' : 'riot.min.js'),
  ];
  return gulp.src(sources)
    .pipe(concat('libs.js'))
    .pipe(gulp.dest('./dist/static/'));
});

gulp.task('scripts', () => {
  const app = gulp.src('./src/client/{db,app}.js').pipe(babel());
  const tags = gulp.src('./src/client/tags/**/*.tag').pipe(riot());
  return merge(app, tags)
    .pipe(gulpif(!argv.debug, uglify()))
    .pipe(concat('app.js'))
    .pipe(gulp.dest('./dist/static/'));
});

gulp.task('styles', () => {
  const autoprefix = new Autoprefix({browsers: ['last 2 versions']});
  const cleancss = new CleanCSS({advanced: true, keepSpecialComments: false});
  const options = {
    paths: [
      './node_modules/bootstrap/less/',
      './node_modules/bootstrap-slider/src/less/',
      './node_modules/bootstrap-slider/', // Workaround: bootstrap-slider seems to use wrong path in @import
      './node_modules/font-awesome/less/',
    ],
    plugins: argv.debug ? [autoprefix] : [autoprefix, cleancss],
  };
  return gulp.src('./src/client/app.less')
    .pipe(less(options))
    .pipe(gulp.dest('./dist/static/'))
    .pipe(browser.stream());
});

gulp.task('pages', () => {
  return gulp.src('./src/client/index.html')
    .pipe(gulp.dest('./dist/static/'));
});

gulp.task('images', () => {
  return gulp.src('./src/client/**/*.{png,jpg,gif,svg}')
    .pipe(gulp.dest('./dist/static/'));
});

gulp.task('fonts', () => {
  return gulp.src('./node_modules/font-awesome/fonts/fontawesome-webfont.*')
    .pipe(gulp.dest('./dist/static/fonts/'));
});

gulp.task('client', gulp.parallel('libs', 'scripts', 'styles', 'pages', 'images', 'fonts'));

//=========================================================
// Server
//=========================================================

gulp.task('server', () => {
  return gulp.src('./src/server/**/*.js')
    .pipe(babel())
    .pipe(gulp.dest('./dist/'));
});

//=========================================================
// Build
//=========================================================

gulp.task('dirs', done => {
  mkdirp.sync('./dist/');
  done();
});

gulp.task('symlinks', done => {
  if (process.platform === 'win32') {
    return done(); // Common Windows user doesn't have right to create symbolic links
  }
  mkdirp.sync('../roms/');
  return gulp.src('../roms/')
    .pipe(gulp.symlink('./dist/roms/'));
});

gulp.task('build', gulp.series('dirs', gulp.parallel('client', 'server')));

//=========================================================
// Watch
//=========================================================

gulp.task('watch', () => {
  gulp.watch('./src/client/**/*.{js,tag}', gulp.series('scripts', browser.reload));
  gulp.watch('./src/client/**/*.less', gulp.series('styles'));
  gulp.watch('./src/client/**/*.html', gulp.series('pages', browser.reload));
  gulp.watch('./src/server/**/*.js', gulp.series('server', 'restart'));
  gulp.watch('./dist/static/cfxnes.js', browser.reload);
});

//=========================================================
// Run
//=========================================================

gulp.task('start', () => {
  const options = {
    env: {
      NODE_ENV: 'dev',
      NODE_PATH: path.join(__dirname, 'node_modules'),
    },
    path: './dist/app.js',
  };
  server.listen(options, error => {
    if (!error) {
      browser.init({proxy: 'http://localhost:5000'});
    }
  });
});

gulp.task('restart', () => {
  server.restart(error => {
    if (!error) {
      browser.reload();
    }
  });
});

//=========================================================
// Develop
//=========================================================

gulp.task('dev', gulp.series('build', 'symlinks', gulp.parallel('watch', 'start')));
