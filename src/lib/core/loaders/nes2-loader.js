import { INESLoader } from "./ines-loader";
import { Region }     from "../common/region";

var submappers = {
    "MMC1": {
        0x01: "SUROM",
        0x02: "SOROM",
        0x03: "SXROM"
    }
};

//=========================================================
// Loader for the NES 2.0 ROM format
//=========================================================

export class NES2Loader extends INESLoader {

    constructor() {
        super("NES 2.0");
    }

    supports(reader) {
        if (super.supports(reader)) {
            var flags = reader.peek(8); // Byte 7 must be xxxx10xx
            return flags.length === 8 && (flags[7] & 0x0C) === 0x08;
        }
        return false;
    }

    //=========================================================
    // Header reading
    //=========================================================

    readByte8(reader, cartridge) {
        var flags = reader.readByte();
        cartridge.mapperId |= (flags & 0x0F) << 8;    // Bits 8-11 of mapper number
        cartridge.submapperId = (flags & 0xF0) >>> 4; // Zero when not used
    }

    readByte9(reader, cartridge) {
        var flags = reader.readByte();
        cartridge.prgROMSize += ((flags & 0x0F) << 8) * 0x4000; // + N x 16KB (bits 8-11 of N)
        cartridge.chrROMSize += ((flags & 0xF0) << 4) * 0x2000; // + N x  8KB (bits 8-11 of N)
    }

    readByte10(reader, cartridge) {
        var flags = reader.readByte();
        cartridge.prgRAMSizeBattery = this.computeRAMSize((flags & 0xF0) >>> 4);
        cartridge.prgRAMSize = cartridge.prgRAMSizeBattery + this.computeRAMSize(flags & 0x0F);
        cartridge.hasPRGRAM = cartridge.prgRAMSize !== 0;
        cartridge.hasPRGRAMBattery = cartridge.prgRAMSizeBattery !== 0; // Overrides iNES value from byte 6
    }

    readByte11(reader, cartridge) {
        var flags = reader.readByte();
        cartridge.chrRAMSizeBattery = this.computeRAMSize((flags & 0xF0) >>> 4);
        cartridge.chrRAMSize = cartridge.chrRAMSizeBattery + this.computeRAMSize(flags & 0x0F);
        cartridge.hasCHRRAM = cartridge.chrRAMSize !== 0;
        cartridge.hasCHRRAMBattery = cartridge.chrRAMSizeBattery !== 0;
    }

    readByte12(reader, cartridge) {
        var flags = reader.readByte();
        cartridge.region = flags & 0x01 ? Region.PAL : Region.NTSC;
    }

    computeRAMSize(value) {
        if (value > 0) {
            return Math.pow(2, value - 1) * 0x80; // grows exponentially: 128B, 256B, 512B, ...
        }
        return 0;
    }

    //=========================================================
    // Mapper setup
    //=========================================================

    detectPRGRAM() {
        // Used only for iNES
    }

    setSubmapper(cartridge) {
        cartridge.submapper = submappers[cartridge.mapper]
                           && submappers[cartridge.mapper][cartridge.submapperId]
                           || cartridge.submapperId.toString();
    }

}
