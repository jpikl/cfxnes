fs       = require "fs"
assert   = require("chai").assert
expect   = require("chai").expect
Injector = require "../../utils/injector"
Logger   = require "../../utils/logger"

BASIC_LOG_FILE    = "./temp/nestest.log"                              # This is what we will compare with the verified log
VERBOSE_LOG_FILE  = "./temp/nestest-full.log"                         # Contains more information for better debugging
VERIFIED_LOG_FILE = "./emulator/core/tests/nestest/nintendulator.log" # Verified log from Nintendulator
CARTRDIGE_FILE    = "./emulator/core/tests/nestest/nestest.nes"
CONFIG_PATH       = "core/tests/nestest/test-config"
TOTAL_STEPS       = 8991

basicLogger = Logger.get "debug-basic"
basicLogger.attach Logger.file BASIC_LOG_FILE

verboseLogger = Logger.get "debug-verbose"
verboseLogger.attach Logger.file VERBOSE_LOG_FILE

injector = new Injector CONFIG_PATH

cartridgeFactory = injector.getInstance "cartridgeFactory"
cartridge = cartridgeFactory.fromLocalFile CARTRDIGE_FILE

nes = injector.getInstance "nes"
nes.insertCartridge cartridge
nes.step() for [1..TOTAL_STEPS]

basicLogger.close()
verboseLogger.close()

verifiedLog = fs.readFileSync VERIFIED_LOG_FILE, "utf8"
try
    expect(BASIC_LOG_FILE).to.have.content verifiedLog
catch error
    # The default error message contains whole log which is completely unreadable
    assert false, """
        CFxNES log differs from Nintendulator log.
             - Run 'vimdiff #{BASIC_LOG_FILE} #{VERIFIED_LOG_FILE}' to see differences.
             - See contents of '#{VERBOSE_LOG_FILE}' for more detailed output.
    """
