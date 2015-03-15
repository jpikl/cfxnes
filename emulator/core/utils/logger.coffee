###########################################################
# Logger
###########################################################

class Logger

    @loggers = []

    ###########################################################
    # Static methods
    ###########################################################

    @get: (id = "default") ->
        @loggers[id] ?= new Logger id

    @console: ->
        console

    @file: (fileName) ->
        new FileWriter fileName

    ###########################################################
    # Lifecycle
    ###########################################################

    constructor: (@id) ->

    attach: (writer) ->
        @writers ?= []
        @writers.push writer
        this

    detach: (writer) ->
        if @writers
            index = @writers.indexOf writer
            @writers.splice index, 1 if index >= 0

    close: ->
        if @writers
            writer.close?() for writer in @writers
            @writers = null
        Logger.loggers[@id] = undefined
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
        # @fs = require "fs"
        # @fd = @fs.openSync fileName, "w"

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
