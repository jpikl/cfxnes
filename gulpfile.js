var del     = require("del");
var gulp    = require("gulp");
var babel   = require("gulp-babel");
var closure = require("gulp-closurecompiler");
var concat  = require("gulp-concat");
var jade    = require("gulp-jade");
var mocha   = require("gulp-mocha");
var rename  = require("gulp-rename");
var stylus  = require("gulp-stylus");
var util    = require("gulp-util");

var devMode = util.env.dev === true;
var proMode = !devMode;

function modeMin(name) {
    return proMode ? name.replace(".js", ".min.js")
                         .replace(".css", ".min.css")
                   : name;
}

function modeChoice(proChoice, devChoice) {
    return proMode ? proChoice : devChoice;
}

gulp.task("lib", function() {
    return gulp.src(["./src/lib/**/*.js", "!./src/lib/core/debug/**"])
        .pipe(closure({
                fileName: modeMin("cfxnes.js")
            }, {
                create_source_map: "./dist/lib/" + modeMin("cfxnes.js.map"),
                compilation_level: modeChoice("ADVANCED", "SIMPLE"),
                language_in: "ECMASCRIPT6",
                language_out: "ES5",
                externs: [
                    "./externs/md5.js",
                    "./externs/screenfull.js",
                    "./externs/w3c_audio.js"
                ]
            }))
        .pipe(gulp.dest("./dist/lib/"));
});

gulp.task("client-scripts", function() {
    return gulp.src("./src/app/client/**/*.js")
        .pipe(babel())
        .pipe(concat(modeMin("app.js")))
        .pipe(gulp.dest("./dist/app/static/scripts/"));
});

gulp.task("client-styles", function() {
    return gulp.src("./src/app/client/**/*.styl")
        .pipe(stylus())
        .pipe(concat(modeMin("app.css")))
        .pipe(gulp.dest("./dist/app/static/styles/"));
});

gulp.task("client-views", function() {
    return gulp.src("./src/app/client/**/*.jade")
        .pipe(jade({
            pretty: devMode,
            compileDebug: devMode,
            data: {devMode: devMode, proMode: proMode}
        }))
        .pipe(gulp.dest("./dist/app/static/"));
});

gulp.task("client-images", function() {
    return gulp.src("./src/app/client/**/*.{png,jpg,gif}")
        .pipe(gulp.dest("./dist/app/static/"));
});

gulp.task("client-lib", function() {
    return gulp.src([modeMin("./dist/lib/cfxnes.js"), modeMin("./dist/lib/cfxnes.js.map")])
        .pipe(gulp.dest("./dist/app/static/scripts/"));
});

gulp.task("app", gulp.parallel(
    "client-scripts",
    "client-styles",
    "client-views",
    "client-images",
    gulp.series("lib", "client-lib")
));

gulp.task("test", function() {
    require("babel/register");
    return gulp.src("./test/**/*-test{,s}.js")
        .pipe(mocha({ timeout: 60000 }));
});

gulp.task("clean", function(done) {
    del(["./dist/"], done);
});

gulp.task("default", gulp.series("app"));
