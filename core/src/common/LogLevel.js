/**
 * Level of logging.
 * @enum {string}
 */
const LogLevel = {
  /** Do not log anything. */
  OFF: 'off',
  /** Log errors. */
  ERROR: 'error',
  /** Log errors and warnings. */
  WARN: 'warn',
  /** Log errors, warnings and info messages */
  INFO: 'info',
};

export default LogLevel;
