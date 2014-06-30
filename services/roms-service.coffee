fs   = require "fs"
path = require "path"

romsDir = path.join __dirname, "..", "roms"

getROMName = (fileName) ->
    fileName[..-5] or ""

###########################################################
# ROMs library API
###########################################################

class ROMsService

    readFiles: ->
        files = fs.readdirSync romsDir
        files.sort (a, b) -> getROMName(a).localeCompare getROMName(b)
        files

    listROMs: (request, response) =>
        files = @readFiles()
        roms = ({ id: i, name: getROMName file } for file, i in files)
        response.json roms

    getROM: (request, response) =>
        id = parseInt request.params.id
        unless id?
            return response.send 400, "Missing file ID."
        files = @readFiles()
        file = files[id]
        unless file?
            return response.send 400, "Incorrect file ID."
        response.download path.join romsDir, file

module.exports = new ROMsService
