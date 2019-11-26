import Bus from './Bus'; // eslint-disable-line no-unused-vars

/**
 * NES component that can be connected to bus.
 * @interface
 */
export default class BusComponent {

  /**
   * Connects component to bus.
   * @param {Bus} bus
   */
  connect(bus) { // eslint-disable-line no-unused-vars
  }

  /**
   * Disconnects component from bus.
   */
  disconnect() {
  }

}
