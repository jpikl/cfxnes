import path from 'path';

export function resolvePath(...args) {
  if (__filename === 'index.js') {
    return path.resolve(__dirname, ...args); // When bundled by rollup
  }
  return path.resolve(__dirname, '..', ...args);
}
