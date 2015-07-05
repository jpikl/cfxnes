import { Gamepad }           from "../devices/gamepad";
import { Keyboard }          from "../devices/keyboard";
import { Mouse }             from "../devices/mouse";
import { JoypadAdapter }     from "../devices/adapters/joypad-adapter";
import { ZapperAdapter }     from "../devices/adapters/zapper-adapter";
import { Joypad }            from "../../core/devices/joypad";
import { Zapper }            from "../../core/devices/zapper";
import { DeviceFactory as
         CoreDeviceFactory } from "../../core/factories/device-factory";

const sourceDevices = {
    "gamepad":  Gamepad,
    "keyboard": Keyboard,
    "mouse":    Mouse
};

const targetDevices = {
    "joypad": JoypadAdapter,
    "zapper": ZapperAdapter
};

//=========================================================
// Factory for device creation
//=========================================================

export class DeviceFactory extends CoreDeviceFactory {

    constructor(injector) {
        super(injector);
    }

    createSourceDevice(id) {
        var clazz = sourceDevices[id];
        if (!clazz) {
            throw new Error(`Unsupported source device '${id}'`);
        }
        return this.injector.inject(new clazz(id));
    }

    createTargetDevice(id) {
        var device = this.createDevice(id);
        var clazz = targetDevices[id];
        if (!clazz) {
            throw new Error(`Unsupported target device '${id}'`);
        }
        return this.injector.inject(new clazz(device));
    }

}
