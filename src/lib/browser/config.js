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
import coreConfig from './../core/config';
import { mergeProperties } from './../core/utils/objects';

//=========================================================
// Emulator frontend configuration
//=========================================================

export default mergeProperties(coreConfig, {
  'deviceFactory': {type: 'class', value: DeviceFactory},
  'rendererFactory': {type: 'class', value: RendererFactory},
  'storageFactory': {type: 'class', value: StorageFactory},
  'audioManager': {type: 'class', value: AudioManager},
  'cartridgeManager': {type: 'class', value: CartridgeManager},
  'executionManager': {type: 'class', value: ExecutionManager},
  'inputManager': {type: 'class', value: InputManager},
  'persistenceManager': {type: 'class', value: PersistenceManager},
  'videoManager': {type: 'class', value: VideoManager},
  'screenfull': {type: 'value', value: null}, // Optional external dependency
});
