/* eslint-disable no-console */

export const LogLevel = {
  OFF: 1,
  ERROR: 2,
  WARN: 3,
  INFO: 4,
};

let level = LogLevel.WARN;

function setLevel(value) {
  level = value;
}

function info(message) {
  if (level >= LogLevel.INFO) {
    console.info(message);
  }
}

function warn(message) {
  if (level >= LogLevel.WARN) {
    console.warn(message);
  }
}

function error(...args) {
  if (level >= LogLevel.ERROR) {
    console.error(...args);
  }
}

export default {setLevel, info, warn, error};
