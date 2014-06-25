Injector  = require "../src/utils/injector"
Logger    = require "../src/utils/logger"

configFile = process.argv[2]
cartridgeFile = process.argv[3]
totalSteps = parseInt process.argv[4]

logger = Logger.get "debug"
logger.attach Logger.file "nescoffee.log"

injector = new Injector configFile

cartridgeFactory = injector.getInstance "cartridge-factory"
cartridge = cartridgeFactory.fromLocalFile cartridgeFile

nes = injector.getInstance "nes"
nes.pressPower()
nes.insertCartridge cartridge
nes.step() for [1..totalSteps]

logger.close()
