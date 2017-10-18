/* eslint-disable no-console */

import {development} from './env';
import {noop} from './utils';

const methods = {};

for (const level of ['error', 'warn', 'info']) {
  methods[level] = development ? console[level].bind(console) : noop;
}

export default methods;
