import {Bus, log} from '../common'; // eslint-disable-line no-unused-vars
import DmaInterface from './DmaInterface'; // eslint-disable-line no-unused-vars
import CpuMemoryInterface from './CpuMemoryInterface'; // eslint-disable-line no-unused-vars

// Total number of DMA cycles
const TOTAL_CYCLES = 512;

/**
 * Circuit that executes data transfer of 256 bytes from CPU memory to PPU OAM (Object Attribute Memory).
 * Transfer is done in 512 CPU cycles where 1 byte is transferred every even cycle.
 * The base source address is a multiple of 256 and it is initialized at the start of transfer.
 * The the desintation address is 0x2004 which is mapped to PPU OMADATA register.
 * @implements {DmaInterface}
 */
export default class Dma {

  /**
   * Constructor.
   */
  constructor() {
    log.info('Initializing DMA');

    /**
     * Remaining cycles of DMA transfer.
     * @private {number}
     */
    this.cyclesLeft = 0;

    /**
     * Base source address from which data are copied.
     * @private {number}
     */
    this.baseAddress = 0;

    /**
     * CPU memory interface.
     * @type {CpuMemoryInterface}
     */
    this.cpuMemory = null;
  }

  /**
   * Connects DMA to bus.
   * @param {!Bus} bus Bus.
   * @override
   */
  connectToBus(bus) {
    log.info('Connecting DMA to bus');
    this.cpuMemory = bus.getCpuMemory();
  }

  /**
   * Disconnects DMA from bus.
   * @override
   */
  disconnectFromBus() {
    log.info('Disconnecting DMA from bus');
    this.cpuMemory = null;
  }

  /**
   * Resets DMA state.
   * @override
   */
  reset() {
    log.info('Resetting DMA');
    this.cyclesLeft = 0;
  }

  /**
   * Starts DMA transfer.
   * @param {number} blockNumber Number (8-bit) of 256 B data block to transfer.
   * @override
   */
  startTransfer(blockNumber) {
    this.cyclesLeft = TOTAL_CYCLES;
    this.baseAddress = blockNumber << 8; // Multiplied by block size (256)
  }

  /**
   * Executes DMA cycle.
   * @override
   */
  tick() {
    if (this.cyclesLeft) {
      this.cyclesLeft--;
      if (this.cyclesLeft & 1) {
        this.transferValue(); // Each even cycle
      }
    }
  }

  /**
   * Transfer 1 byte of data from CPU memory to PPU OAMDATA.
   * @private
   */
  transferValue() {
    const offset = (TOTAL_CYCLES - this.cyclesLeft) >> 1; // Ignore the least significant bit, transfer is done every even cycle.
    const address = this.baseAddress + offset;
    const data = this.cpuMemory.read(address);
    this.cpuMemory.write(0x2004, data);
  }

  /**
   * Returns whether DMA transfer is blocking CPU.
   * @returns {boolean} True if CPU is being blocked, false otherwise.
   * @override
   */
  isBlockingCpu() {
    return this.cyclesLeft > 0;
  }

}
