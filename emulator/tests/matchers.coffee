fs = require "fs"

sameFileContentMatcher = (util, customEqualityTesters) ->
    compare: (origFile, testFile) ->
        origContent = fs.readFileSync origFile
        testContent = fs.readFileSync testFile
        pass: util.equals origContent, testContent

module.exports =
    toBeFileWithSameContentAs: sameFileContentMatcher
