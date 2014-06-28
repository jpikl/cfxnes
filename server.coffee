express  = require "express"
stylus   = require "stylus"
coffee   = require "connect-coffee-script"
jade     = require "connect-jade-html"
path     = require "path"

# =============================================================================
#  Declarations
# =============================================================================

debugMode = process.argv.indexOf("--debug-mode") >= 0
getDir = (name) -> path.join __dirname, name

console.log "Running in #{if debugMode then 'debugging' else 'production'} mode"

app = express()

# =============================================================================
#  Middleware
# =============================================================================

app.use stylus.middleware
    src:      getDir "/"
    dest:     getDir "/build"
    force:    debugMode
    compress: not debugMode

app.use coffee
    src:   getDir "/"
    dest:  getDir "/build"
    force: debugMode

app.use jade
    src:    getDir "/"
    dest:   getDir "/build"
    pretty: debugMode
    debug:  false

# =============================================================================
#  Static files
# =============================================================================

app.use "/lib",     express.static getDir "/lib"
app.use "/images",  express.static getDir "/images"
app.use "/scripts", express.static getDir "/build/scripts"
app.use "/styles",  express.static getDir "/build/styles"
app.use "/views",   express.static getDir "/build/views"

# =============================================================================
#  Services
# =============================================================================

romsService = require "./services/romsservice"
app.get "/roms",           romsService.listROMs
app.get "/roms/:id(\\d+)", romsService.getROM

# =============================================================================
#  Start
# =============================================================================

app.listen process.env.PORT or 5000
