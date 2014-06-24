BaseConfig = require "../../src/config/base-config"

class TestConfig extends BaseConfig

    "cpu": { module: "../test/nestest/test-cpu",  singleton: true }
    "ppu": { module: "../src/debug/fake-unit",    singleton: true }
    "apu": { module: "../src/debug/fake-unit",    singleton: true }

module.exports = TestConfig
