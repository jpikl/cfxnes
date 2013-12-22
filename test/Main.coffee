Cartridge = require "../src/Cartridge"
Injector  = require "../src/utils/Injector"

configFile = process.argv[2]
cartridgeFile = process.argv[3]
totalSteps = parseInt process.argv[4]

cartridge = Cartridge.fromServerFile cartridgeFile
injector = new Injector configFile

nes = injector.getInstance "nes"
nes.insertCartridge cartridge
nes.step() for [1..totalSteps]
