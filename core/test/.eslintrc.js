module.exports = {
  env: {
    browser: false,
    node: true,
  },
  rules: {
    'no-invalid-this': 'off', // Mocha uses 'this' to reference test context.
    'no-sparse-arrays': 'off', // Sparse arrays are used in some tests.
    'no-unused-expressions': 'off', // Allow chai asserts without function calls.
  },
};
