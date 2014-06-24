fs   = require "fs"
path = require "path"

romsDir = path.join __dirname, "..", "roms"

class ROMsService

    readFiles: ->
        files = fs.readdirSync romsDir
        files.sort (a, b) -> a[..-5].localeCompare b[..-5] # Compare without '.nes' extension
        files

    listROMs: (request, response) =>
        try
            files = @readFiles()
            roms = ({ id: i, file: file } for file, i in files)
            response.json roms
        catch error
            console.log error
            response.status 500

    getROM: (request, response) =>
        id = parseInt request.params.id
        unless id
            return response.status 400
        try
            files = @readFiles()
            file = files[id]
            unless file
                return response.status 400
            response.sendfile path.join romsDir, file
        catch error
            console.log error
            response.status 500

module.exports = new ROMsService
