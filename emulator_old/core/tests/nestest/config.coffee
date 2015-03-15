BaseConfig = require "../../config/base-config"

class Config extends BaseConfig

    "cpu": "core/tests/nestest/cpu"
    "ppu": "core/debug/fake-unit"
    "apu": "core/debug/fake-unit"

module.exports = Config
