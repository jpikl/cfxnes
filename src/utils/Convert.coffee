md5sum = require "../../lib/md5sum"

###########################################################
# Conversion utilities
###########################################################

Convert =

    computeMD5: (data) ->
        md5sum data

    uint8ArrayToString: (array) ->
        String.fromCharCode.apply null, array

    stringToUint8Array: (string, array) ->
        array ?= Uint8Array string.length
        array[i] = string.charCodeAt i for i in [0...string.length]
        array

module.exports = Convert
