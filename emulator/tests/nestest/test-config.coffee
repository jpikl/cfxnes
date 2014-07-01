BaseConfig = require "../config/base-config"

class TestConfig extends BaseConfig

    "cpu": { module: "test/nestest/test-cpu", singleton: true }
    "ppu": { module: "debug/fake-unit",       singleton: true }
    "apu": { module: "debug/fake-unit",       singleton: true }

module.exports = TestConfig
