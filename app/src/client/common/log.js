/* eslint-disable no-console */

const levels = ['error', 'warn', 'info'];
const methods = {};

for (let i = 0; i < levels.length; i++) {
  const level = levels[i];
  const enabled = levels.indexOf(__LOG_LEVEL__, i) >= i;
  methods[level] = enabled ? console[level].bind(console) : () => {};
}

export default methods;
