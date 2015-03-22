import { DeviceFactory } from "../factories/device-factory";
import { RendererFactory } from "../factories/renderer-factory";
import { AudioManager } from "../managers/audio-manager";
import { CartridgeManager } from "../managers/cartridge-manager";
import { ExecutionManager } from "../managers/execution-manager";
import { InputManager } from "../managers/input-manager";
import { PersistenceManager } from "../managers/persistence-manager";
import { VideoManager } from "../managers/video-manager";
import { LocalStorage } from "../storages/local-storage";
import config from  "../../core/config/base-config";

//=========================================================
// Base configuration of emulator frontend
//=========================================================

export default config.merge({

    "deviceFactory":      DeviceFactory,
    "rendererFactory":    RendererFactory,
    "audioManager":       AudioManager,
    "cartridgeManager":   CartridgeManager,
    "executionManager":   ExecutionManager,
    "inputManager":       InputManager,
    "persistenceManager": PersistenceManager,
    "videoManager":       VideoManager,
    "storage":            LocalStorage

});
