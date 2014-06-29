gulp    = require "gulp"
gutil   = require "gulp-util"
rimraf  = require "gulp-rimraf"
nodemon = require "gulp-nodemon"
closure = require "gulp-closure-compiler"

bundle = require "./gulp/bundle-modules"
coffee = require "./gulp/coffee-inline"

gulp.task "default", [ "emulator" ]

gulp.task "serve", [ "emulator" ], ->
    gulp.watch "./emulator/{,*}/*.coffee", [ "emulator" ]
    nodemon
        script: "server.coffee"
        ext: "coffee"
        env: { NODE_ENV: "development" }
        ignore: [ "./emulator/**" ]

gulp.task "emulator", ->
    gulp.src "./emulator/{,*}/*.coffee"
        .pipe coffee(
                bare: true
                inline: true
            ).on "error", gutil.log
        .pipe bundle
            entryFile: "./emulator/nescoffee.js"
            outputFile: "nescoffee.js"
        .pipe gulp.dest "./build/scripts"

gulp.task "emulator-dist", [ "emulator" ], ->
    gulp.src "./build/scripts/nescoffee.js"
        .pipe closure
            compilerPath: "./node_modules/closure-compiler/lib/vendor/compiler.jar"
            fileName: "nescoffee.min.js"
        .pipe gulp.dest "./dist/scripts"

gulp.task "dist", [ "emulator-dist" ]

gulp.task "clean", ->
    gulp.src [ "./build", "./dist" ]
        .pipe rimraf()
