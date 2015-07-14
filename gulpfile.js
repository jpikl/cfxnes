var del        = require("del");
var gulp       = require("gulp");
var babel      = require("gulp-babel");
var closure    = require("gulp-closurecompiler");
var concat     = require("gulp-concat");
var gulpif     = require("gulp-if");
var jade       = require("gulp-jade");
var less       = require("gulp-less");
var mocha      = require("gulp-mocha");
var nodemon    = require("gulp-nodemon")
var rename     = require("gulp-rename");
var uglify     = require("gulp-uglify");
var util       = require("gulp-util");
var Autoprefix = require("less-plugin-autoprefix");
var CleanCSS   = require("less-plugin-clean-css");
var mkdirp     = require("mkdirp");
var yargs      = require("yargs");

//=========================================================
// Arguments
//=========================================================

var argv = yargs.argv;
var enableAnalytics = argv.enableAnalytics === true;

if (enableAnalytics) {
    util.log("Google Analytics enabled");
}

//=========================================================
// Environments
//=========================================================

var environment = "production";

function production() {
    return environment === "production";
}

function development() {
    return environment === "development";
}

function envcase(productionOption, developmentOption) {
    return production() ? productionOption : developmentOption;
}

function envfile(developmentFile) {
    var productionFile = developmentFile.replace(".js", ".min.js")
                                        .replace(".css", ".min.css");
    return envcase(productionFile, developmentFile);
}

//=========================================================
// Library
//=========================================================

gulp.task("lib", function() {
    return gulp.src(["./src/lib/**/*.js", "!./src/lib/core/debug/**"])
        .pipe(closure({
                fileName: envfile("cfxnes.js")
            }, {
                compilation_level: envcase("ADVANCED", "SIMPLE"),
                language_in: "ECMASCRIPT6",
                language_out: "ES5",
                output_wrapper: "(function(){%output%}.call(this));",
                externs: [
                    "./externs/JSZip.js",
                    "./externs/md5.js",
                    "./externs/screenfull.js",
                    "./externs/w3c_audio.js",
                    "./externs/w3c_gamepad.js"
                ]
            }))
        .pipe(gulp.dest("./dist/lib/"))
        .pipe(gulp.dest("./dist/app/static/scripts/"));
});

//=========================================================
// Client
//=========================================================

gulp.task("scripts", function() {
    return gulp.src("./src/app/client/**/*.js")
        .pipe(babel())
        .pipe(gulpif(production(), uglify()))
        .pipe(concat(envfile("app.js")))
        .pipe(gulp.dest("./dist/app/static/scripts/"));
});

gulp.task("styles", function() {
    var autoprefix = new Autoprefix({browsers: ["last 2 versions"]});
    var cleancss = new CleanCSS({advanced: true, keepSpecialComments: false});
    return gulp.src("./src/app/client/app.less")
        .pipe(less({
            paths: [
                "./node_modules/bootstrap/less/",
                "./node_modules/font-awesome/less/",
                "./bower_components/seiyria-bootstrap-slider/less/"
            ],
            plugins: envcase([autoprefix, cleancss], [autoprefix])
        }))
        .pipe(gulp.dest("./dist/app/static/styles/"));
});

gulp.task("views", function() {
    return gulp.src("./src/app/client/**/*.jade")
        .pipe(jade({
            pretty: development(),
            compileDebug: development(),
            data: {
                environment: environment,
                enableAnalytics: enableAnalytics
            }
        }))
        .pipe(gulp.dest("./dist/app/static/"));
});

gulp.task("images", function() {
    return gulp.src("./src/app/client/**/*.{png,jpg,gif}")
        .pipe(gulp.dest("./dist/app/static/"));
});

//=========================================================
// Third party
//=========================================================

gulp.task("vendor-scripts", function() {
    return gulp.src([
                envcase("./bower_components/seiyria-bootstrap-slider/dist/bootstrap-slider.min.js",
                        "./bower_components/seiyria-bootstrap-slider/js/bootstrap-slider.js"), // Different .min file path
                envfile("./bower_components/jquery/dist/jquery.js"),
                envfile("./bower_components/angular/angular.js"),
                envfile("./bower_components/angular-ui-router/release/angular-ui-router.js"),
                envfile("./bower_components/angular-bootstrap/ui-bootstrap-tpls.js"),
                envfile("./bower_components/bootstrap/dist/js/bootstrap.js"),
                envfile("./bower_components/jquery.browser/dist/jquery.browser.js"),
                envfile("./bower_components/js-md5/js/md5.js"),
                envfile("./bower_components/jszip/dist/jszip.js"),
                "./bower_components/angular-bootstrap-slider/slider.js", // Missing .min file
                "./bower_components/screenfull/dist/screenfull.js", // Missing .min file
                "./node_modules/babel/node_modules/babel-core/browser-polyfill.js" // Already minified
            ])
        .pipe(gulp.dest("./dist/app/static/scripts/"));
});

gulp.task("vendor-fonts", function() {
    return gulp.src("./node_modules/font-awesome/fonts/fontawesome-webfont.*")
        .pipe(gulp.dest("./dist/app/static/fonts/"));
});

//=========================================================
// Server
//=========================================================

gulp.task("server", function() {
    return gulp.src("./src/app/server/**/*.js")
        .pipe(babel())
        .pipe(gulp.dest("./dist/app/"));
})

//=========================================================
// Application
//=========================================================

gulp.task("clean", function(done) {
    del(["./dist/"], done);
});

gulp.task("init", function(done) {
    mkdirp.sync("./dist/");
    if (process.platform === "win32") {
        done(); // Common Windows user doesn't have right to create symbolic links
    } else {
        mkdirp.sync("./roms/");
        return gulp.src("./roms/")
            .pipe(gulp.symlink("./dist/app/"));
    }
});

gulp.task("build", gulp.parallel(
    "lib",
    "scripts",
    "styles",
    "views",
    "images",
    "vendor-scripts",
    "vendor-fonts",
    "server"
));

gulp.task("run", function(done) {
    // We can't change nodemon working directory, because that would break
    // closure compiler paths in 'lib' task.
    nodemon({
        env: {NODE_ENV: environment},
        script: "./dist/app/app.js",
        watch: [ "dist/app/app.js", "dist/app/services/" ],
        ignore: [
            ".git/",
            "bin/",
            "bower_components/",
            "dist/lib/",
            "dist/app/roms/",
            "dist/app/static/",
            "externs/",
            "roms/",
            "node_modules/",
            "src/",
            "test/",
            ".gitignore",
            "bower.json",
            "CHANGELOG.md",
            "gulpfile.js",
            "LICENSE.txt",
            "package.json",
            "README.md"
        ]
    });
});

gulp.task("app", gulp.series("clean", "init", "build", "run"));

//=========================================================
// Tests
//=========================================================

gulp.task("test", function() {
    require("babel/register");
    return gulp.src("./test/**/*-test{,s}.js")
        .pipe(mocha({timeout: 60000}));
});

//=========================================================
// Development
//=========================================================

gulp.task("init-dev", function(done) {
    environment = "development";
    done();
})

gulp.task("watch",  function() {
    gulp.watch("./src/lib/**/*.js", gulp.series("lib"));
    gulp.watch("./src/app/client/**/*.js", gulp.series("scripts"));
    gulp.watch("./src/app/client/**/*.styl", gulp.series("styles"));
    gulp.watch("./src/app/client/**/*.jade", gulp.series("views"));
    gulp.watch("./src/app/server/**/*.js", gulp.series("server"));
});

gulp.task("dev", gulp.series(
    "clean",
    "init-dev",
    "init",
    "build",
    gulp.parallel("watch", "run")
));

//=========================================================
// Default
//=========================================================

gulp.task("default", gulp.series("app"));
