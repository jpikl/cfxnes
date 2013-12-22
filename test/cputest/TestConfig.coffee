BaseConfig = require "../../src/config/BaseConfig"

class TestConfig extends BaseConfig

    cpu: { module: "test/cputest/TestCPU", singleton: true }

module.exports = TestConfig
