var del          = require("del");
var gulp         = require("gulp");
var autoprefixer = require("gulp-autoprefixer");
var babel        = require("gulp-babel");
var closure      = require("gulp-closurecompiler");
var concat       = require("gulp-concat");
var gulpif       = require("gulp-if");
var jade         = require("gulp-jade");
var mocha        = require("gulp-mocha");
var nodemon      = require("gulp-nodemon")
var rename       = require("gulp-rename");
var stylus       = require("gulp-stylus");
var uglify       = require("gulp-uglify");
var util         = require("gulp-util");
var mkdirp       = require("mkdirp");

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

function envcase(productionValue, developmentValue) {
    return production() ? productionValue : developmentValue;
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
                create_source_map: "./dist/lib/" + envfile("cfxnes.js.map"),
                compilation_level: envcase("ADVANCED", "SIMPLE"),
                language_in: "ECMASCRIPT6",
                language_out: "ES5",
                externs: [
                    "./externs/md5.js",
                    "./externs/screenfull.js",
                    "./externs/w3c_audio.js"
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
    return gulp.src("./src/app/client/**/*.styl")
        .pipe(stylus({compress: production()}))
        .pipe(autoprefixer({browsers: ['last 2 versions'], cascade: false}))
        .pipe(concat(envfile("app.css")))
        .pipe(gulp.dest("./dist/app/static/styles/"));
});

gulp.task("views", function() {
    return gulp.src("./src/app/client/**/*.jade")
        .pipe(jade({
            pretty: development(),
            compileDebug: development(),
            data: {environment: environment}
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
                envfile("./bower_components/js-md5/js/md5.js"),
                "./bower_components/angular-bootstrap-slider/slider.js", // Missing .min file
                "./bower_components/screenfull/dist/screenfull.js" // Missing .min file
            ])
        .pipe(gulp.dest("./dist/app/static/scripts/"));
});

gulp.task("vendor-styles", function() {
    return gulp.src([
                envfile("./bower_components/bootstrap/dist/css/bootstrap.css"),
                envfile("./bower_components/bootstrap/dist/css/bootstrap-theme.css"),
                envfile("./bower_components/seiyria-bootstrap-slider/dist/css/bootstrap-slider.css")
            ])
        .pipe(gulp.dest("./dist/app/static/styles/"));
});

gulp.task("vendor-fonts", function() {
    return gulp.src("./bower_components/bootstrap/dist/fonts/glyphicons-halflings-regular.*")
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

gulp.task("init", function(done) {
    mkdirp.sync("./dist/");
    mkdirp.sync("./roms/");
    return gulp.src("./roms/")
        .pipe(gulp.symlink("./dist/app/"));
});

gulp.task("build", gulp.parallel(
    "lib",
    "scripts",
    "styles",
    "views",
    "images",
    "vendor-scripts",
    "vendor-styles",
    "vendor-fonts",
    "server"
));

gulp.task("run", function(done) {
    nodemon({
        script: "./dist/app/app.js",
        env: {NODE_ENV: environment},
        ignore: ["./dist/app/static/", "./dist/app/roms/"]
    });
});

gulp.task("app", gulp.series("init", "build", "run"));

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

gulp.task("set-development", function(done) {
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
    "set-development",
    "init",
    "build",
    gulp.parallel("watch", "run")
));

//=========================================================
// Other
//=========================================================

gulp.task("clean", function(done) {
    del(["./dist/"], done);
});

gulp.task("default", gulp.series("init", "app"));
