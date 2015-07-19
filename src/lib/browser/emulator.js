import config             from "./config/base-config";
import { channels }       from "./managers/audio-manager";
import { ports }          from "./managers/input-manager";
import { Injector }       from "../core/utils/inject";
import { logger, Logger } from "../core/utils/logger";

logger.attach(Logger.toConsole());

//=========================================================
// Emulator API
//=========================================================

export class Emulator {

    constructor() {
        this.dependencies = [
            "executionManager",
            "cartridgeManager",
            "videoManager",
            "audioManager",
            "inputManager",
            "persistenceManager"
        ];
        this.injector = new Injector(config);
        this.injector.inject(this);
    }

    inject(executionManager, cartridgeManager, videoManager, audioManager, inputManager, persistenceManager) {
        this["audioChannels"] = channels;
        this["inputPorts"] = ports;
        this.executionManager = executionManager;
        this.cartridgeManager = cartridgeManager;
        this.videoManager = videoManager;
        this.audioManager = audioManager;
        this.inputManager = inputManager;
        this.persistenceManager = persistenceManager;
        this.persistenceManager.loadConfiguration();
    }

    //=========================================================
    // Generic API
    //=========================================================

    ["setDefaults"]() {
        this.executionManager.setDefaults();
        this.videoManager.setDefaults();
        this.audioManager.setDefaults();
        this.inputManager.setDefaults();
        this.persistenceManager.setDefaults();
    }

    ["putDependency"](name, dependency) {
        logger.info(`Putting dependency '${name}'.`);
        var proxy = this.injector.get(name);
        proxy.set && proxy.set(dependency);
    }

    //=========================================================
    // Execution API
    //=========================================================

    ["setExecutionDefaults"]() {
        this.executionManager.setDefaults();
    }

    ["step"]() {
        this.executionManager.step();
    }

    ["start"]() {
        this.executionManager.start();
    }

    ["stop"]() {
        this.executionManager.stop();
    }

    ["restart"]() {
        this.executionManager.restart();
    }

    ["isRunning"]() {
        return this.executionManager.isRunning();
    }

    ["hardReset"]() {
        this.executionManager.hardReset();
    }

    ["softReset"]() {
        this.executionManager.softReset();
    }

    ["getFPS"]() {
        return this.executionManager.getFPS();
    }

    ["setRegion"](region) {
        this.executionManager.setRegion(region);
    }

    ["getRegion"]() {
        return this.executionManager.getRegion();
    }

    ["setSpeed"](speed) {
        this.executionManager.setSpeed(speed);
    }

    ["getSpeed"]() {
        return this.executionManager.getSpeed();
    }

    //=========================================================
    // Cartridge API
    //=========================================================

    ["loadCartridge"](file, onLoad, onError) {
        this.cartridgeManager.loadCartridge(file, onLoad, onError);
    }

    ["downloadCartridge"](url, onLoad, onError) {
        this.cartridgeManager.downloadCartridge(url, onLoad, onError);
    }

    ["insertCartridge"](arrayBuffer) {
        this.cartridgeManager.insertCartridge(arrayBuffer);
    }

    ["isCartridgeInserted"]() {
        return this.cartridgeManager.isCartridgeInserted();
    }

    ["removeCartridge"]() {
        this.cartridgeManager.removeCartridge();
    }

    //=========================================================
    // Video API
    //=========================================================

    ["setVideoDefaults"]() {
        this.videoManager.setDefaults();
    }

    ["setVideoOutput"](canvas) {
        this.videoManager.setCanvas(canvas);
    }

    ["setVideoRenderer"](renderer) {
        this.videoManager.setRenderer(renderer);
    }

    ["getVideoRenderer"]() {
        return this.videoManager.getRenderer();
    }

    ["isVideoRendererSupported"](renderer) {
        return this.videoManager.isRendererSupported(renderer);
    }

    ["setVideoPalette"](palette) {
        this.videoManager.setPalette(palette);
    }

    ["getVideoPalette"]() {
        return this.videoManager.getPalette();
    }

    ["setVideoScale"](scale) {
        this.videoManager.setScale(scale);
    }

    ["getVideoScale"](scale) {
        return this.videoManager.getScale();
    }

    ["getMaxVideoScale"]() {
        return this.videoManager.getMaxScale();
    }

    ["setVideoSmoothing"](smoothing) {
        this.videoManager.setSmoothing(smoothing);
    }

    ["isVideoSmoothing"]() {
        return this.videoManager.isSmoothing();
    }

    ["setVideoDebugging"](debugging) {
        this.videoManager.setDebugging(debugging);
    }

    ["isVideoDebugging"]() {
        return this.videoManager.isDebugging();
    }

    ["enterFullScreen"]() {
        this.videoManager.enterFullScreen();
    }

    //=========================================================
    // Audio API
    //=========================================================

    ["setAudioDefaults"]() {
        this.audioManager.setDefaults();
    }

    ["isAudioSupported"]() {
        return this.audioManager.isSupported();
    }

    ["setAudioEnabled"](enabled) {
        this.audioManager.setEnabled(enabled);
    }

    ["isAudioEnabled"]() {
        return this.audioManager.isEnabled();
    }

    ["setAudioVolume"](volume) {
        this.audioManager.setVolume(volume);
    }

    ["getAudioVolume"]() {
        return this.audioManager.getVolume();
    }

    ["setAudioChannelEnabled"](channel, enabled) {
        this.audioManager.setChannelEnabled(channel, enabled);
    }

    ["isAudioChannelEnabled"](channel) {
        return this.audioManager.isChannelEnabled(channel);
    }

    //=========================================================
    // Input API
    //=========================================================

    ["setInputDefaults"]() {
        this.inputManager.setDefaults();
    }

    ["setInputDevice"](port, id) {
        this.inputManager.connectTarget(port, id);
    }

    ["getInputDevice"](port) {
        return this.inputManager.getConnectedTarget(port);
    }

    ["mapInput"](targetPort, targetId, targetInput, sourceId, sourceInput) {
        this.inputManager.mapInput(targetPort, targetId, targetInput, sourceId, sourceInput);
    }

    ["unmapInput"](targetPort, targetId, targetInput, sourceId, sourceInput) {
        this.inputManager.unmapInput(targetPort, targetId, targetInput, sourceId, sourceInput);
    }

    ["getMappedInputName"](targetPort, targetId, targetInput) {
        return this.inputManager.getMappedInputName(targetPort, targetId, targetInput);
    }

    ["recordInput"](callback) {
        this.inputManager.recordInput(callback);
    }

    //=========================================================
    // Persistence API
    //=========================================================

    ["setPersistenceDefaults"]() {
        this.persistenceManager.setDefaults();
    }

    ["setStorage"](storage) {
        this.persistenceManager.setStorage(storage);
    }

    ["getStorage"]() {
        this.persistenceManager.getStorage();
    }

    ["setSavePeriod"](period) {
        this.persistenceManager.setSavePeriod(period);
    }

    ["getSavePeriod"]() {
        return this.persistenceManager.getSavePeriod();
    }

    ["loadCartridgeData"]() {
        this.persistenceManager.loadCartridgeData();
    }

    ["saveCartridgeData"]() {
        this.persistenceManager.saveCartridgeData();
    }

    ["loadConfiguration"]() {
        this.persistenceManager.loadConfiguration();
    }

    ["saveConfiguration"]() {
        this.persistenceManager.saveConfiguration();
    }

    ["setConfiguration"](config) {
        this.persistenceManager.setConfiguration(config);
    }

    ["getConfiguration"]() {
        return this.persistenceManager.getConfiguration();
    }

}

//=========================================================
// AMD / CommonJS / global export
//=========================================================

if (typeof define === "function" && define["amd"]) {
    define("CFxNES", () => Emulator);
}
else if (typeof module !== "undefined" && module["exports"]) {
    module["exports"] = Emulator;
}
else {
    this["CFxNES"] = Emulator;
}
