/* global require */

import {log} from '../common';
import create from './create';

export default function readCartridge(path) {
  log.info(`Reading ROM image from file "${path}"`);
  const data = require('fs').readFileSync(path);
  return create(new Uint8Array(data));
}
