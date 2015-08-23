import baseInjectorConfig   from "./config";
import { channels }         from "./managers/audio-manager";
import { ports }            from "./managers/input-manager";
import { Injector }         from "../core/utils/inject";
import { logger, LogLevel } from "../core/utils/logger";
import { copyProperties }   from "../core/utils/objects";

var logLevelAliases = {
    "off": LogLevel.OFF,
    "error": LogLevel.ERROR,
    "warn": LogLevel.WARN,
    "info": LogLevel.INFO,
    "all": LogLevel.INFO
}

//=========================================================
// CFxNES API
//=========================================================

export class CFxNES {

    constructor(config = {}) {
        this.dependencies = [
            "executionManager",
            "cartridgeManager",
            "videoManager",
            "audioManager",
            "inputManager",
            "persistenceManager"
        ];
        logger.setLevel(logLevelAliases[config["loggingLevel"]] || LogLevel.WARN);
        this.bootstrap(config);
        this.init(config);
    }

    bootstrap(config) {
        var injectorConfig = copyProperties(baseInjectorConfig);
        for (var name of ["hash", "jszip", "screenfull"]) {
            injectorConfig[name].value = config[name];
        }
        new Injector(injectorConfig).inject(this);
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
    }

    init(config) {
        this["writeConfiguration"](config);
        if (config["storage"]) this["setStorage"](config["storage"]);
        (config["loadOnStart"] ? this["loadConfiguration"]() : Promise.resolved()).then(() => {
            if (config["saveOnClose"]) this["setSaveOnClose"](true);
            if (config["savePeriod"]) this["setSavePeriod"](config["savePeriod"]);
        });
    }

    //=========================================================
    // Generic API
    //=========================================================

    ["setDefaults"]() {
        this.executionManager.setDefaults();
        this.videoManager.setDefaults();
        this.audioManager.setDefaults();
        this.inputManager.setDefaults();
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
        return this.cartridgeManager.loadCartridge(file, onLoad, onError);
    }

    ["downloadCartridge"](url, onLoad, onError) {
        return this.cartridgeManager.downloadCartridge(url, onLoad, onError);
    }

    ["insertCartridge"](arrayBuffer) {
        return this.cartridgeManager.insertCartridge(arrayBuffer);
    }

    ["removeCartridge"]() {
        return this.cartridgeManager.removeCartridge();
    }

    ["isCartridgeInserted"]() {
        return this.cartridgeManager.isCartridgeInserted();
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

    ["setStorage"](storage) {
        this.persistenceManager.setStorage(storage);
    }

    ["getStorage"]() {
        this.persistenceManager.getStorage();
    }

    ["setSaveOnClose"](enabled) {
        this.persistenceManager.setSaveOnClose(enabled);
    }

    ["isSaveOnClose"]() {
        return this.persistenceManager.isSaveOnClose();
    }

    ["setSavePeriod"](period) {
        this.persistenceManager.setSavePeriod(period);
    }

    ["getSavePeriod"]() {
        return this.persistenceManager.getSavePeriod();
    }

    ["loadCartridgeData"]() {
        return this.persistenceManager.loadCartridgeData();
    }

    ["saveCartridgeData"]() {
        return this.persistenceManager.saveCartridgeData();
    }

    ["loadConfiguration"]() {
        return this.persistenceManager.loadConfiguration();
    }

    ["saveConfiguration"]() {
        return this.persistenceManager.saveConfiguration();
    }

    ["readConfiguration"]() {
        return this.persistenceManager.readConfiguration();
    }

    ["writeConfiguration"](config) {
        this.persistenceManager.writeConfiguration(config);
    }

}

//=========================================================
// AMD / CommonJS / global export
//=========================================================

if (typeof define === "function" && define["amd"]) {
    define("CFxNES", () => CFxNES);
}
else if (typeof module !== "undefined" && module["exports"]) {
    module["exports"] = CFxNES;
}
else {
    this["CFxNES"] = CFxNES;
}
