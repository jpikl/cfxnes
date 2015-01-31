express = require "express"
morgan  = require "morgan"

app = express()

productionMode = app.get("env") is "production"
app.use morgan "dev" unless productionMode

app.use "/", express.static "#{__dirname}/public"

romsService = require "./services/roms-service"
app.get "/roms",           romsService.listROMs
app.get "/roms/:id",       romsService.getROM
app.get "/roms/:id/image", romsService.getROMImage

app.use (error, request, response, next) ->
    console.log error.stack unless productionMode
    response.send 500, "Server internal error."

app.listen process.env.PORT or 5000
