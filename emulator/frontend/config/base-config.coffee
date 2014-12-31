CoreBaseConfig = require "../../core/config/base-config"

###########################################################
# Base dependency injection configuration
###########################################################

class BaseConfig extends CoreBaseConfig

    "deviceFactory":      "frontend/factories/device-factory"
    "rendererFactory":    "frontend/factories/renderer-factory"
    "audioManager":       "frontend/managers/audio-manager"
    "cartridgeManager":   "frontend/managers/cartridge-manager"
    "executionManager":   "frontend/managers/execution-manager"
    "inputManager":       "frontend/managers/input-manager"
    "persistenceManager": "frontend/managers/persistence-manager"
    "videoManager":       "frontend/managers/video-manager"
    "storage":            "frontend/storages/local-storage"

module.exports = BaseConfig
