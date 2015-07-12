import { DeviceFactory }      from "../factories/device-factory";
import { RendererFactory }    from "../factories/renderer-factory";
import { AudioManager }       from "../managers/audio-manager";
import { CartridgeManager }   from "../managers/cartridge-manager";
import { ExecutionManager }   from "../managers/execution-manager";
import { InputManager }       from "../managers/input-manager";
import { PersistenceManager } from "../managers/persistence-manager";
import { VideoManager }       from "../managers/video-manager";
import { LocalStorage }       from "../storages/local-storage";
import baseConfig             from  "../../core/config/base-config";
import { mergeProperties }    from  "../../core/utils/objects";

//=========================================================
// Base configuration of emulator frontend
//=========================================================

export default mergeProperties(baseConfig, {
    "deviceFactory":      {type: "class", value: DeviceFactory},
    "rendererFactory":    {type: "class", value: RendererFactory},
    "audioManager":       {type: "class", value: AudioManager},
    "cartridgeManager":   {type: "class", value: CartridgeManager},
    "executionManager":   {type: "class", value: ExecutionManager},
    "inputManager":       {type: "class", value: InputManager},
    "persistenceManager": {type: "class", value: PersistenceManager},
    "videoManager":       {type: "class", value: VideoManager},
    "storage":            {type: "class", value: LocalStorage},
    "screenfull":         {type: "proxy"}
});
