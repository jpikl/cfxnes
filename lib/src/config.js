// jscs:disable disallowQuotedKeysInObjects

import DeviceFactory from './factories/DeviceFactory';
import RendererFactory from './factories/RendererFactory';
import AudioModule from './modules/AudioModule';
import DataModule from './modules/DataModule';
import InputModule from './modules/InputModule';
import SystemModule from './modules/SystemModule';
import VideoModule from './modules/VideoModule';
import coreConfig from '../../core/src/config';

//=========================================================
// Emulator frontend configuration
//=========================================================

export default Object.assign({}, coreConfig, {
  'deviceFactory': {class: DeviceFactory},
  'rendererFactory': {class: RendererFactory},
  'audioModule': {class: AudioModule},
  'dataModule': {class: DataModule},
  'inputModule': {class: InputModule},
  'systemModule': {class: SystemModule},
  'videoModule': {class: VideoModule},
  'screenfull': {value: null}, // Optional external dependency
});
