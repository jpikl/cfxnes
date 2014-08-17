BaseConfig = require "../../config/base-config"

class TestConfig extends BaseConfig

    "cpu": "core/tests/nestest/test-cpu"
    "ppu": "core/debug/fake-unit"
    "apu": "core/debug/fake-unit"

module.exports = TestConfig
