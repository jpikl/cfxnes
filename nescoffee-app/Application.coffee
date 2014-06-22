Express  = require "express"
Stylus   = require "stylus"
Coffee   = require "connect-coffee-script"
FS       = require "fs"
Path     = require "path"

DEBUG_MODE = process.argv.indexOf("--debug-mode") >= 0
console.log "Running in #{if DEBUG_MODE then 'debugging' else 'production'} mode"

ROOT_DIR   = __dirname
PUBLIC_DIR = Path.join ROOT_DIR, "public"
ROMS_DIR   = Path.join PUBLIC_DIR, "roms"

application = Express()

application.use Stylus.middleware
    src:      ROOT_DIR
    dest:     PUBLIC_DIR
    force:    DEBUG_MODE
    compress: not DEBUG_MODE

application.use Coffee
    src:      ROOT_DIR
    dest:     PUBLIC_DIR
    force:    DEBUG_MODE

application.use Express.static PUBLIC_DIR

application.get "/roms/", (request, response) ->
    try
        roms = FS.readdirSync ROMS_DIR
        roms.sort (a, b) -> a[..-5].localeCompare(b[..-5]) # Compare without '.nes' extension
        response.json roms
    catch error
        console.log error
        response.json []

application.listen process.env.PORT or 5000
