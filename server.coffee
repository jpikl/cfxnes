express  = require "express"
stylus   = require "stylus"
coffee   = require "connect-coffee-script"
path     = require "path"

# =============================================================================
#  Initialization
# =============================================================================

getPath = (name) -> path.join __dirname, name

develMode = process.env.NODE_ENV isnt "production"
console.log "Running in #{if develMode then 'development' else 'production'} mode"

app = express()

# =============================================================================
#  Middleware
# =============================================================================

app.use stylus.middleware
    src:      getPath "/"
    dest:     getPath "/build"
    force:    develMode
    compress: not develMode

app.use coffee
    src:   getPath "/"
    dest:  getPath "/build"
    force: develMode

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

for url in [ "/", "/index.html" ]
    app.get url, (request, response) ->
        response.render "index", { develMode: develMode }

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
