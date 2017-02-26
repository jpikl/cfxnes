/* eslint-disable no-console */

import {toString} from './utils';

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

let level, levelName;

setLevel('warn');

function setLevel(name) {
  if (!(name in levels)) {
    throw new Error('Invalid log level: ' + toString(name));
  }
  levelName = name;
  level = levels[name];
}

function getLevel() {
  return levelName;
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

export default {setLevel, getLevel, info, warn, error};
