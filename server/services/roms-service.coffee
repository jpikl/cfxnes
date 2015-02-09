fs   = require "fs"
path = require "path"

romsDir = path.join __dirname, "..", "roms"

isROM = (file) ->
    file[-4..].toLowerCase() is ".nes"

getROMId = (file) ->
    file.replace /\.nes$/i, ""
        .replace /[^a-zA-Z0-9]+/g, "-"
        .replace /^-/, ""
        .replace /-$/, ""
        .toLowerCase()

getROMName = (file) ->
    file.replace /\.nes$/i, ""

getROMThumbnail = (file) ->
    for ext in [ "png", "git", "jpg", "jpeg" ]
        thumbnailFile = file.replace /\.nes$/i, ".#{ext}"
        thumbnailPath = path.join romsDir, thumbnailFile
        return thumbnailFile if fs.existsSync thumbnailPath
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
        romFiles = {}

        for file in fs.readdirSync romsDir when isROM file
            id = getROMId file
            name = getROMName file
            fileName = path.basename file
            fileURL = "/files/#{fileName}"
            thumbnail = getROMThumbnail file
            thumbnailName = if thumbnail then path.basename thumbnail else null
            thumbnailURL =  if thumbnail then "/files/#{thumbnailName}" else null
            rom = { id: id, name: name, fileURL: fileURL, thumbnailURL: thumbnailURL }
            romList.push rom
            romMap[id] = rom
            romFiles[fileName] = path.join romsDir, file
            romFiles[thumbnailName] = path.join romsDir, thumbnail if thumbnail

        romList.sort (a, b) ->
            a.name.replace(/^The /i, "").localeCompare b.name.replace(/^The /i, "")

        @romList = romList
        @romMap = romMap
        @romFiles = romFiles
        console.log "Found #{@romList.length} ROMs"

    listROMs: (request, response) =>
        response.json @romList

    getROM: (request, response) =>
        id = request.params.id
        unless id?
            return response.status(400).send "Missing ROM ID."
        rom = @romMap[id]
        unless rom?
            return response.status(404).send "ROM with ID #{id} not found."
        response.json rom

    getFile: (request, response) =>
        name = request.params.name
        unless name?
            return response.status(400).send "Missing filename."
        file = @romFiles[name]
        unless file?
            return response.status(404).send "File #{name} not found."
        response.download file

module.exports = new ROMsService
