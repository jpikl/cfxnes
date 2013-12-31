BaseConfig = require "../../src/config/BaseConfig"

class TestConfig extends BaseConfig

    "cpu": { module: "../test/nestest/TestCPU", singleton: true }

module.exports = TestConfig
