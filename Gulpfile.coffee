# require "babel/register" # ES6 transpiling

del     = require "del"
gulp    = require "gulp"
closure = require "gulp-closure-compiler"
concat  = require "gulp-concat"
gulpif  = require "gulp-if"
jade    = require "gulp-jade"
mocha   = require "gulp-mocha"
nodemon = require "gulp-nodemon"
open    = require "gulp-open"
rename  = require "gulp-rename"
stylus  = require "gulp-stylus"
gutil   = require "gulp-util"
coffee  = require "gulp-coffee"
yargs   = require "yargs"

###########################################################
# Constants
###########################################################

PRODUCTION_MODE    = yargs.argv.production?
SERVER_PORT        = 5000
EMULATOR_INLINING  = true
DEPS_DIR           = "./bower_components"
BUILD_DIR          = "./build"
EMULATOR_DIR       = "./emulator"
CLIENT_DIR         = "./client"
SERVER_DIR         = "./server"
PUBLIC_DIR         = "#{SERVER_DIR}/public"
PUBLIC_IMAGES_DIR  = "#{PUBLIC_DIR}/images"
PUBLIC_SCRIPTS_DIR = "#{PUBLIC_DIR}/scripts"
PUBLIC_STYLES_DIR  = "#{PUBLIC_DIR}/styles"
PUBLIC_FONTS_DIR   = "#{PUBLIC_DIR}/fonts"
CLOSURE_JAR        = "./node_modules/closure-compiler/lib/vendor/compiler.jar"
EXTERNS_DIR        = "#{EMULATOR_DIR}/externs"

###########################################################
# Utilities
###########################################################

minifySrcNames = (names) ->
    minifySrcName name for name in names

minifySrcName = (name) ->
    parts = name.split ";"
    if PRODUCTION_MODE
        parts[1] or                            # "a;b"   => use "b"
        parts[1] is "" and parts[0] or         # "a;"    => use "a"
        parts[0].replace /\.js$/,  ".min.js"   # "a.js"  => use "a.min.js"
                .replace /\.css$/, ".min.css"  # "a.css" => use "a.min.css"
    else
        parts[0]

minifyDstName = (path) ->
    if PRODUCTION_MODE and path.basename[-4...] isnt ".min"
        path.basename += ".min"
    undefined

###########################################################
# Common tasks
###########################################################

gulp.task "default", [ "server", "browser" ]

#gulp.task "compile", [ "emulator-compile" ]

gulp.task "test", [ "emulator-test" ]

#gulp.task "clean", [ "emulator-clean" ]

###########################################################
# Emulator tasks
###########################################################

gulp.task "emulator", ->
    # gulp.src [ "#{BUILD_DIR}/**/*.js", "!#{BUILD_DIR}/**/{debug,tests}/**" ]
    #     .pipe closure
    #         compilerPath: CLOSURE_JAR
    #         fileName: minifySrcName "cfxnes.js"
    #         compilerFlags:
    #             logging_level: "ALL"
    #             compilation_level: if PRODUCTION_MODE then "ADVANCED_OPTIMIZATIONS" else "WHITESPACE_ONLY"
    #             #warning_level: "QUIET"
    #             process_common_js_modules: true
    #             common_js_entry_module: "#{BUILD_DIR}/frontend/emulator.js"
    #             externs: [
    #                 "#{EXTERNS_DIR}/md5.js"
    #                 "#{EXTERNS_DIR}/screenfull.js"
    #                 "#{EXTERNS_DIR}/w3c_audio.js"
    #             ]
    #     .pipe gulp.dest PUBLIC_SCRIPTS_DIR
    #     .on "error", gutil.log

gulp.task "emulator-test", ->
    gulp.src "#{EMULATOR_DIR}/core/tests/*-test{,s}.js", read: false
        .pipe mocha
            timeout: 60000 # 60 s

# gulp.task "emulator-compile", [ "emulator-clean" ], ->
#     gulp.src [ "#{EMULATOR_DIR}/**/*.coffee", "!#{EMULATOR_DIR}/**/{debug,tests}/**", "!#{EMULATOR_DIR}/core/readers/local-file-reader.coffee" ]
#         .pipe coffee
#             bare: true
#             inline: EMULATOR_INLINING
#         .pipe gulp.dest BUILD_DIR
#         .on "error", gutil.log

# gulp.task "emulator-clean", (callback) ->
#     del [ BUILD_DIR ], callback

###########################################################
# Client tasks
###########################################################

gulp.task "client", [ "client-scripts", "client-styles", "client-views", "client-images", "client-deps" ]

gulp.task "client-scripts", ->
    gulp.src "#{CLIENT_DIR}/**/*.coffee"
        .pipe coffee()
        .pipe concat minifySrcName "app.js"
        .pipe gulp.dest PUBLIC_SCRIPTS_DIR
        .on "error", gutil.log

gulp.task "client-styles", ->
    gulp.src "#{CLIENT_DIR}/**/*.styl"
        .pipe stylus
            compress: PRODUCTION_MODE
        .pipe concat minifySrcName "app.css"
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
    gulp.src minifySrcNames [
        "#{DEPS_DIR}/jquery/dist/jquery.js"
        "#{DEPS_DIR}/seiyria-bootstrap-slider/js/bootstrap-slider.js;#{DEPS_DIR}/seiyria-bootstrap-slider/dist/bootstrap-slider.min.js" # Different .min file path
        "#{DEPS_DIR}/angular/angular.js"
        "#{DEPS_DIR}/angular-ui-router/release/angular-ui-router.js"
        "#{DEPS_DIR}/angular-bootstrap/ui-bootstrap-tpls.js"
        "#{DEPS_DIR}/angular-bootstrap-slider/slider.js;" # Missing .min file
        "#{DEPS_DIR}/js-md5/js/md5.js"
        "#{DEPS_DIR}/screenfull/dist/screenfull.js;" # Missing .min file
    ]
    .pipe rename minifyDstName
    .pipe gulp.dest PUBLIC_SCRIPTS_DIR

gulp.task "cliet-deps-styles", ->
    gulp.src minifySrcNames [
        "#{DEPS_DIR}/bootstrap/dist/css/bootstrap.css"
        "#{DEPS_DIR}/bootstrap/dist/css/bootstrap-theme.css"
        "#{DEPS_DIR}/seiyria-bootstrap-slider/dist/css/bootstrap-slider.css"
    ]
    .pipe rename minifyDstName
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

gulp.task "browser", ->
    gulp.src "#{PUBLIC_DIR}/index.html"
        .pipe open "",
            url: "http://localhost:#{SERVER_PORT}"
