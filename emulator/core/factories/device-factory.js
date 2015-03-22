import { Joypad } from "../devices/joypad";
import { Zapper } from "../devices/zapper";
import { logger } from "../utils/logger";

//=========================================================
// Factory for device creation
//=========================================================

export class DeviceFactory {

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
