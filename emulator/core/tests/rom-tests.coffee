chai         = require "chai"
chaiFs       = require "chai-fs"
fs           = require "fs"
dataToString = require("../utils/convert").dataToString
Injector     = require "../utils/injector"
Logger       = require "../utils/logger"

chai.use chaiFs

execute = (name) ->
    injector = new Injector "core/tests/#{name}/config"

    cartridgeFactory = injector.getInstance "cartridgeFactory"
    cartridge = cartridgeFactory.fromLocalFile "./emulator/core/tests/#{name}/#{name}.nes"

    nes = injector.getInstance "nes"
    nes.insertCartridge cartridge

    cpuMemory = injector.getInstance "cpuMemory"

    loggerIds = []

    main = require "./#{name}/main"
    main
        assert: chai.assert
        expect: chai.expect

        fail: (message) ->
            assert false, message

        step: ->
            nes.step()

        steps: (count) ->
            @step() for [1..count]

        readByte: (address) ->
            cpuMemory.read address

        readString: (address) ->
            bytes = while true
                value = @readByte address++
                break if value is 0
                value
            dataToString bytes

        readFile: (file) ->
            fs.readFileSync file, "utf8"

        openLog: (id, file) ->
            loggerIds.push id
            Logger.get(id).attach Logger.file file

    Logger.get(id).close() for id in loggerIds

itShouldPass = (name) ->
    it "should pass '#{name}'", ->
        execute name

describe "CPU", ->
    itShouldPass "nestest"

describe "PPU", ->
    itShouldPass "ppu_vbl_nmi"
