import describe from './describe';
import LogLevel from './LogLevel';

const OFF_PRIORITY = 0;
const ERROR_PRIORITY = 1;
const WARN_PRIORITY = 2;
const INFO_PRIORITY = 3;

/**
 * Priority for each level of logging.
 * @type {!Object<LogLevel, number>}
 */
const priorities = {
  [LogLevel.OFF]: OFF_PRIORITY,
  [LogLevel.ERROR]: ERROR_PRIORITY,
  [LogLevel.WARN]: WARN_PRIORITY,
  [LogLevel.INFO]: INFO_PRIORITY,
};

/**
 * Log that writes to a specified output.
 */
export default class Log {

  /**
   * Constructor.
   * @param {!Object} output Console-like object to write log to.
   */
  constructor(output) {
    /**
     * Console-like object to write log to.
     * @private
     * @const
     * @type {!Object}
     */
    this.output = output;

    /**
     * Level of logging.
     * @private
     * @type {LogLevel}
     */
    this.level = LogLevel.OFF;

    /**
     * Priority for level of logging
     * @private
     * @type {number}
     */
    this.priority = OFF_PRIORITY;
  }

  /**
   * Sets level of logging.
   * @param {LogLevel} level Level of logging.
   */
  setLevel(level) {
    const priority = priorities[level];
    if (priority == null) {
      throw new Error('Invalid log level: ' + describe(level));
    }
    this.level = level;
    this.priority = priority;
  }

  /**
   * Returns level of logging.
   * @return {LogLevel} Level of logging.
   */
  getLevel() {
    return this.level;
  }

  /**
   * Writes error message.
   * @param {string} message Message text.
   * @param {!Error=} error Error associated with the message.
   */
  error(message, error) {
    if (this.priority >= ERROR_PRIORITY) {
      this.output['error'](message, error);
    }
  }

  /**
   * Writes warn message.
   * @param {string} message Message text.
   */
  warn(message) {
    if (this.priority >= WARN_PRIORITY) {
      this.output['warn'](message);
    }
  }

  /**
   * Writes info message.
   * @param {string} message Message text.
   */
  info(message) {
    if (this.priority >= INFO_PRIORITY) {
      this.output['info'](message);
    }
  }

}
