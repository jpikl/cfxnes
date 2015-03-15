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
            @assert false, message

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

        blargg: ->
            # Test code for all Blargg's test ROMs
            RESULT_ADDRESS = 0x6000
            RESULT_RUNNING = 0x80
            RESULT_OK = 0x00
            MESSAGE_ADDRESS = 0x6004

            @step() until @readByte(RESULT_ADDRESS) is RESULT_RUNNING
            @step() while @readByte(RESULT_ADDRESS) is RESULT_RUNNING

            result = @readByte RESULT_ADDRESS
            message = @readString MESSAGE_ADDRESS
            @assert result is RESULT_OK, "\n#{message}"

    Logger.get(id).close() for id in loggerIds

itShouldPass = (name) ->
    it "should pass '#{name}'", ->
        execute name

describe "CPU", ->
    itShouldPass "nestest"
    itShouldPass "instr_test-v4"
    itShouldPass "instr_timing"

describe "PPU", ->
    itShouldPass "ppu_vbl_nmi"
