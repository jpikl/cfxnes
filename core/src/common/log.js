/* global console */

import {describe} from './utils';
import {OFF, ERROR, WARN, INFO} from './logLevels';

const OFF_PRIORITY = 0;
const ERROR_PRIORITY = 1;
const WARN_PRIORITY = 2;
const INFO_PRIORITY = 3;

const priorities = {
  [OFF]: OFF_PRIORITY,
  [ERROR]: ERROR_PRIORITY,
  [WARN]: WARN_PRIORITY,
  [INFO]: INFO_PRIORITY,
};

export class Log {

  constructor(output) {
    this.output = output;
    this.priority = OFF_PRIORITY;
    this.level = OFF;
  }

  setLevel(level) {
    const priority = priorities[level];
    if (priority == null) {
      throw new Error('Invalid log level: ' + describe(level));
    }
    this.priority = priority;
    this.level = level;
  }

  getLevel() {
    return this.level;
  }

  error(message, error = undefined) {
    if (this.priority >= ERROR_PRIORITY) {
      this.output[ERROR](message, error);
    }
  }

  warn(message) {
    if (this.priority >= WARN_PRIORITY) {
      this.output[WARN](message);
    }
  }

  info(message) {
    if (this.priority >= INFO_PRIORITY) {
      this.output[INFO](message);
    }
  }

}

export default new Log(console);
