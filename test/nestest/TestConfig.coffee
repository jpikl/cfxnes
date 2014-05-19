BaseConfig = require "../../src/config/BaseConfig"

class TestConfig extends BaseConfig

    cpu: { module: "../test/nestest/TestCPU",  singleton: true }
    ppu: { module: "../src/debug/FakeUnit",    singleton: true }
    apu: { module: "../src/debug/FakeUnit",    singleton: true }

module.exports = TestConfig
