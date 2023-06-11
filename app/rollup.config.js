const nodeResolve = require('rollup-plugin-node-resolve');

module.exports = {
  input: process.env.INPUT || 'src/server/index.js',
  output: {
    file: process.env.OUTPUT || 'dist/node/index.js',
    format: 'cjs',
  },
  external: [
    'fs',
    'http',
    'path',
    'express',
    'express-history-api-fallback',
    'compression',
  ],
  plugins: [nodeResolve({jsnext: true})],
};
