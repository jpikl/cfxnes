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
        try
            files = @readFiles()
            roms = ({ id: i, name: getROMName file } for file, i in files)
            response.json roms
        catch error
            console.log error
            response.status 500, "Internal error."

    getROM: (request, response) =>
        id = parseInt request.params.id
        unless id?
            return response.send 400, "Missing file ID."
        try
            files = @readFiles()
            file = files[id]
            unless file
                return response.send 400, "Incorrect file ID."
            response.download path.join romsDir, file
        catch error
            console.log error
            response.send 500, "Internal error."

module.exports = new ROMsService
