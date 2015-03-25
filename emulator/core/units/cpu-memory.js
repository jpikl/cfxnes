import { logger }                   from "../utils/logger";
import { newByteArray,
         newUintArray, clearArray } from "../utils/system";

//=========================================================
// CPU memory
//=========================================================

export class CPUMemory {

    constructor() {
        this.initRAM();
        this.initIO();
        this.initPRGRAM();
        this.initPRGROM();
    }

    inject(ppu, apu, dma) {
        this.ppu = ppu;
        this.apu = apu;
        this.dma = dma;
    }

    //=========================================================
    // Power-up state initialization
    //=========================================================

    powerUp() {
        logger.info("Reseting CPU memory");
        this.resetRAM();
        this.resetIO();
        this.resetPRGRAM();
        this.resetPRGROM();
    }

    //=========================================================
    // CPU memory access
    //=========================================================

    read(address) {
        if      (address >= 0x8000) return this.readPRGROM(address); // $8000-$FFFF
        else if (address <  0x2000) return this.readRAM(address);    // $0000-$1FFF
        else if (address <  0x4020) return this.readIO(address);     // $2000-$401F
        else if (address >= 0x6000) return this.readPRGRAM(address); // $6000-$7FFF
        else                        return this.readEXROM(address);  // $4020-$5FFF
    }

    write(address, value) {
        if      (address >= 0x8000) this.writePRGROM(address, value); // $8000-$FFFF
        else if (address <  0x2000) this.writeRAM(address, value);    // $0000-$1FFF
        else if (address <  0x4020) this.writeIO(address, value);     // $2000-$401F
        else if (address >= 0x6000) this.writePRGRAM(address, value); // $6000-$7FFF
        else                        this.writeEXROM(address, value);  // $4020-$5FFF
    }

    //=========================================================
    // RAM acceess ($0000-$1FFF)
    //=========================================================

    initRAM() {
        this.ram = newByteArray(0x800); // 2KB of RAM (mirrored in 8K at $0000-$1FFF)
    }

    resetRAM() {
        clearArray(this.ram);
    }

    readRAM(address) {
        return this.ram[this.mapRAMAddress(address)];
    }

    writeRAM(address, value) {
        this.ram[this.mapRAMAddress(address)] = value;
    }

    mapRAMAddress(address) {
        return address & 0x07FF; // Mirroring of [$0000-$07FFF] in [$0000-$1FFF]
    }

    //=========================================================
    // IO acceess ($2000-$401F)
    //=========================================================

    initIO() {
        this.inputDevices = { 1: null, 2: null };
        this.inputStrobe = 0;
    }

    resetIO() {
        this.inputStrobe = 0;
    }

    readIO(address) {
        switch (this.mapIOAddress(address)) {
            case 0x2002: return this.ppu.readStatus();
            case 0x2004: return this.ppu.readOAMData();
            case 0x2007: return this.ppu.readData();
            case 0x4015: return this.apu.readStatus();
            case 0x4016: return this.readInputDevice(1);
            case 0x4017: return this.readInputDevice(2);
            default:     return 0;
        }
    }

    writeIO(address, value) {
        switch (this.mapIOAddress(address)) {
            case 0x2000: this.ppu.writeControl(value); break;
            case 0x2001: this.ppu.writeMask(value); break;
            case 0x2003: this.ppu.writeOAMAddress(value); break;
            case 0x2004: this.ppu.writeOAMData(value); break;
            case 0x2005: this.ppu.writeScroll(value); break;
            case 0x2006: this.ppu.writeAddress(value); break;
            case 0x2007: this.ppu.writeData(value); break;
            case 0x4014: this.dma.writeAddress(value); break;
            case 0x4016: this.writeInputDevice(value); break;
            case 0x4000: this.apu.writePulseDutyEnvelope(1, value); break;
            case 0x4001: this.apu.writePulseSweep(1, value); break;
            case 0x4002: this.apu.writePulseTimer(1, value); break;
            case 0x4003: this.apu.writePulseLengthCounter(1, value); break;
            case 0x4004: this.apu.writePulseDutyEnvelope(2, value); break;
            case 0x4005: this.apu.writePulseSweep(2, value); break;
            case 0x4006: this.apu.writePulseTimer(2, value); break;
            case 0x4007: this.apu.writePulseLengthCounter(2, value); break;
            case 0x4008: this.apu.writeTriangleLinearCounter(value); break;
            case 0x400A: this.apu.writeTriangleTimer(value); break;
            case 0x400B: this.apu.writeTriangleLengthCounter(value); break;
            case 0x400C: this.apu.writeNoiseEnvelope(value); break;
            case 0x400E: this.apu.writeNoiseTimer(value); break;
            case 0x400F: this.apu.writeNoiseLengthCounter(value); break;
            case 0x4010: this.apu.writeDMCFlagsTimer(value); break;
            case 0x4011: this.apu.writeDMCOutputLevel(value); break;
            case 0x4012: this.apu.writeDMCSampleAddress(value); break;
            case 0x4013: this.apu.writeDMCSampleLength(value); break;
            case 0x4015: this.apu.writeStatus(value); break;
            case 0x4017:
                this.apu.writeFrameCounter(value);
                this.writeInputDevice(value);
                break;
        }
    }

    mapIOAddress(address) {
        if (address < 0x4000) {
            return address & 0x2007; // Mirroring of [$2000-$2007] in [$2000-$3FFF]
        } else {
            return address;
        }
    }

    //=========================================================
    // Input devices acceess ($4000-$401F)
    //=========================================================

    setInputDevice(port, device) {
        this.inputDevices[port] = device;
    }

    getInputDevice(port) {
        return this.inputDevices[port];
    }

    readInputDevice(port) {
        var device = this.inputDevices[port];
        return device ? device.read() : 0;
    }

    strobeInputDevice(port) {
        var device = this.inputDevices[port];
        if (device) {
            device.strobe();
        }
    }

    writeInputDevice(value) {
        var strobe = value & 1;
        if (strobe && !this.inputStrobe) {
            this.strobeInputDevice(1);
            this.strobeInputDevice(2);
        }
        this.inputStrobe = strobe;
    }

    //=========================================================
    // EX ROM acceess ($4020-$5FFF)
    //=========================================================

    readEXROM(address) {
        return 0; // Not supported yet
    }

    writeEXROM(address, value) {
        // Not supported yet
    }

    //=========================================================
    // PRG RAM acceess ($6000-$7FFF)
    //=========================================================

    initPRGRAM() {
        this.prgRAMMapping = 0;
    }

    remapPRGRAM(mapper) {
        this.prgRAM = mapper.prgRAM;
    }

    resetPRGRAM() {
        this.prgRAMMapping = 0;
    }

    readPRGRAM(address) {
        if (this.prgRAM) {
            return this.prgRAM[this.mapPRGRAMAddress(address)];
        }
        return 0;
    }

    writePRGRAM(address, value) {
        if (this.prgRAM) {
            this.prgRAM[this.mapPRGRAMAddress(address)] = value;
        }
    }

    mapPRGRAMAddress(address) {
        return this.prgRAMMapping | address & 0x1FFF;
    }

    mapPRGRAMBank(srcBank, dstBank) {
        this.prgRAMMapping = dstBank * 0x2000; // Only one 8K bank
    }

    //=========================================================
    // PRG ROM acceess ($8000-$FFFF)
    //=========================================================

    initPRGROM() {
        this.prgROMMapping = newUintArray(4);
    }

    remapPRGROM(mapper) {
        this.writeMapper = mapper.write.bind(mapper);
        this.prgROM = mapper.prgROM;
    }

    resetPRGROM() {
        clearArray(this.prgROMMapping);
    }

    readPRGROM(address) {
        return this.prgROM[this.mapPRGROMAddress(address)];
    }

    writePRGROM(address, value) {
        this.writeMapper(address, value); // Writing to mapper registers
    }

    mapPRGROMAddress(address) {
        return this.prgROMMapping[(address & 0x6000) >>> 13] | address & 0x1FFF;
    }

    mapPRGROMBank(srcBank, dstBank) {
        this.prgROMMapping[srcBank] = dstBank * 0x2000; // 8K bank
    }

    //=========================================================
    // Mapper connection
    //=========================================================

    connectMapper(mapper) {
        this.remapPRGRAM(mapper);
        this.remapPRGROM(mapper);
    }

}

CPUMemory["dependencies"] = [ "ppu", "apu", "dma" ];
