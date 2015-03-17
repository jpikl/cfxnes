var config = require("../../core/config/base-config");

//=========================================================
// Base configuration of emulator frontend
//=========================================================

module.exports = config.merge({

    "deviceFactory":      require("../factories/device-factory"),
    "rendererFactory":    require("../factories/renderer-factory"),
    "audioManager":       require("../managers/audio-manager"),
    "cartridgeManager":   require("../managers/cartridge-manager"),
    "executionManager":   require("../managers/execution-manager"),
    "inputManager":       require("../managers/input-manager"),
    "persistenceManager": require("../managers/persistence-manager"),
    "videoManager":       require("../managers/video-manager"),
    "storage":            require("../storages/local-storage")

});
