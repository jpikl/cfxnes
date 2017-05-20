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

export function setLevel(name) {
  if (!(name in levels)) {
    throw new Error('Invalid log level: ' + toString(name));
  }
  levelName = name;
  level = levels[name];
}

export function getLevel() {
  return levelName;
}

export function info(...args) {
  if (level >= INFO) {
    console.info(...args);
  }
}

export function warn(...args) {
  if (level >= WARN) {
    console.warn(...args);
  }
}

export function error(...args) {
  if (level >= ERROR) {
    console.error(...args);
  }
}
