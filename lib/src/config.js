// jscs:disable disallowQuotedKeysInObjects

import DeviceFactory from './factories/DeviceFactory';
import RendererFactory from './factories/RendererFactory';
import StorageFactory from './factories/StorageFactory';
import AudioManager from './managers/AudioManager';
import CartridgeManager from './managers/CartridgeManager';
import ExecutionManager from './managers/ExecutionManager';
import InputManager from './managers/InputManager';
import PersistenceManager from './managers/PersistenceManager';
import VideoManager from './managers/VideoManager';
import coreConfig from '../../core/src/config';
import { mergeProperties } from '../../core/src/utils/objects';

//=========================================================
// Emulator frontend configuration
//=========================================================

export default mergeProperties(coreConfig, {
  'deviceFactory': {class: DeviceFactory},
  'rendererFactory': {class: RendererFactory},
  'storageFactory': {class: StorageFactory},
  'audioManager': {class: AudioManager},
  'cartridgeManager': {class: CartridgeManager},
  'executionManager': {class: ExecutionManager},
  'inputManager': {class: InputManager},
  'persistenceManager': {class: PersistenceManager},
  'videoManager': {class: VideoManager},
  'screenfull': {value: null}, // Optional external dependency
});
