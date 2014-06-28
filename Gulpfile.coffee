gulp    = require "gulp"
gutil   = require "gulp-util"
rimraf  = require "gulp-rimraf"
closure = require "gulp-closure-compiler"

bundle = require "./gulp/bundle-modules"
coffee = require "./gulp/coffee-inline"

gulp.task "default", [ "build-lib" ]

gulp.task "watch", ->
    gulp.watch "./lib/{,*}/*.coffee", [ "build-lib" ]

gulp.task "build-lib", ->
    gulp.src "./lib/{,*}/*.coffee"
        .pipe coffee(
                bare: true
                inline: true
            ).on "error", gutil.log
        .pipe bundle
            entryFile: "./lib/nescoffee.js"
            outputFile: "nescoffee.js"
        .pipe gulp.dest "./build/scripts"

gulp.task "dist-lib", [ "build-lib" ], ->
    gulp.src "./build/scripts/nescoffee.js"
        .pipe closure
            compilerPath: "./node_modules/closure-compiler/lib/vendor/compiler.jar"
            fileName: "nescoffee.min.js"
        .pipe gulp.dest "./dist/scripts"

gulp.task "dist", [ "dist-lib" ]

gulp.task "clean", ->
    gulp.src [ "./build", "./dist" ]
        .pipe rimraf()
