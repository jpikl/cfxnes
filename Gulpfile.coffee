yargs   = require "yargs"

gulp    = require "gulp"
gutil   = require "gulp-util"
gulpif  = require "gulp-if"
concat  = require "gulp-concat"
rimraf  = require "gulp-rimraf"
stylus  = require "gulp-stylus"
jade    = require "gulp-jade"
open    = require "gulp-open"
nodemon = require "gulp-nodemon"
closure = require "gulp-closure-compiler"

bundle  = require "./gulp/gulp-bundle-modules"
coffee  = require "./gulp/gulp-inlined-coffee"


###########################################################
# Constants
###########################################################

PRODUCTION_MODE    = yargs.argv.production?
SERVER_PORT        = 5000
DEPS_DIR           = "./bower_components"
EMULATOR_DIR       = "./emulator"
CLIENT_DIR         = "./client"
SERVER_DIR         = "./server"
PUBLIC_DIR         = "#{SERVER_DIR}/public"
PUBLIC_IMAGES_DIR  = "#{PUBLIC_DIR}/images"
PUBLIC_SCRIPTS_DIR = "#{PUBLIC_DIR}/scripts"
PUBLIC_STYLES_DIR  = "#{PUBLIC_DIR}/styles"
PUBLIC_FONTS_DIR   = "#{PUBLIC_DIR}/fonts"
CLOSURE_JAR        = "./node_modules/closure-compiler/lib/vendor/compiler.jar"

###########################################################
# Utilities
###########################################################

minnames = (files) ->
    minname file for file in files

minname = (file) ->
    if PRODUCTION_MODE
        file.replace /\.js$/,  ".min.js"
            .replace /\.css$/, ".min.css"
    else
        file

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
    gulp.src [ "#{EMULATOR_DIR}/**/*.coffee", "!#{EMULATOR_DIR}/{debug,tests}/**" ]
        .pipe coffee
            bare: true
            inline: true
        .pipe bundle
            entry: "#{EMULATOR_DIR}/nescoffee.js"
            output: "nescoffee.js"
        .pipe gulpif PRODUCTION_MODE, closure
            compilerPath: CLOSURE_JAR
            fileName: "nescoffee.min.js"
            compilerFlags:
                compilation_level: "ADVANCED_OPTIMIZATIONS"
                warning_level: "QUIET"
        .pipe gulp.dest PUBLIC_SCRIPTS_DIR
        .on "error", gutil.log

###########################################################
# Client tasks
###########################################################

gulp.task "client", [ "client-scripts", "client-styles", "client-views", "client-images", "client-deps" ]

gulp.task "client-scripts", ->
    gulp.src "#{CLIENT_DIR}/**/*.coffee"
        .pipe coffee()
        .pipe concat minname "app.js"
        .pipe gulp.dest PUBLIC_SCRIPTS_DIR
        .on "error", gutil.log

gulp.task "client-styles", ->
    gulp.src "#{CLIENT_DIR}/**/*.styl"
        .pipe stylus
            compress: PRODUCTION_MODE
        .pipe concat minname "app.css"
        .pipe gulp.dest PUBLIC_STYLES_DIR

gulp.task "client-views", ->
    gulp.src "#{CLIENT_DIR}/**/*.jade"
        .pipe jade
            pretty:       true # not PRODUCTION_MODE # Causes strange problem with css
            compileDebug: not PRODUCTION_MODE
            data:
                productionMode: PRODUCTION_MODE
        .pipe gulp.dest PUBLIC_DIR

gulp.task "client-images", ->
    gulp.src "#{CLIENT_DIR}/**/*.{png,jpg,gif}"
        .pipe gulp.dest PUBLIC_DIR

###########################################################
# Client dependencies tasks
###########################################################

gulp.task "client-deps", [ "cliet-deps-scripts", "cliet-deps-styles", "cliet-deps-fonts" ]

gulp.task "cliet-deps-scripts", ->
    gulp.src minnames [
        "#{DEPS_DIR}/jquery/dist/jquery.js"
        "#{DEPS_DIR}/angular/angular.js"
        "#{DEPS_DIR}/angular-ui-router/release/angular-ui-router.js"
        "#{DEPS_DIR}/angular-bootstrap/ui-bootstrap-tpls.js"
        "#{DEPS_DIR}/js-md5/js/md5.js"
        "#{DEPS_DIR}/screenfull/dist/screenfull.js"
    ]
    .pipe gulp.dest PUBLIC_SCRIPTS_DIR

gulp.task "cliet-deps-styles", ->
    gulp.src minnames [
        "#{DEPS_DIR}/bootstrap/dist/css/bootstrap.css"
        "#{DEPS_DIR}/bootstrap/dist/css/bootstrap-theme.css"
    ]
    .pipe gulp.dest PUBLIC_STYLES_DIR

gulp.task "cliet-deps-fonts", ->
    gulp.src "#{DEPS_DIR}/bootstrap/dist/fonts/glyphicons-halflings-regular.*"
        .pipe gulp.dest PUBLIC_FONTS_DIR

###########################################################
# Server tasks
###########################################################

gulp.task "server", [ "emulator", "client" ], ->
    gulp.watch "#{EMULATOR_DIR}/**/*.coffee", [ "emulator" ]
    gulp.watch "#{CLIENT_DIR}/**/*.coffee", [ "client-scripts" ]
    gulp.watch "#{CLIENT_DIR}/**/*.styl", [ "client-styles" ]
    gulp.watch "#{CLIENT_DIR}/**/*.jade", [ "client-views" ]
        .on "error", gutil.log
    nodemon
        script: "#{SERVER_DIR}/app.coffee"
        ext: "coffee"
        env: { NODE_ENV: if PRODUCTION_MODE then "produtction" else "development" }
        ignore: [ "#{EMULATOR_DIR}/*", "#{CLIENT_DIR}/*", "#{PUBLIC_DIR}/*" ]
    .on "start", [ "browser" ]


gulp.task "browser", ->
    gulp.src "#{PUBLIC_DIR}/index.html"
        .pipe open "",
            url: "http://localhost:#{SERVER_PORT}"
