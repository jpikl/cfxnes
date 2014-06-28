###########################################################
# Conversion utilities
###########################################################

convert =

    computeMD5: md5 ? require "js-md5"

    bytesToString: (bytes) ->
        String.fromCharCode.apply null, bytes

    stringToBytes: (string, bytes) ->
        bytes ?= Uint8Array string.length
        bytes[i] = string.charCodeAt i for i in [0...string.length]
        bytes

module.exports = convert
