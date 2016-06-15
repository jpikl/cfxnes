/* eslint-disable no-console */

const OFF = 0;
const ERROR = 1;
const WARN = 2;
const INFO = 3;

const levels = {
  'off': OFF,
  'error': ERROR,
  'warn': WARN,
  'info': INFO,
};

let level = WARN;

function setLevel(name) {
  level = levels[name] || OFF;
}

function info(...args) {
  if (level >= INFO) {
    console.info(...args);
  }
}

function warn(...args) {
  if (level >= WARN) {
    console.warn(...args);
  }
}

function error(...args) {
  if (level >= ERROR) {
    console.error(...args);
  }
}

export default {setLevel, info, warn, error};
