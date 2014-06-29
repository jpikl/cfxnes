###########################################################
# Gulp plugin that bundles multiple Node.js modules
# into single file which can be used in browser.
###########################################################

buffer    = require "buffer"
es        = require "event-stream"
gutil     = require "gulp-util"
path      = require "path"
generator = require "./lib/bundle-generator"

Buffer      = buffer.Buffer
File        = gutil.File;
PluginError = gutil.PluginError

ENCODING = "utf8"

error = (message) ->
    throw new PluginError "gulp-bundle-modules", message

module.exports = (options) ->
    error "Missing 'entry' option"  unless options?.entry
    error "Missing 'output' option" unless options?.output

    initCode = generator.generateInitCode()
    codeBuffer = [ new Buffer initCode, ENCODING ]

    writeCallback = (file) ->
        error "Streaming not supported" if file.isStream()
        unless file.isNull()
            normalizedPath = path.normalize file.path
            modulePath = path.relative file.cwd, normalizedPath
            moduleContents = file.contents.toString ENCODING
            moduleCode = generator.generateModuleCode modulePath, moduleContents
            codeBuffer.push new Buffer moduleCode, ENCODING

    endCallback = ->
        entryPath = path.normalize options.entry
        entryCode = generator.generateEntryCode entryPath
        codeBuffer.push new Buffer entryCode, ENCODING
        @emit "data", new File
            path:     options.output
            contents: Buffer.concat codeBuffer
        @emit "end"

    es.through writeCallback, endCallback
