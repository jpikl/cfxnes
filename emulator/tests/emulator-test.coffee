describe "Emulator", ->
    beforeEach ->
        jasmine.addMatchers require "./matchers"

    it "should pass 'nestest'", ->
        require "./nestest/nestest"
