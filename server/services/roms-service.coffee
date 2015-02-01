fs   = require "fs"
path = require "path"

romsDir = path.join __dirname, "..", "roms"

isROM = (file) ->
    file[-4..].toLowerCase() is ".nes"

getROMId = (file) ->
    file.replace "'", ""
        .replace /\s*-\s*/g, "-"
        .replace /\s+/g, "-"
        .replace /\.nes$/i, ""
        .toLowerCase()

getROMName = (file) ->
    file.replace /\.nes$/i, ""

getROMImageFile = (file) ->
    for ext in [ "png", "git", "jpg", "jpeg" ]
        imageFile = file.replace /\.nes$/i, ".#{ext}"
        imagePath = path.join romsDir, imageFile
        return imageFile if fs.existsSync imagePath
    null

###########################################################
# ROMs library service
###########################################################

class ROMsService

    constructor: ->
        fs.mkdirSync romsDir unless fs.existsSync romsDir
        @reloadROMs()
        fs.watch romsDir, @reloadROMs

    reloadROMs: =>
        console.log "Scanning '#{romsDir}' directory"
        romList = []
        romMap = {}

        for file in fs.readdirSync romsDir when isROM file
            id = getROMId file
            name = getROMName file
            imageFile = getROMImageFile file
            romList.push { id: id, name: name, image: imageFile isnt null }
            romMap[id] = { file: file, imageFile: imageFile }

        romList.sort (a, b) -> a.name.localeCompare b.name
        @romList = romList
        @romMap = romMap
        console.log "Found #{@romList.length} ROMs"

    listROMs: (request, response) =>
        response.json @romList

    getROM: (request, response) =>
        @doWithROM request, response, (rom) ->
            response.download path.join romsDir, rom.file

    getROMImage: (request, response) =>
        @doWithROM request, response, (rom) ->
            unless rom.imageFile
                return response.status(404).send "File not found."
            response.download path.join romsDir, rom.imageFile

    doWithROM: (request, response, callback) ->
        id = request.params.id
        unless id?
            return response.status(400).send "Missing ROM ID."
        rom = @romMap[id]
        unless rom?
            return response.status(400).send "Incorrect ROM ID."
        callback rom

module.exports = new ROMsService
