gulp    = require "gulp"
gutil   = require "gulp-util"
closure = require "gulp-closure-compiler"

bundle = require "./tasks/bundle-modules"
coffee = require "./tasks/coffee-inline"

LIB_TARGET     = "nescoffee.js"
LIB_TARGET_MIN = "nescoffee.min.js"
LIB_DIR        = "./lib"
LIB_SRC_DIR    = "#{LIB_DIR}/src"
LIB_BUILD_DIR  = "#{LIB_DIR}/build"

DIST_DIR    = "dist"
DIST_JS_DIR = "#{DIST_DIR}/js"

gulp.task "build-lib", ->
    gulp.src "#{LIB_SRC_DIR}/{,*/}*.coffee"
        .pipe coffee(
                bare: true
                inline: true
            ).on "error", gutil.log
        .pipe bundle
            entryFile: "#{LIB_SRC_DIR}/#{LIB_TARGET}"
            outputFile: LIB_TARGET
        .pipe gulp.dest LIB_BUILD_DIR

gulp.task "dist-lib", [ "build-lib" ], ->
    gulp.src "#{LIB_BUILD_DIR}/#{LIB_TARGET}"
        .pipe closure
            compilerPath: "node_modules/closure-compiler/lib/vendor/compiler.jar"
            fileName: LIB_TARGET_MIN
        .pipe gulp.dest DIST_JS_DIR

gulp.task "dist", [ "dist-lib" ]
