chai = require "chai"
chai.use require "chai-fs"

describe "Emulator", ->

    it "should pass 'nestest'", ->
        require "./nestest/nestest"
