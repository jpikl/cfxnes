express  = require "express"
stylus   = require "stylus"
coffee   = require "connect-coffee-script"
path     = require "path"

# =============================================================================
#  Initialization
# =============================================================================

getPath = (name) -> path.join __dirname, name

app = express()

environment = app.get "env"
devEnvironment = environment is "development"

console.log "Running in '#{environment ? "unknown"}' environment"

# =============================================================================
#  Middleware
# =============================================================================

app.use stylus.middleware
    src:      getPath "/"
    dest:     getPath "/build"
    force:    devEnvironment
    compress: not devEnvironment

app.use coffee
    src:   getPath "/"
    dest:  getPath "/build"
    force: devEnvironment

# =============================================================================
#  Static files
# =============================================================================

app.use "/images",  express.static getPath "/images"
app.use "/scripts", express.static getPath "/build/scripts"
app.use "/styles",  express.static getPath "/build/styles"
app.use "/fonts",   express.static getPath "/build/fonts"
app.use "/scripts", express.static getPath "/bower_components/angular"
app.use "/scripts", express.static getPath "/bower_components/bootstrap/dist/js"
app.use "/scripts", express.static getPath "/bower_components/jquery/dist"
app.use "/scripts", express.static getPath "/bower_components/js-md5/js"
app.use "/scripts", express.static getPath "/bower_components/screenfull/dist"
app.use "/scripts", express.static getPath "/bower_components/"
app.use "/styles",  express.static getPath "/bower_components/bootstrap/dist/css"
app.use "/fonts",   express.static getPath "/bower_components/bootstrap/dist/fonts"

# =============================================================================
#  Views
# =============================================================================

app.set "view engine", "jade"
app.set "views",       "views"

app.locals.pretty = devEnvironment

for url in [ "/", "/index.html" ]
    app.get url, (request, response) ->
        response.render "index", { devEnvironment: devEnvironment }

app.get "/views/:file.html", (request, response) ->
    response.render request.params.file

# =============================================================================
#  Services
# =============================================================================

romsService = require "./services/roms-service"
app.get "/roms",           romsService.listROMs
app.get "/roms/:id(\\d+)", romsService.getROM

# =============================================================================
#  Start
# =============================================================================

app.listen process.env.PORT or 5000
