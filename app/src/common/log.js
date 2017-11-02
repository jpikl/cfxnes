/* global console */

import {OFF, ERROR, WARN, INFO} from './logLevels';

const methods = [ERROR, WARN, INFO];
const noop = () => {};

export class Log {

  constructor(output) {
    this.output = output;
    this.setLevel(OFF);
  }

  setLevel(level) {
    this.level = level;
    const {output} = this;
    for (let i = 0; i < methods.length; i++) {
      const method = methods[i];
      const enabled = methods.indexOf(level, i) >= i;
      this[method] = enabled ? output[method].bind(output) : noop;
    }
  }

  getLevel() {
    return this.level;
  }

}

export default new Log(console);
