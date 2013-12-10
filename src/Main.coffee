Cartridge = require "./Cartridge"
NES       = require "./NES"

cartidge = Cartridge.fromServerFile("test.nes")

nes = new NES
nes.insertCartridge cartidge
nes.pressReset()
