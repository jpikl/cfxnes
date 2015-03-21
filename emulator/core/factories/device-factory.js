var Joypad = require("../devices/joypad");
var Zapper = require("../devices/zapper");
var logger = require("../utils/logger").get();

//=========================================================
// Factory for device creation
//=========================================================

class DeviceFactory {

    constructor(injector) {
        this.injector = injector;
        this.devices = {
            "joypad": Joypad,
            "zapper": Zapper
        };
    }

    createDevice(id) {
        var clazz = this.devices[id];
        if (!clazz) {
            throw new Error(`Unsupported device '${id}'`);
        }
        logger.info(`Creating device '${id}'`);
        return this.injector.inject(new clazz);
    }

}

module.exports = DeviceFactory;
