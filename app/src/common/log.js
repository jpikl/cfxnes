/* global console */

import {OFF, values as levels} from './logLevels';

const noop = () => {};

export class Log {

  constructor(output) {
    this.methods = levels.map(level => output[level].bind(output));
    this.setLevel(OFF);
  }

  setLevel(level) {
    this.level = level;
    for (let i = 0; i < levels.length; i++) {
      const enabled = levels.indexOf(level, i) >= i;
      this[levels[i]] = enabled ? this.methods[i] : noop;
    }
  }

  getLevel() {
    return this.level;
  }

}

export default new Log(console);
