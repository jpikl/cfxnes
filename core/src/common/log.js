/* global console */

import {describe} from './utils';
import {OFF, ERROR, WARN, INFO} from './logLevels';

// Priorities for each log level.
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

/**
 * Logging utility.
 */
export class Log {

  /**
   * Constructor
   *
   * @param {!Object} output Output interface with error, warn and info methods.
   */
  constructor(output) {
    this.output = output;
    this.priority = OFF_PRIORITY;
    this.level = OFF;
  }

  /**
   * Sets level of logging.
   *
   * @param {string} level Log level.
   */
  setLevel(level) {
    const priority = priorities[level];
    if (priority == null) {
      throw new Error('Invalid log level: ' + describe(level));
    }
    this.priority = priority;
    this.level = level;
  }

  /**
   * Returns the current level of logging.
   *
   * @returns {string} Log level.
   */
  getLevel() {
    return this.level;
  }

  /**
   * Logs an error message.
   * Level must be at least 'error' for the message to be logged.
   *
   * @param {string} message Message to log.
   * @param {Error=} error Optional error to log.
   */
  error(message, error) {
    if (this.priority >= ERROR_PRIORITY) {
      this.output[ERROR](message, error);
    }
  }

  /**
   * Logs a warning message.
   * Level must be at least 'warn' for the message to be logged.
   *
   * @param {string} message Message to log.
   */
  warn(message) {
    if (this.priority >= WARN_PRIORITY) {
      this.output[WARN](message);
    }
  }

  /**
   * Logs an information message.
   * Level must be at least 'info' for the message to be logged.
   *
   * @param {string} message Message to log.
   */
  info(message) {
    if (this.priority >= INFO_PRIORITY) {
      this.output[INFO](message);
    }
  }

}

// Default log connected to the console object.
export default new Log(console);
