express = require "express"
stylus  = require "stylus"
coffee  = require "connect-coffee-script"
morgan  = require "morgan"
path    = require "path"


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

app.use morgan "dev" if devEnvironment

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
app.use "/styles",  express.static getPath "/bower_components/bootstrap/dist/css"
app.use "/fonts",   express.static getPath "/bower_components/bootstrap/dist/fonts"

# =============================================================================
#  Services
# =============================================================================

romsService = require "./services/roms-service"
app.get "/roms",           romsService.listROMs
app.get "/roms/:id(\\d+)", romsService.getROM

# =============================================================================
#  Views
# =============================================================================

app.locals.pretty = devEnvironment
app.locals.devEnvironment = devEnvironment

app.set "view engine", "jade"
app.set "views",       "views"

app.get "/partials/:name.html", (request, response) ->
    partialName = request.params.name
    response.render "partials/#{partialName}"

for url in [ "/", "/index.html" ]
    app.get url, (request, response) ->
        response.render "index"

app.use (error, request, response, next) ->
    console.log error.stack if devEnvironment
    response.send 500, "Server internal error."

# =============================================================================
#  Start
# =============================================================================

app.listen process.env.PORT or 5000
