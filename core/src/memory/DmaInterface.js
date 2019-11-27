import BusComponent from '../common/BusComponent'; // eslint-disable-line no-unused-vars
import ResettableComponent from '../common/ResettableComponent'; // eslint-disable-line no-unused-vars
import TickingComponent from '../common/TickingComponent'; // eslint-disable-line no-unused-vars

/**
 * DMA interface.
 * @interface
 * @extends {BusComponent}
 * @extends {ResettableComponent}
 * @extends {TickingComponent}
 */
export default class DmaInterface {

  /**
   * Starts DMA transfer.
   * @param {number} blockNumber Number (8-bit) of 256 B data block to transfer.
   */
  startTransfer(blockNumber) { // eslint-disable-line no-unused-vars
  }

  /**
   * Returns whether DMA transfer is blocking CPU.
   * @returns {boolean} True if CPU is being blocked, false otherwise.
   */
  isBlockingCpu() {
  }

}
