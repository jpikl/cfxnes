Cartridge = require "./Cartridge"
Injector  = require "./utils/Injector"

dependencies = 
    nes:           { module: "NES",           singleton: true }
    cpu:           { module: "CPU",           singleton: true }
    ppu:           { module: "PPU",           singleton: true }
    papu:          { module: "PAPU",          singleton: true }
    cpuMemory:     { module: "CPUMemory",     singleton: true }
    ppuMemory:     { module: "PPUMemory",     singleton: true }
    loaderFactory: { module: "LoaderFactory", singleton: true }
    mapperFactory: { module: "MapperFactory", singleton: true }

if process?.argv[2] == "-d"
    dependencies.cpu.module = "debug/DebugCPU"
    testFile = process.argv[3]
    totalSteps = parseInt process.argv[4]

injector = new Injector dependencies
nes = injector.getInstance "nes"

if testFile?
    cartridge = Cartridge.fromServerFile testFile
    nes.insertCartridge cartridge
    nes.step() for [1..totalSteps]
