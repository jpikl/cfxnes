import {log} from '../common';
import Bus from '../common/Bus'; // eslint-disable-line no-unused-vars
import DmaInterface from './DmaInterface'; // eslint-disable-line no-unused-vars

const TOTAL_DMA_CYCLES = 512;

/**
 * @implements {DmaInterface}
 */
export default class Dma {

  constructor() {
    log.info('Initializing DMA');
    this.cycle = 0; // DMA cycle counter
    this.baseAddress = 0; // Base of DMA source address
    this.cpuMemory = null;
  }

  /**
   * Connects DMA to bus.
   * @param {!Bus} bus Bus.
   * @override
   */
  connect(bus) {
    log.info('Connecting DMA');
    this.cpuMemory = bus.getCpuMemory();
  }

  /**
   * Disconnects DMA from bus.
   * @override
   */
  disconnect() {
    log.info('Disconnecting DMA');
    this.cpuMemory = null;
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
    if (this.isBlockingCpu()) {
      this.cycle++;
      if (this.cycle & 1) {
        this.transferData(); // Each even cycle
      }
    }
  }

  isBlockingCpu() {
    return this.cycle < TOTAL_DMA_CYCLES;
  }

  transferData() {
    const address = this.baseAddress + (this.cycle >> 1);
    const data = this.cpuMemory.read(address);
    this.cpuMemory.write(0x2004, data);
  }

}
