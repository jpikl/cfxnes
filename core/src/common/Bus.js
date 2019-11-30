import {ApuInterface} from '../audio'; // eslint-disable-line no-unused-vars
import {CpuInterface} from '../proc'; // eslint-disable-line no-unused-vars
import {CpuMemoryInterface, DmaInterface, PpuMemoryInterface} from '../memory'; // eslint-disable-line no-unused-vars
import {PpuInterface} from '../video'; // eslint-disable-line no-unused-vars

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
