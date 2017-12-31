module.exports = {
  env: {
    // The core should not generally depend on any browser or node API.
    // There are some exceptions:
    // - Functions that are only used in tests.
    // - Functions that have specific implementation for both
    //   browser and node environment.
    browser: false,
    node: false,
  },
};
