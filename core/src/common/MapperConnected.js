import {MapperInterface} from '../memory';

/**
 * NES component that can be connected to bus.
 * @interface
 */
export default class MapperConnected {

  /**
   * Connects component to memory mapper.
   * @param {!MapperInterface} mapper Memory mapper.
   */
  connectToMapper(mapper) { // eslint-disable-line no-unused-vars
  }

  /**
   * Disconnects component from memory mapper.
   */
  disconnectFromMapper() {
  }

}
