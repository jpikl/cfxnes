express = require "express"
morgan  = require "morgan"

app = express()

debugMode = app.get("env") is "development"
app.use morgan "dev" if debugMode

app.use "/", express.static "#{__dirname}/public"

romsService = require "./services/roms-service"
app.get "/roms",           romsService.listROMs
app.get "/roms/:id(\\d+)", romsService.getROM

app.use (error, request, response, next) ->
    console.log error.stack if debugMode
    response.send 500, "Server internal error."

app.listen process.env.PORT or 5000
