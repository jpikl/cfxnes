module.exports = {
  parserOptions: {
    sourceType: 'module',
  },
  env: {
    browser: true,
    node: false,
    mocha: true,
  },
  globals: {
    chai: true, // Provided globally through karma-chai plugin
    expect: true, // Provided globally through karma-chai plugin
  },
  rules: {
    'no-invalid-this': 'off', // Mocha uses 'this' to reference test context.
    'no-sparse-arrays': 'off', // Sparse arrays are use in some tests.
    'no-unused-expressions': 'off', // Allow chai asserts without function calls.
  },
};
