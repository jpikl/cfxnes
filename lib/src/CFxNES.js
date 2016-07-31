import NES from '../../core/src/NES';
import log from '../../core/src/common/log';
import Audio from './audio/Audio';
import ROMLoader from './data/ROMLoader';
import NVRAM from './data/NVRAM';
import Options from './data/Options';
import Sources from './input/Sources';
import Devices from './input/Devices';
import InputMapper from './input/InputMapper';
import InputRouter from './input/InputRouter';
import System from './system/System';
import Video from './video/Video';
import {isRendererSupported} from './video/renderers';

export default class CFxNES {

  constructor(params = {}) {
    const JSZip = params['JSZip'] || window['JSZip'];
    const nes = new NES;
    const video = new Video(nes);
    const audio = new Audio(nes);
    const devices = new Devices(nes);
    const inputMapper = new InputMapper;
    const inputRouter = new InputRouter(inputMapper, devices, video);
    const sources = new Sources(inputRouter);
    const system = new System(nes, video, audio, sources);
    const romLoader = new ROMLoader(nes, system, JSZip);
    const nvram = new NVRAM(nes);
    const options = Options.of(system, video, audio, devices, inputMapper);

    options.set(params);
    video.setOutput(params['videoOutput']);

    Object.assign(this, {system, video, audio, devices, inputMapper, romLoader, nvram, options});
  }

  //=========================================================
  // System API
  //=========================================================

  ['start']() {
    this.system.start();
  }

  ['stop']() {
    this.system.stop();
  }

  ['step']() {
    this.system.step();
  }

  ['isRunning']() {
    return this.system.isRunning();
  }

  ['hardReset']() {
    this.system.hardReset();
  }

  ['softReset']() {
    this.system.softReset();
  }

  ['setSpeed'](speed) {
    this.system.setSpeed(speed);
  }

  ['getSpeed']() {
    return this.system.getSpeed();
  }

  ['setRegion'](region) {
    this.system.setRegion(region);
  }

  ['getRegion']() {
    return this.system.getRegion();
  }

  ['getFPS']() {
    return this.system.getFPS();
  }

  //=========================================================
  // Data API
  //=========================================================

  ['loadROM'](source) {
    return this.romLoader.load(source);
  }

  ['unloadROM']() {
    this.romLoader.unload();
  }

  ['isROMLoaded']() {
    return this.romLoader.isLoaded();
  }

  ['getNVRAMSize']() {
    return this.nvram.size();
  }

  ['getNVRAM']() {
    return this.nvram.get();
  }

  ['setNVRAM'](data) {
    this.nvram.set(data);
  }

  ['loadNVRAM']() {
    return this.nvram.load();
  }

  ['saveNVRAM']() {
    return this.nvram.save();
  }

  ['deleteNVRAMs']() {
    return this.nvram.delete();
  }

  ['getOptions']() {
    return this.options.get();
  }

  ['setOptions'](options) {
    this.options.set(options);
  }

  ['resetOptions'](...names) {
    this.options.reset(...names);
  }

  ['loadOptions']() {
    this.options.load();
  }

  ['saveOptions']() {
    this.options.save();
  }

  ['deleteOptions']() {
    this.options.delete();
  }

  //=========================================================
  // Video API
  //=========================================================

  ['setVideoOutput'](canvas) {
    this.video.setOutput(canvas);
  }

  ['getVideoOutput']() {
    return this.video.getOutput();
  }

  ['setVideoRenderer'](renderer) {
    this.video.setRenderer(renderer);
  }

  ['getVideoRenderer']() {
    return this.video.getRenderer();
  }

  ['isVideoRendererSupported'](renderer) {
    return isRendererSupported(renderer);
  }

  ['setVideoPalette'](palette) {
    this.video.setPalette(palette);
  }

  ['getVideoPalette']() {
    return this.video.getPalette();
  }

  ['setVideoScale'](scale) {
    this.video.setScale(scale);
  }

  ['getVideoScale']() {
    return this.video.getScale();
  }

  ['getMaxVideoScale']() {
    return this.video.getMaxScale();
  }

  ['setVideoSmoothing'](smoothing) {
    this.video.setSmoothing(smoothing);
  }

  ['isVideoSmoothing']() {
    return this.video.isSmoothing();
  }

  ['setVideoDebug'](debug) {
    this.video.setDebug(debug);
  }

  ['isVideoDebug']() {
    return this.video.isDebug();
  }

  ['enterFullscreen']() {
    this.video.enterFullscreen();
  }

  ['exitFullscreen']() {
    this.video.exitFullscreen();
  }

  ['setFullscreenType'](type) {
    this.video.setFullscreenType(type);
  }

  ['getFullscreenType']() {
    return this.video.getFullscreenType();
  }

  //=========================================================
  // Audio API
  //=========================================================

  ['isAudioSupported']() {
    return this.audio.isSupported();
  }

  ['setAudioEnabled'](enabled) {
    this.audio.setEnabled(enabled);
  }

  ['isAudioEnabled']() {
    return this.audio.isEnabled();
  }

  ['setAudioVolume'](channel, volume) {
    this.audio.setVolume(channel, volume);
  }

  ['getAudioVolume'](channel) {
    return this.audio.getVolume(channel);
  }

  //=========================================================
  // Input API
  //=========================================================

  ['setInputDevice'](port, device) {
    this.devices.set(port, device);
  }

  ['getInputDevice'](port) {
    return this.devices.get(port);
  }

  ['mapInputs'](deviceInput, sourceInputs) {
    this.inputMapper.map(deviceInput, sourceInputs);
  }

  ['unmapInputs'](...inputs) {
    this.inputMapper.unmap(...inputs);
  }

  ['getMappedInputs'](input) {
    return this.inputMapper.getMatches(input);
  }

  ['recordInput'](callback) {
    this.sources.recordInput(callback);
  }

}

//=========================================================
// Static properties / methods
//=========================================================

CFxNES['version'] = 'unknown'; // Set through gulpfile
CFxNES['setLogLevel'] = log.setLevel;

//=========================================================
// AMD / CommonJS / global export
//=========================================================

/* eslint-env amd */
/* eslint-disable no-invalid-this */

if (typeof define === 'function' && define['amd']) {
  define('CFxNES', () => CFxNES);
} else if (typeof module !== 'undefined' && module['exports']) {
  module['exports'] = CFxNES;
} else {
  this['CFxNES'] = CFxNES;
}
