Cartridge = require "../src/Cartridge"
Injector  = require "../src/utils/Injector"

testFile = process.argv[2]
totalSteps = parseInt process.argv[3]

cartridge = Cartridge.fromServerFile testFile

dependencies = 
    nes:           { module: "NES",            singleton: true }
    cpu:           { module: "debug/DebugCPU", singleton: true }
    ppu:           { module: "PPU",            singleton: true }
    papu:          { module: "PAPU",           singleton: true }
    cpuMemory:     { module: "CPUMemory",      singleton: true }
    ppuMemory:     { module: "PPUMemory",      singleton: true }
    loaderFactory: { module: "LoaderFactory",  singleton: true }
    mapperFactory: { module: "MapperFactory",  singleton: true }

injector = new Injector dependencies

nes = injector.getInstance "nes"
nes.insertCartridge cartridge
nes.step() for [1..totalSteps]
