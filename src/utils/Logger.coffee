###########################################################
# Logger
###########################################################

class Logger

    ###########################################################
    # Factory methods
    ###########################################################

    @loggers = []

    @get: (id = "default") ->
        @loggers[id] ?= new Logger

    @console: ->
        console

    @file: (fileName) ->
        new FileWriter fileName

    ###########################################################
    # Dummy output
    ###########################################################

    info: ->

    warn: ->

    error: ->

    close: ->

    ###########################################################
    # Attached output
    ###########################################################

    attach: (writer) ->
        @initWriters() if not @writers
        @writers.push writer
        this

    initWriters: ->
        @writers = []
        @info  = @writeInfo
        @warn  = @writeWarn
        @error = @writeError
        @close = @closeWriters

    writeInfo: (message) ->
        writer.info message for writer in @writers
        undefined

    writeWarn: (message) ->
        writer.warn message for writer in @writers
        undefined

    writeError: (message) ->
        if typeof message is "object" and message.stack and (not window? or window.chrome)
            message = message.stack # Fix ugly error output in chrome + fix terminal output
        writer.error message for writer in @writers
        undefined

    closeWriters: ->
        writer.close?() for writer in @writers
        @writers = null
        @info  = ->
        @warn  = ->
        @error = ->
        @close = ->
        undefined

###########################################################
# File Writer
###########################################################

class FileWriter

    constructor: (fileName) ->
        @fs = require "fs"
        @fd = @fs.openSync fileName, "w"

    info: (message) ->
        @write message + "\n"

    warn: (message) ->
        @write message + "\n"

    error: (message) ->
        @write message + "\n"

    write: (message) ->
        @fs.writeSync @fd, message

    close: ->
        @fs.close @fd

module.exports = Logger
