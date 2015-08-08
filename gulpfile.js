var browserify = require("browserify");
var del        = require("del");
var fs         = require("fs");
var gulp       = require("gulp");
var babel      = require("gulp-babel");
var closure    = require("gulp-closurecompiler");
var concat     = require("gulp-concat");
var gulpif     = require("gulp-if");
var less       = require("gulp-less");
var mocha      = require("gulp-mocha");
var nodemon    = require("gulp-nodemon")
var rename     = require("gulp-rename");
var replace    = require("gulp-replace");
var uglify     = require("gulp-uglify");
var util       = require("gulp-util");
var Autoprefix = require("less-plugin-autoprefix");
var CleanCSS   = require("less-plugin-clean-css");
var mkdirp     = require("mkdirp");
var riotify    = require("riotify")
var buffer     = require("vinyl-buffer");
var source     = require("vinyl-source-stream");
var yargs      = require("yargs");

//=========================================================
// Arguments
//=========================================================

var argv = yargs
    .boolean("d").alias("d", "development")
    .boolean("a").alias("a", "analytics")
    .argv;

var development = argv.development === true;
var production = !development;
var environment = production ? "production" : "development";
var analytics = argv.analytics === true;

util.log("Running in " + environment + " environment");
util.log("Google analytics " + (analytics ? "enabled" : "disabled"));

//=========================================================
// Library
//=========================================================

gulp.task("lib", function() {
    return gulp.src(["./src/lib/**/*.js", "!./src/lib/core/debug/**"])
        .pipe(closure({
                fileName: "cfxnes.js"
            }, {
                compilation_level: production ? "ADVANCED" : "SIMPLE",
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
        .pipe(gulpif(development, uglify({
            compress: false,
            output: {beautify: true}
        })))
        .pipe(gulp.dest("./dist/lib/"));
});

//=========================================================
// Client
//=========================================================

gulp.task("scripts", function() {
    return browserify({
            entries: "./src/app/client/app.js",
            paths: ["./dist/lib/"],
            debug: development,
            bare: true
        })
        .transform(riotify)
        .bundle()
        .pipe(source("app.js"))
        .pipe(gulpif(production, buffer()))
        .pipe(gulpif(production, uglify()))
        .pipe(gulp.dest("./dist/app/static/"));
});

gulp.task("styles", function() {
    var autoprefix = new Autoprefix({browsers: ["last 2 versions"]});
    var cleancss = new CleanCSS({advanced: true, keepSpecialComments: false});
    return gulp.src("./src/app/client/app.less")
        .pipe(less({
            paths: [
                "./node_modules/bootstrap/less/",
                "./node_modules/bootstrap-slider/less/",
                "./node_modules/font-awesome/less/"
            ],
            plugins: production ? [autoprefix, cleancss] : [autoprefix]
        }))
        .pipe(gulp.dest("./dist/app/static/"));
});

gulp.task("htmls", function() {
    return gulp.src("./src/app/client/index.html")
        .pipe(replace("<!-- Google Analytics -->",
            analytics ? fs.readFileSync("./src/app/client/ga.html", "utf8") : ""))
        .pipe(gulp.dest("./dist/app/static/"));
});

gulp.task("images", function() {
    return gulp.src("./src/app/client/**/*.{png,jpg,gif,svg}")
        .pipe(gulp.dest("./dist/app/static/"));
});

gulp.task("fonts", function() {
    return gulp.src("./node_modules/font-awesome/fonts/fontawesome-webfont.*")
        .pipe(gulp.dest("./dist/app/static/fonts/"));
});

gulp.task("client", gulp.parallel("scripts", "styles", "htmls", "images", "fonts"));

//=========================================================
// Server
//=========================================================

gulp.task("server", function() {
    return gulp.src("./src/app/server/**/*.js")
        .pipe(babel())
        .pipe(gulp.dest("./dist/app/"));
});

//=========================================================
// Build
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

gulp.task("build", gulp.series("clean", "init", "lib", gulp.parallel("client", "server")));

//=========================================================
// Run
//=========================================================

gulp.task("run", function(done) {
    // We can't change nodemon working directory, because that would break
    // closure compiler paths in 'lib' task.
    nodemon({
        env: {NODE_ENV: environment},
        script: "./dist/app/app.js",
        watch: ["dist/app/app.js", "dist/app/services/"],
        ignore: [
            ".git/",
            "bin/",
            "dist/lib/",
            "dist/app/roms/",
            "dist/app/static/",
            "externs/",
            "roms/",
            "node_modules/",
            "src/",
            "test/",
            ".gitignore",
            "CHANGELOG.md",
            "gulpfile.js",
            "LICENSE.txt",
            "package.json",
            "README.md"
        ]
    });
});

//=========================================================
// Watch
//=========================================================

gulp.task("watch",  function() {
    gulp.watch("./src/lib/**/*.js", gulp.series("lib", "scripts"));
    gulp.watch("./src/app/client/**/*.{js,tag}", gulp.series("scripts"));
    gulp.watch("./src/app/client/**/*.less", gulp.series("styles"));
    gulp.watch("./src/app/client/**/*.html", gulp.series("htmls"));
    gulp.watch("./src/app/server/**/*.js", gulp.series("server"));
});

//=========================================================
// Tests
//=========================================================

gulp.task("test", function() {
    require("babel/register");
    return gulp.src("./test/**/*-test{,s}.js")
        .pipe(mocha({timeout: 60000}));
});

//=========================================================
// Default
//=========================================================

gulp.task("default", gulp.series("build", gulp.parallel("run", "watch")));
