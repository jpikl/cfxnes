import {ApuInterface} from '../audio';
import {CpuInterface} from '../proc';
import {CpuMemoryInterface, DmaInterface, PpuMemoryInterface} from '../memory';
import {PpuInterface} from '../video';

/**
 * Bus connecting NES components.
 * @interface
 */
export default class Bus {

  /**
   * Returns interface of CPU connected to the bus.
   * @return {!CpuInterface} CPU interface.
   */
  getCpu() {
  }

  /**
   * Returns interface of CPU memory connected to the bus.
   * @return {!CpuMemoryInterface} CPU memory.
   */
  getCpuMemory() {
  }

  /**
   * Returns interface of PPU connected to the bus.
   * @return {!PpuInterface} PPU interface.
   */
  getPpu() {
  }

  /**
   * Returns interface of PPU memory connected to the bus.
   * @return {!PpuMemoryInterface} PPU memory.
   */
  getPpuMemory() {
  }

  /**
   * Returns interface of APU connected to the bus.
   * @return {!ApuInterface} APU interface.
   */
  getApu() {
  }

  /**
   * Returns interface of DMA connected to the bus.
   * @return {!DmaInterface} DMA interface.
   */
  getDma() {
  }

}
