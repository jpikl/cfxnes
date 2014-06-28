gulp    = require "gulp"
gutil   = require "gulp-util"
rimraf  = require "gulp-rimraf"
closure = require "gulp-closure-compiler"

bundle = require "./tasks/bundle-modules"
coffee = require "./tasks/coffee-inline"

LIB_TARGET     = "nescoffee.js"
LIB_TARGET_MIN = "nescoffee.min.js"
LIB_DIR        = "./lib"
LIB_SRC_DIR    = "#{LIB_DIR}/src"
LIB_SRC_FILES  = "#{LIB_SRC_DIR}/{,*/}*.coffee"
LIB_BUILD_DIR  = "#{LIB_DIR}/build"

DIST_DIR    = "dist"
DIST_JS_DIR = "#{DIST_DIR}/js"

gulp.task "default", [ "build-lib" ]

gulp.task "watch", ->
    gulp.watch LIB_SRC_FILES, [ "build-lib" ]

gulp.task "build-lib", ->
    gulp.src LIB_SRC_FILES
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

gulp.task "clean", ->
    gulp.src [ LIB_BUILD_DIR, DIST_DIR ]
        .pipe rimraf()
