fs       = require "fs"
expect   = require("chai").expect
Injector = require "../../utils/injector"
Logger   = require "../../utils/logger"

SIMPLE_LOG_FILE   = "./temp/nestest-simple.log"
VERBOSE_LOG_FILE  = "./temp/nestest-full.log"
VERIFIED_LOG_FILE = "./emulator/core/tests/nestest/nintendulator-simple.log"
CARTRDIGE_FILE    = "./emulator/core/tests/nestest/nestest.nes"
CONFIG_PATH       = "tests/nestest/test-config"
TOTAL_STEPS       = 8991

simpleLogger = Logger.get "debug-simple"
simpleLogger.attach Logger.file SIMPLE_LOG_FILE

verboseLogger = Logger.get "debug-verbose"
verboseLogger.attach Logger.file VERBOSE_LOG_FILE

injector = new Injector CONFIG_PATH

cartridgeFactory = injector.getInstance "cartridgeFactory"
cartridge = cartridgeFactory.fromLocalFile CARTRDIGE_FILE

nes = injector.getInstance "nes"
nes.pressPower()
nes.insertCartridge cartridge
nes.step() for [1..TOTAL_STEPS]

simpleLogger.close()
verboseLogger.close()

verifiedLog = fs.readFileSync VERIFIED_LOG_FILE, "utf8"
expect(SIMPLE_LOG_FILE).to.have.content verifiedLog
