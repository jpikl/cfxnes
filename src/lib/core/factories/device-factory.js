import { Joypad } from "../devices/joypad";
import { Zapper } from "../devices/zapper";
import { logger } from "../utils/logger";

var devices = {
    "joypad": Joypad,
    "zapper": Zapper
};

//=========================================================
// Factory for device creation
//=========================================================

export class DeviceFactory {

    constructor(injector) {
        this.injector = injector;
    }

    createDevice(id) {
        var clazz = devices[id];
        if (!clazz) {
            throw new Error(`Unsupported device '${id}'`);
        }
        logger.info(`Creating device '${id}'`);
        return this.injector.inject(new clazz);
    }

}
