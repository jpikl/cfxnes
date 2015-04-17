import config             from "./config/base-config";
import { channels }       from "./managers/audio-manager";
import { ports }          from "./managers/input-manager";
import { Injector }       from "../core/utils/inject";
import { logger, Logger } from "../core/utils/logger";

logger.attach(Logger.console());

export function Emulator() {
  var injector = new Injector(config);
  injector.inject(this);
}

Emulator["dependencies"] = [ "executionManager", "cartridgeManager", "videoManager", "audioManager", "inputManager", "persistenceManager" ];

Emulator.prototype.init = function(executionManager, cartridgeManager, videoManager, audioManager, inputManager, persistenceManager) {
  this["audioChannels"] = channels;
  this["inputPorts"] = ports;
  this.executionManager = executionManager;
  this.cartridgeManager = cartridgeManager;
  this.videoManager = videoManager;
  this.audioManager = audioManager;
  this.inputManager = inputManager;
  this.persistenceManager = persistenceManager;
  return this.persistenceManager.loadConfiguration();
};

Emulator.prototype["setDefaults"] = function() {
  this.executionManager.setDefaults();
  this.videoManager.setDefaults();
  this.audioManager.setDefaults();
  this.inputManager.setDefaults();
  return this.persistenceManager.setDefaults();
};

Emulator.prototype["setExecutionDefaults"] = function() {
  return this.executionManager.setDefaults();
};

Emulator.prototype["step"] = function() {
  return this.executionManager.step();
};

Emulator.prototype["start"] = function() {
  return this.executionManager.start();
};

Emulator.prototype["stop"] = function() {
  return this.executionManager.stop();
};

Emulator.prototype["restart"] = function() {
  return this.executionManager.restart();
};

Emulator.prototype["isRunning"] = function() {
  return this.executionManager.isRunning();
};

Emulator.prototype["hardReset"] = function() {
  return this.executionManager.hardReset();
};

Emulator.prototype["softReset"] = function() {
  return this.executionManager.softReset();
};

Emulator.prototype["getFPS"] = function() {
  return this.executionManager.getFPS();
};

Emulator.prototype["setTVSystem"] = function(tvSystem) {
  return this.executionManager.setTVSystem(tvSystem);
};

Emulator.prototype["getTVSystem"] = function() {
  return this.executionManager.getTVSystem();
};

Emulator.prototype["setSpeed"] = function(speed) {
  return this.executionManager.setSpeed(speed);
};

Emulator.prototype["getSpeed"] = function() {
  return this.executionManager.getSpeed();
};

Emulator.prototype["loadCartridge"] = function(file, onLoad, onError) {
  return this.cartridgeManager.loadCartridge(file, onLoad, onError);
};

Emulator.prototype["downloadCartridge"] = function(url, onLoad, onError) {
  return this.cartridgeManager.downloadCartridge(url, onLoad, onError);
};

Emulator.prototype["insertCartridge"] = function(arrayBuffer) {
  return this.cartridgeManager.insertCartridge(arrayBuffer);
};

Emulator.prototype["isCartridgeInserted"] = function() {
  return this.cartridgeManager.isCartridgeInserted();
};

Emulator.prototype["removeCartridge"] = function() {
  return this.cartridgeManager.removeCartridge();
};

Emulator.prototype["setVideoDefaults"] = function() {
  return this.videoManager.setDefaults();
};

Emulator.prototype["setVideoOutput"] = function(canvas) {
  return this.videoManager.setCanvas(canvas);
};

Emulator.prototype["setVideoRenderer"] = function(renderer) {
  return this.videoManager.setRenderer(renderer);
};

Emulator.prototype["getVideoRenderer"] = function() {
  return this.videoManager.getRenderer();
};

Emulator.prototype["isVideoRendererSupported"] = function(renderer) {
  return this.videoManager.isRendererSupported(renderer);
};

Emulator.prototype["setVideoPalette"] = function(palette) {
  return this.videoManager.setPalette(palette);
};

Emulator.prototype["getVideoPalette"] = function() {
  return this.videoManager.getPalette();
};

Emulator.prototype["setVideoScale"] = function(scale) {
  return this.videoManager.setScale(scale);
};

Emulator.prototype["getVideoScale"] = function(scale) {
  return this.videoManager.getScale();
};

Emulator.prototype["getMaxVideoScale"] = function() {
  return this.videoManager.getMaxScale();
};

Emulator.prototype["setVideoSmoothing"] = function(smoothing) {
  return this.videoManager.setSmoothing(smoothing);
};

Emulator.prototype["isVideoSmoothing"] = function() {
  return this.videoManager.isSmoothing();
};

Emulator.prototype["setVideoDebugging"] = function(debugging) {
  return this.videoManager.setDebugging(debugging);
};

Emulator.prototype["isVideoDebugging"] = function() {
  return this.videoManager.isDebugging();
};

Emulator.prototype["enterFullScreen"] = function() {
  return this.videoManager.enterFullScreen();
};

Emulator.prototype["setAudioDefaults"] = function() {
  return this.audioManager.setDefaults();
};

Emulator.prototype["isAudioSupported"] = function() {
  return this.audioManager.isSupported();
};

Emulator.prototype["setAudioEnabled"] = function(enabled) {
  return this.audioManager.setEnabled(enabled);
};

Emulator.prototype["isAudioEnabled"] = function() {
  return this.audioManager.isEnabled();
};

Emulator.prototype["setAudioVolume"] = function(volume) {
  return this.audioManager.setVolume(volume);
};

Emulator.prototype["getAudioVolume"] = function() {
  return this.audioManager.getVolume();
};

Emulator.prototype["setAudioChannelEnabled"] = function(channel, enabled) {
  return this.audioManager.setChannelEnabled(channel, enabled);
};

Emulator.prototype["isAudioChannelEnabled"] = function(channel) {
  return this.audioManager.isChannelEnabled(channel);
};

Emulator.prototype["setInputDefaults"] = function() {
  return this.inputManager.setDefaults();
};

Emulator.prototype["setInputDevice"] = function(port, id) {
  return this.inputManager.connectTarget(port, id);
};

Emulator.prototype["getInputDevice"] = function(port) {
  return this.inputManager.getConnectedTarget(port);
};

Emulator.prototype["mapInput"] = function(targetPort, targetId, targetInput, sourceId, sourceInput) {
  return this.inputManager.mapInput(targetPort, targetId, targetInput, sourceId, sourceInput);
};

Emulator.prototype["unmapInput"] = function(targetPort, targetId, targetInput, sourceId, sourceInput) {
  return this.inputManager.unmapInput(targetPort, targetId, targetInput, sourceId, sourceInput);
};

Emulator.prototype["getMappedInputName"] = function(targetPort, targetId, targetInput) {
  return this.inputManager.getMappedInputName(targetPort, targetId, targetInput);
};

Emulator.prototype["recordInput"] = function(callback) {
  return this.inputManager.recordInput(callback);
};

Emulator.prototype["setPersistenceDefaults"] = function() {
  return this.persistenceManager.setDefaults();
};

Emulator.prototype["enablePeriodicSave"] = function(period) {
  return this.persistenceManager.enablePeriodicSave(period);
};

Emulator.prototype["disablePeriodicSave"] = function() {
  return this.persistenceManager.disablePeriodicSave();
};

Emulator.prototype["isPeriodicSave"] = function() {
  return this.persistenceManager.isPeriodicSave();
};

window["CFxNES"] = Emulator;
