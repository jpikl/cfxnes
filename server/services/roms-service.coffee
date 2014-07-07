fs   = require "fs"
path = require "path"

romsDir = path.join __dirname, "..", "roms"

getROMId = (fileName) ->
    fileName
        .replace "'", ""
        .replace /\s*-\s*/g, "-"
        .replace /\s+/g, "-"
        .replace /\.nes$/i, ""
        .toLowerCase()

getROMName = (fileName) ->
    fileName.replace /\.nes$/i, ""

###########################################################
# ROMs library API
###########################################################

class ROMsService

    constructor: ->
        @romList = []
        @romMap = {}

        for file, i in fs.readdirSync romsDir
            id = getROMId file
            name = getROMName file
            @romList[i] = { id: id, name: name, file: file }
            @romMap[id] = @romList[i]

        @romList.sort (a, b) -> a.name.localeCompare b.name

    listROMs: (request, response) =>
        response.json @romList

    getROM: (request, response) =>
        id = request.params.id
        unless id?
            return response.send 400, "Missing ROM ID."
        rom = @romMap[id]
        unless rom?
            return response.send 400, "Incorrect ROM ID."
        response.download path.join romsDir, rom.file

module.exports = new ROMsService
