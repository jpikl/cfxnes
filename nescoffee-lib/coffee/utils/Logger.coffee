###########################################################
# Logger
###########################################################

class Logger

    @loggers = []

    ###########################################################
    # Factory methods
    ###########################################################

    @get: (id = "default") ->
        @loggers[id] ?= new Logger

    @console: ->
        console

    @file: (fileName) ->
        new FileWriter fileName

    ###########################################################
    # Output connection
    ###########################################################

    attach: (writer) ->
        @writers = [] unless @writers
        @writers.push writer
        this

    close: ->
        if @writers
            writer.close?() for writer in @writers
            @writers = null
        undefined

    ###########################################################
    # Logging
    ###########################################################

    info: (message) ->
        if @writers
            writer.info message for writer in @writers
        undefined

    warn: (message) ->
        if @writers
            writer.warn message for writer in @writers
        undefined

    error: (message) ->
        if @writers
            if typeof message is "object" and message.stack and (not window? or window.chrome)
                message = message.stack # Fix ugly error output in chrome + fix terminal output
            writer.error message for writer in @writers
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
