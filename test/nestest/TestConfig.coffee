BaseConfig = require "../../src/config/BaseConfig"

class TestConfig extends BaseConfig

    "cpu": { module: "../test/nestest/TestCPU",  singleton: true }
    "ppu": { module: "../test/nestest/FakeUnit", singleton: true }
    "apu": { module: "../test/nestest/FakeUnit", singleton: true }

module.exports = TestConfig
