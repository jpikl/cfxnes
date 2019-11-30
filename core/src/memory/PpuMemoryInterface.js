import BusConnected from '../common/BusConnected'; // eslint-disable-line no-unused-vars
import MapperConnected from '../common/MapperConnected'; // eslint-disable-line no-unused-vars
import Resettable from '../common/Resettable'; // eslint-disable-line no-unused-vars

/**
 * PPU memory interface.
 * @interface
 * @extends {BusConnected}
 * @extends {MapperConnected}
 * @extends {Resettable}
 */
export default class PpuMemoryInterface {

  /*
  read() {
  }

  readNametable() {
  }

  readPalette() {
  }

  readPalette(() {
  }

  readPattern() {
  }

  write() {
  }

  TODO move to mapper implementation
  mapPatternsBank() {
  }

  TODO move to mapper implementation
  setNametablesMirroring() {
  }
  */

}
