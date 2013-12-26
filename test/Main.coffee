Injector  = require "../src/utils/Injector"

configFile = process.argv[2]
cartridgeFile = process.argv[3]
totalSteps = parseInt process.argv[4]

injector = new Injector configFile

cartridgeFactory = injector.getInstance "cartridgeFactory"
cartridge = cartridgeFactory.fromLocalFile cartridgeFile

nes = injector.getInstance "nes"
nes.pressPower()
nes.insertCartridge cartridge
nes.step() for [1..totalSteps]
