CoreBaseConfig = require "../../core/config/base-config"

###########################################################
# Base dependency injection configuration
###########################################################

class BaseConfig extends CoreBaseConfig

    "storage":          "frontend/storages/local-storage"
    "cartridgeManager": "frontend/managers/cartridge-manager"
    "configManager":    "frontend/managers/config-manager"
    "inputManager":     "frontend/managers/input-manager"
    "screenManager":    "frontend/managers/screen-manager"
    "deviceFactory":    "frontend/factories/device-factory"
    "rendererFactory":  "frontend/factories/renderer-factory"

module.exports = BaseConfig
