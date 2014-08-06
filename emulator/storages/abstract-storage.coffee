convert = require "../utils/convert"
logger  = require("../utils/logger").get()

###########################################################
# Base class for storage implementation
###########################################################

class AbstractStorage

    readString: (key) ->
        @read(key) or null

    writeString: (key, value) ->
        @write key, value

    readData: (key, output) ->
        value = @read key
        if value then convert.stringToData value, output else null

    writeData: (key, value) ->
        @write key, convert.dataToString(value)

    readObject: (key) ->
        value = @read key
        try
            if value then convert.stringToObject value else null
        catch
            logger.error "Unable to parse object from string: #{value}"
            null

    writeObject: (key, value) ->
        @write key, convert.objectToString(value)

module.exports = AbstractStorage
