md5sum = require "../../lib/md5sum"

###########################################################
# Conversion utilities
###########################################################

Convert =

    computeMD5: (data) ->
        md5sum data

    bytesToString: (bytes) ->
        String.fromCharCode.apply null, bytes

    stringToBytes: (string, bytes) ->
        bytes ?= Uint8Array string.length
        bytes[i] = string.charCodeAt i for i in [0...string.length]
        bytes

module.exports = Convert
