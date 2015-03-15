CoreBaseConfig = require "../../core/config/base-config"

###########################################################
# Base dependency injection configuration
###########################################################

class BaseConfig extends CoreBaseConfig

    "deviceFactory":      require "../factories/device-factory"
    "rendererFactory":    require "../factories/renderer-factory"
    "audioManager":       require "../managers/audio-manager"
    "cartridgeManager":   require "../managers/cartridge-manager"
    "executionManager":   require "../managers/execution-manager"
    "inputManager":       require "../managers/input-manager"
    "persistenceManager": require "../managers/persistence-manager"
    "videoManager":       require "../managers/video-manager"
    "storage":            require "../storages/local-storage"

module.exports = BaseConfig
