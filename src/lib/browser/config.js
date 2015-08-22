import { DeviceFactory }      from "./factories/device-factory";
import { RendererFactory }    from "./factories/renderer-factory";
import { StorageFactory }     from "./factories/storage-factory";
import { AudioManager }       from "./managers/audio-manager";
import { CartridgeManager }   from "./managers/cartridge-manager";
import { ExecutionManager }   from "./managers/execution-manager";
import { InputManager }       from "./managers/input-manager";
import { PersistenceManager } from "./managers/persistence-manager";
import { VideoManager }       from "./managers/video-manager";
import coreConfig             from "./../core/config";
import { mergeProperties }    from "./../core/utils/objects";

//=========================================================
// Emulator frontend configuration
//=========================================================

export default mergeProperties(coreConfig, {
    "deviceFactory":      {type: "class", value: DeviceFactory},
    "rendererFactory":    {type: "class", value: RendererFactory},
    "storageFactory":     {type: "class", value: StorageFactory},
    "audioManager":       {type: "class", value: AudioManager},
    "cartridgeManager":   {type: "class", value: CartridgeManager},
    "executionManager":   {type: "class", value: ExecutionManager},
    "inputManager":       {type: "class", value: InputManager},
    "persistenceManager": {type: "class", value: PersistenceManager},
    "videoManager":       {type: "class", value: VideoManager},
    "screenfull":         {type: "value", value: null} // Optional external dependency
});
