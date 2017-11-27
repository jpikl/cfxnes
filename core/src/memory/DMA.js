import {log} from '../common';

const TOTAL_DMA_CYCLES = 512;

export default class DMA {

  constructor() {
    log.info('Initializing DMA');
    this.cycle = 0; // DMA cycle counter
    this.baseAddress = 0; // Base of DMA source address
    this.cpuMemory = null;
  }

  connect(nes) {
    log.info('Connecting DMA');
    this.cpuMemory = nes.cpuMemory;
  }

  reset() {
    log.info('Resetting DMA');
    this.cycle = TOTAL_DMA_CYCLES;
  }

  writeAddress(address) {
    this.cycle = 0;
    this.baseAddress = address << 8; // Source address multiplied by 0x100
  }

  tick() {
    if (this.isBlockingCPU()) {
      this.cycle++;
      if (this.cycle & 1) {
        this.transferData(); // Each even cycle
      }
    }
  }

  isBlockingCPU() {
    return this.cycle < TOTAL_DMA_CYCLES;
  }

  transferData() {
    const address = this.baseAddress + (this.cycle >> 1);
    const data = this.cpuMemory.read(address);
    this.cpuMemory.write(0x2004, data);
  }

}
