###########################################################
# Conversion utilities
###########################################################

convert =

    computeMD5: md5 ? require "js-md5"

    dataToString: (input) ->
        String.fromCharCode.apply null, input

    stringToData: (input, output) ->
        output ?= Uint8Array input.length
        output[i] = input.charCodeAt i for i in [0...input.length]
        output

    objectToString: (input) ->
        JSON.stringify input

    stringToObject: (input) ->
        JSON.parse input

module.exports = convert
