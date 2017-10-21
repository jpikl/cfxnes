/* global console */

import {toString} from './utils';
import logLevels, {OFF} from './logLevels';

const methodNames = logLevels.filter(level => level !== OFF);
const noop = () => {};

export class Log {

  constructor(output) {
    this.methods = methodNames.map(name => output[name].bind(output));
    this.setLevel(OFF);
  }

  setLevel(level) {
    if (logLevels.indexOf(level) < 0) {
      throw new Error('Invalid log level: ' + toString(level));
    }
    this.level = level;
    for (let i = 0; i < methodNames.length; i++) {
      const enabled = methodNames.indexOf(level, i) >= i;
      this[methodNames[i]] = enabled ? this.methods[i] : noop;
    }
  }

  getLevel() {
    return this.level;
  }

}

export default new Log(console);
