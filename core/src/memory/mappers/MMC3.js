import {Mirroring} from '../../common';
import {IRQ_EXT} from '../../proc/interrupts';
import Mapper from './Mapper';

/**
 * @extends Mapper
 */
export default class MMC3 extends Mapper {

  //=========================================================
  // Initialization
  //=========================================================

  constructor(mapper) {
    super(mapper);

    // Registers
    this.bankSelect = 0; // Bank selection
    this.irqCounter = 0; // IRQ counter value
    this.irqLatch = 0;   // IRQ counter reload value
    this.irqReload = 0;  // IRQ counter reload flag
    this.irqEnabled = 0; // IRQ counter enable flag
    this.irqDelay = 0;   // Delay before checking A12 rising edge

    // TODO implement detection for normal/alternate behavior
    // Alternate mode flag
    // false = normal (new) behavior (MMC3C and Sharp MMC3B)
    // true = alternate (old) behavior (MMC3A and non-Sharp MMC3B)
    this.alternateMode = false;
  }

  //=========================================================
  // Reset
  //=========================================================

  resetState() {
    this.resetMapping();
    this.resetRegisters();
  }

  resetMapping() {
    this.mapPRGROMBank16K(0, 0);  // Map first 16K PRG RAM bank to $8000
    this.mapPRGROMBank16K(1, -1); // Map last 16K PRG RAM bank to $C000
    this.mapPRGRAMBank8K(0, 0);   // Map 8K PRG RAM to $0000
    this.mapCHRBank8K(0, 0);      // Map first 8K CHR bank to $0000
  }

  resetRegisters() {
    this.bankSelect = 0;
    this.irqCounter = 0;
    this.irqLatch = 0;
    this.irqReload = 0;
    this.irqEnabled = 0;
    this.irqDelay = 0;
  }

  //=========================================================
  // Writing
  //=========================================================

  write(address, value) {
    switch (address & 0xE001) {
      case 0x8000: this.bankSelect = value; break;       // $8000-$9FFE (100X), even address
      case 0x8001: this.writeBankData(value); break;     // $8001-$9FFF (100X), odd  address
      case 0xA000: this.writeMirroring(value); break;    // $A000-$BFFE (101X), even address
      case 0xA001: this.writePRGRAMEnable(value); break; // $A001-$BFFF (101X), odd  address
      case 0xC000: this.irqLatch = value; break;         // $C000-$DFFE (110X), even address
      case 0xC001: this.writeIRQReload(); break;         // $C001-$DFFF (110X), odd  address
      case 0xE000: this.writeIRQEnable(false); break;    // $E000-$FFFE (111X), even address
      case 0xE001: this.writeIRQEnable(true); break;     // $E001-$FFFF (111X), odd  address
    }
  }

  writeBankData(value) {
    switch (this.bankSelect & 7) {
      case 0: // Select 2 KB CHR bank at $0000-$07FF (or $1000-$17FF)
      case 1: // Select 2 KB CHR bank at $0800-$0FFF (or $1800-$1FFF)
        this.switchDoubleCHRROMBanks(value);
        break;

      case 2: // Select 1 KB CHR bank at $1000-$13FF (or $0000-$03FF)
      case 3: // Select 1 KB CHR bank at $1400-$17FF (or $0400-$07FF)
      case 4: // Select 1 KB CHR bank at $1800-$1BFF (or $0800-$0BFF)
      case 5: // Select 1 KB CHR bank at $1C00-$1FFF (or $0C00-$0FFF)
        this.switchSingleCHRROMBanks(value);
        break;

      case 6: // Select 8 KB PRG ROM bank at $8000-$9FFF (or $C000-$DFFF)
        this.switchPRGROMBanks0And2(value);
        break;

      case 7: // Select 8 KB PRG ROM bank at $A000-$BFFF
        this.switchPRGROMBank1(value);
        break;
    }
  }

  writeMirroring(value) {
    if (this.mirroring !== Mirroring.FOUR_SCREEN) {
      this.switchMirroring(value);
    }
  }

  writePRGRAMEnable(value) {
    this.canReadPRGRAM = (value & 0x80) === 0x80; // Chip must be enabled (bit 7 on)
    this.canWritePRGRAM = (value & 0xC0) === 0x80; // Chip must be enabled (bit 7 on) and writes allowed (bit 6 off)
  }

  writeIRQReload() {
    if (this.alternateMode) {
      this.irqReload = true;
    }
    this.irqCounter = 0;
  }

  writeIRQEnable(enabled) {
    this.irqEnabled = enabled;
    if (!enabled) {
      this.cpu.clearInterrupt(IRQ_EXT); // Disabling IRQ clears IRQ flag
    }
  }

  //=========================================================
  // Bank switching
  //=========================================================

  switchDoubleCHRROMBanks(target) {
    const source = ((this.bankSelect & 0x80) >>> 6) | (this.bankSelect & 0x01); // S[1,0] = C[7,0]
    this.mapCHRBank2K(source, target >>> 1);
  }

  switchSingleCHRROMBanks(target) {
    const source = ((~this.bankSelect & 0x80) >>> 5) | ((this.bankSelect - 2) & 0x03); // S[2,1,0] = (C-2)[!7,1,0]
    this.mapCHRBank1K(source, target);
  }

  switchPRGROMBanks0And2(target) {
    const sourceA = (this.bankSelect & 0x40) >>> 5;  // SA[1] = C[6]
    const sourceB = (~this.bankSelect & 0x40) >>> 5; // SB[1] = C[!6]
    this.mapPRGROMBank8K(sourceA, target); // Map selected bank
    this.mapPRGROMBank8K(sourceB, -2);     // Map second last bank
  }

  switchPRGROMBank1(target) {
    this.mapPRGROMBank8K(1, target);
  }

  switchMirroring(value) {
    if (value & 1) {
      this.setHorizontalMirroring();
    } else {
      this.setVerticalMirroring();
    }
  }

  //=========================================================
  // IRQ generation
  //=========================================================

  // Mapper watches changes on PPU address bus bit 12 (A12).
  // Each time raising edge on A12 is detected, IRQ counter is updated.
  // The rising edge is detected after A12 stays low for some time.
  //
  // A12  ____      _____  1
  //          |    |
  //          |____|       0
  //
  //               ^
  //             rising
  //              edge
  //
  // IRQ counter update:
  // - When the counter reaches zero or reload flag is set, the counter is reloaded from latch.
  //   Otherwise the counter value is decremented.
  // - When the counter is reloaded the reload flag is also cleared.
  //
  // IRQ generation:
  // - Normal behavior    - checks whether IRQ is enabled and the counter is zero
  // - Alternate behavior - additionally checks that the counter was set to zero either by decrease or reload

  tick() {
    if (this.ppu.addressBus & 0x1000) {
      if (!this.irqDelay) {
        this.updateIRQCounter();
      }
      this.irqDelay = 7;
    } else if (this.irqDelay) {
      this.irqDelay--;
    }
  }

  updateIRQCounter() {
    const irqCounterOld = this.irqCounter;
    if (!this.irqCounter || this.irqReload) {
      this.irqCounter = this.irqLatch;
    } else {
      this.irqCounter--;
    }
    if (this.irqEnabled && !this.irqCounter && (!this.alternateMode || irqCounterOld || this.irqReload)) {
      this.cpu.activateInterrupt(IRQ_EXT);
    }
    this.irqReload = false;
  }

}
