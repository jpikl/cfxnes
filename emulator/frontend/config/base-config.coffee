CoreBaseConfig = require "../../core/config/base-config"

###########################################################
# Base dependency injection configuration
###########################################################

class BaseConfig extends CoreBaseConfig

    "inputManager":  "frontend/managers/input-manager"
    "screenManager": "frontend/managers/screen-manager"
    "deviceFactory": "frontend/factories/device-factory"

module.exports = BaseConfig
