import Bus from './Bus';

/**
 * NES component that can be connected to bus.
 * @interface
 */
export default class BusConnected {

  /**
   * Connects component to bus.
   * @param {!Bus} bus Bus.
   */
  connectToBus(bus) { // eslint-disable-line no-unused-vars
  }

  /**
   * Disconnects component from bus.
   */
  disconnectFromBus() {
  }

}
