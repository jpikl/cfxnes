import log from '../log';

const TOTAL_DMA_CYCLES = 0x200; // Total 512 CPU cycles for DMA transfer

//=========================================================
// Direct memory access
//=========================================================

export default class DMA {

  connect(nes) {
    this.cpuMemory = nes.cpuMemory;
  }

  reset() {
    log.info('Reseting DMA');
    this.cycle = TOTAL_DMA_CYCLES;
  }

  writeAddress(address) {
    this.cycle = 0;
    this.baseAddress = address << 8; // Source memory address (multiplied by 0x100)
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
