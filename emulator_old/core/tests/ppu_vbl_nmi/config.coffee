BaseConfig = require "../../config/base-config"

class Config extends BaseConfig

    "ppu": "core/debug/debug-ppu"
    "apu": "core/debug/fake-unit"

module.exports = Config
