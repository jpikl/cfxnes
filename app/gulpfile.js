const fs = require('fs');
const path = require('path');
const browser = require('browser-sync').create();
const babel = require('gulp-babel');
const concat = require('gulp-concat');
const gulp = require('gulp');
const server = require('gulp-develop-server');
const eslint = require('gulp-eslint');
const gulpif = require('gulp-if');
const less = require('gulp-less');
const markdown = require('gulp-markdown');
const prettify = require('gulp-prettify');
const rename = require('gulp-rename');
const replace = require('gulp-replace');
const riot = require('gulp-riot');
const uglify = require('gulp-uglify');
const Autoprefix = require('less-plugin-autoprefix');
const CleanCSS = require('less-plugin-clean-css');
const marked = require('marked');
const merge = require('merge2');
const mkdirp = require('mkdirp');
const yargs = require('yargs');

//=========================================================
// Arguments
//=========================================================

const argv = yargs
  .boolean('d').alias('d', 'debug')
  .boolean('a').alias('a', 'analytics')
  .argv;

//=========================================================
// Client
//=========================================================

gulp.task('libs', () => {
  const sources = [
    './node_modules/object-assign-polyfill/index.js',
    './node_modules/promise-polyfill/promise.min.js',
    './node_modules/js-sha1/build/sha1.min.js',
    './node_modules/jszip/dist/jszip.min.js',
    './node_modules/screenfull/dist/screenfull.js',
    './node_modules/jquery/dist/jquery.min.js',
    './node_modules/jquery.browser/dist/jquery.browser.min.js',
    './node_modules/bootstrap/dist/js/bootstrap.min.js',
    './node_modules/bootstrap-slider/dist/bootstrap-slider.min.js',
    './node_modules/riot/riot.min.js',
  ];
  return gulp.src(sources)
    .pipe(concat('libs.js'))
    .pipe(gulp.dest('./dist/static/'));
});

gulp.task('scripts', () => {
  const app = gulp.src('./src/client/app.js').pipe(babel());
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
    .pipe(replace('<!-- Google Analytics -->',
      argv.analytics ? fs.readFileSync('./src/client/ga.html', 'utf8') : ''))
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
      NODE_ENV: 'development',
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
// Linter
//=========================================================

gulp.task('lint', () => {
  return gulp.src(['./gulpfile.js', './{src,test}/**/*.{js,tag}'])
    .pipe(eslint())
    .pipe(eslint.format());
});

//=========================================================
// Generate HTML changelog
//=========================================================

gulp.task('changelog', () => {
  const renderer = new marked.Renderer();
  renderer.firstParagraph = true;
  renderer.heading = function(text, level) {
    return '<h' + (level + 1) + '>' + text + '</h' + (level + 1) + '>\n';
  };
  renderer.paragraph = function(text) {
    if (this.firstParagraph) {
      this.firstParagraph = false;
      return '';
    }
    return '<p>' + text + '</p>\n';
  };
  return gulp.src('../CHANGELOG.md')
    .pipe(markdown({renderer: renderer}))
    .pipe(replace(/([\s\S]*)/, '<about-changelog>\n$1</about-changelog>'))
    .pipe(prettify())
    .pipe(rename('about-changelog.tag'))
    .pipe(gulp.dest('./src/client/tags/about/'));
});

//=========================================================
// Default
//=========================================================

gulp.task('default', gulp.series('build', 'symlinks', gulp.parallel('watch', 'start')));
