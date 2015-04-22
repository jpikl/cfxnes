var del     = require("del");
var gulp    = require("gulp");
var babel   = require("gulp-babel");
var closure = require("gulp-closurecompiler");
var concat  = require("gulp-concat");
var gulpif  = require("gulp-if");
var jade    = require("gulp-jade");
var mocha   = require("gulp-mocha");
var rename  = require("gulp-rename");
var stylus  = require("gulp-stylus");
var uglify  = require("gulp-uglify");
var util    = require("gulp-util");
var mkdirp  = require("mkdirp");

//=========================================================
// Mode helpers
//=========================================================

var mode = "production";

function production() {
    return mode === "production";
}

function development() {
    return mode === "development";
}

function mchoice(productionValue, developmentValue) {
    return production() ? productionValue : developmentValue;
}

function minname(developmentName) {
    var productionName = developmentName.replace(".js", ".min.js")
                                        .replace(".css", ".min.css");
    return mchoice(productionName, developmentName);
}

//=========================================================
// Library
//=========================================================

gulp.task("lib", function() {
    return gulp.src(["./src/lib/**/*.js", "!./src/lib/core/debug/**"])
        .pipe(closure({
                fileName: minname("cfxnes.js")
            }, {
                create_source_map: "./dist/lib/" + minname("cfxnes.js.map"),
                compilation_level: mchoice("ADVANCED", "SIMPLE"),
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
// Client resources
//=========================================================

gulp.task("scripts", function() {
    return gulp.src("./src/app/client/**/*.js")
        .pipe(babel())
        .pipe(gulpif(production(), uglify()))
        .pipe(concat(minname("app.js")))
        .pipe(gulp.dest("./dist/app/static/scripts/"));
});

gulp.task("styles", function() {
    return gulp.src("./src/app/client/**/*.styl")
        .pipe(stylus())
        .pipe(concat(minname("app.css")))
        .pipe(gulp.dest("./dist/app/static/styles/"));
});

gulp.task("views", function() {
    return gulp.src("./src/app/client/**/*.jade")
        .pipe(jade({
            pretty: development(),
            compileDebug: development(),
            data: {mode: mode}
        }))
        .pipe(gulp.dest("./dist/app/static/"));
});

gulp.task("images", function() {
    return gulp.src("./src/app/client/**/*.{png,jpg,gif}")
        .pipe(gulp.dest("./dist/app/static/"));
});

//=========================================================
// Third party resources
//=========================================================

gulp.task("vendor-scripts", function() {
    return gulp.src([
                mchoice("./bower_components/seiyria-bootstrap-slider/dist/bootstrap-slider.min.js",
                        "./bower_components/seiyria-bootstrap-slider/js/bootstrap-slider.js"), // Different .min file path
                minname("./bower_components/jquery/dist/jquery.js"),
                minname("./bower_components/angular/angular.js"),
                minname("./bower_components/angular-ui-router/release/angular-ui-router.js"),
                minname("./bower_components/angular-bootstrap/ui-bootstrap-tpls.js"),
                minname("./bower_components/js-md5/js/md5.js"),
                "./bower_components/angular-bootstrap-slider/slider.js", // Missing .min file
                "./bower_components/screenfull/dist/screenfull.js" // Missing .min file
            ])
        .pipe(gulp.dest("./dist/app/static/scripts/"))
});

gulp.task("vendor-styles", function() {
    return gulp.src([
                minname("./bower_components/bootstrap/dist/css/bootstrap.css"),
                minname("./bower_components/bootstrap/dist/css/bootstrap-theme.css"),
                minname("./bower_components/seiyria-bootstrap-slider/dist/css/bootstrap-slider.css")
            ])
        .pipe(gulp.dest("./dist/app/static/styles/"))
});

gulp.task("vendor-fonts", function() {
    return gulp.src("./bower_components/bootstrap/dist/fonts/glyphicons-halflings-regular.*")
        .pipe(gulp.dest("./dist/app/static/fonts/"))
});

//=========================================================
// Application
//=========================================================

gulp.task("init", function(done) {
    mkdirp("./dist/", done);
});

gulp.task("app", gulp.parallel(
    "lib",
    "scripts",
    "styles",
    "views",
    "images",
    "vendor-scripts",
    "vendor-styles",
    "vendor-fonts"
));

//=========================================================
// Tests
//=========================================================

gulp.task("test", function() {
    require("babel/register");
    return gulp.src("./test/**/*-test{,s}.js")
        .pipe(mocha({ timeout: 60000 }));
});

//=========================================================
// Development
//=========================================================

gulp.task("set-dev-mode", function(done) {
    mode = "development";
    done();
})

gulp.task("dev", gulp.series("set-dev-mode", "init", "app"))

//=========================================================
// Other
//=========================================================

gulp.task("clean", function(done) {
    del(["./dist/"], done);
});

gulp.task("default", gulp.series("init", "app"));
