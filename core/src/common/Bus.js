import ApuInterface from '../audio/ApuInterface'; // eslint-disable-line no-unused-vars
import CpuInterface from '../proc/CpuInterface'; // eslint-disable-line no-unused-vars
import CpuMemoryInterface from '../memory/CpuMemoryInterface'; // eslint-disable-line no-unused-vars
import DmaInterface from '../memory/DmaInterface'; // eslint-disable-line no-unused-vars
import PpuInterface from '../video/PpuInterface'; // eslint-disable-line no-unused-vars
import PpuMemoryInterface from '../memory/PpuMemoryInterface'; // eslint-disable-line no-unused-vars

/**
 * Bus connecting NES components.
 * @interface
 */
export default class Bus {

  /**
   * Returns interface of CPU connected to the bus.
   * @returns {!CpuInterface} CPU interface
   */
  getCpu() {
  }

  /**
   * Returns interface of CPU memory connected to the bus.
   * @returns {!CpuMemoryInterface} CPU memory
   */
  getCpuMemory() {
  }

  /**
   * Returns interface of PPU connected to the bus.
   * @returns {!PpuInterface} PPU interface
   */
  getPpu() {
  }

  /**
   * Returns interface of PPU memory connected to the bus.
   * @returns {!PpuMemoryInterface} PPU memory
   */
  getPpuMemory() {
  }

  /**
   * Returns interface of APU connected to the bus.
   * @returns {!ApuInterface} APU interface
   */
  getApu() {
  }

  /**
   * Returns interface of DMA connected to the bus.
   * @returns {!DmaInterface} DMA interface
   */
  getDma() {
  }

}
