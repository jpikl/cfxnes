gulp    = require "gulp"
gutil   = require "gulp-util"
concat  = require "gulp-concat"
rimraf  = require "gulp-rimraf"
stylus  = require "gulp-stylus"
jade    = require "gulp-jade"
nodemon = require "gulp-nodemon"
closure = require "gulp-closure-compiler"

bundle = require "./gulp/gulp-bundle-modules"
coffee = require "./gulp/gulp-inlined-coffee"

###########################################################
# Constants
###########################################################

DEPS_DIR           = "./bower_components"
EMULATOR_DIR       = "./emulator"
CLIENT_DIR         = "./client"
SERVER_DIR         = "./server"
PUBLIC_DIR         = "#{SERVER_DIR}/public"
PUBLIC_IMAGES_DIR  = "#{PUBLIC_DIR}/images"
PUBLIC_SCRIPTS_DIR = "#{PUBLIC_DIR}/scripts"
PUBLIC_STYLES_DIR  = "#{PUBLIC_DIR}/styles"
PUBLIC_FOTNS_DIR   = "#{PUBLIC_DIR}/fonts"
CLOSURE_JAR        = "./node_modules/closure-compiler/lib/vendor/compiler.jar"

###########################################################
# Common tasks
###########################################################

gulp.task "default", [ "server" ]

gulp.task "clean", ->
    gulp.src PUBLIC_DIR
        .pipe rimraf()

###########################################################
# Emulator tasks
###########################################################

gulp.task "emulator", ->
    gulp.src "#{EMULATOR_DIR}/**/*.coffee"
        .pipe coffee
            bare: true
            inline: true
        .pipe bundle
            entry: "#{EMULATOR_DIR}/nescoffee.js"
            output: "nescoffee.js"
        .pipe gulp.dest PUBLIC_SCRIPTS_DIR
        .on "error", gutil.log

gulp.task "emulator-dist", [ "emulator" ], ->
    gulp.src "#{PUBLIC_SCRIPTS_DIR}/nescoffee.js"
        .pipe closure
            compilerPath: CLOSURE_JAR
            fileName: "nescoffee.min.js"
        .pipe gulp.dest PUBLIC_SCRIPTS_DIR

###########################################################
# Client tasks
###########################################################

gulp.task "client", [ "client-scripts", "client-styles", "client-views", "client-images", "client-deps" ]

gulp.task "client-scripts", ->
    gulp.src "#{CLIENT_DIR}/**/*.coffee"
        .pipe coffee()
        .pipe concat "app.js"
        .pipe gulp.dest PUBLIC_SCRIPTS_DIR
        .on "error", gutil.log

gulp.task "client-scripts-dist", [ "client-scripts" ], ->
    gulp.src "#{PUBLIC_SCRIPTS_DIR}/app.js"
        .pipe closure
            compilerPath: CLOSURE_JAR
            fileName: "app.min.js"
        .pipe dest PUBLIC_SCRIPTS_DIR

gulp.task "client-styles", ->
    gulp.src "#{CLIENT_DIR}/**/*.styl"
        .pipe stylus()
        .pipe concat "app.css"
        .pipe gulp.dest PUBLIC_STYLES_DIR

gulp.task "client-views", ->
    gulp.src "#{CLIENT_DIR}/**/*.jade"
        .pipe jade
            pretty: true
        .pipe gulp.dest PUBLIC_DIR

gulp.task "client-images", ->
    gulp.src "#{CLIENT_DIR}/**/*.{png,jpg,gif}"
        .pipe gulp.dest PUBLIC_DIR

###########################################################
# Client dependencies tasks
###########################################################

gulp.task "client-deps", [ "cliet-deps-scripts", "cliet-deps-styles", "cliet-deps-fonts" ]

gulp.task "cliet-deps-scripts", ->
    gulp.src [
        "#{DEPS_DIR}/jquery/dist/jquery.js"
        "#{DEPS_DIR}/angular/angular.js"
        "#{DEPS_DIR}/angular-route/angular-route.js"
        "#{DEPS_DIR}/bootstrap/dist/js/bootstrap.js"
        "#{DEPS_DIR}/js-md5/js/md5.js"
        "#{DEPS_DIR}/screenfull/dist/screenfull.js"
    ]
    .pipe gulp.dest PUBLIC_SCRIPTS_DIR

gulp.task "cliet-deps-styles", ->
    gulp.src [
        "#{DEPS_DIR}/bootstrap/dist/css/bootstrap.css"
        "#{DEPS_DIR}/bootstrap/dist/css/bootstrap-theme.css"
    ]
    .pipe gulp.dest PUBLIC_STYLES_DIR

gulp.task "cliet-deps-fonts", ->
    gulp.src "#{DEPS_DIR}/bootstrap/dist/fonts/glyphicons-halflings-regular.*"
        .pipe gulp.dest PUBLIC_FOTNS_DIR

###########################################################
# Server tasks
###########################################################

gulp.task "server", [ "emulator", "client" ], ->
    gulp.watch "#{EMULATOR_DIR}/**/*.coffee", [ "emulator" ]
    gulp.watch "#{CLIENT_DIR}/**/*.coffee", [ "client-scripts" ]
    gulp.watch "#{CLIENT_DIR}/**/*.styl", [ "client-styles" ]
    gulp.watch "#{CLIENT_DIR}/**/*.jade", [ "client-views" ]
    nodemon
        script: "#{SERVER_DIR}/app.coffee"
        ext: "coffee"
        env: { NODE_ENV: "development" }
        ignore: [ "#{EMULATOR_DIR}/*", "#{CLIENT_DIR}/*", "#{PUBLIC_DIR}/*" ]
