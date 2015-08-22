import { logger } from "../../core/utils/logger";

//=========================================================
// Persistence manager
//=========================================================

export class PersistenceManager {

    constructor() {
        this.dependencies = ["nes", "storageFactory", "executionManager", "videoManager", "audioManager", "inputManager"];
        this.saveOnClose = false;
        this.saveAll = () => {
            this.saveCartridgeData();
            this.saveConfiguration();
        }
    }

    inject(nes,  storageFactory, executionManager, videoManager, audioManager, inputManager) {
        this.nes = nes;
        this.storageFactory = storageFactory;
        this.executionManager = executionManager;
        this.videoManager = videoManager;
        this.audioManager = audioManager;
        this.inputManager = inputManager;
        this.setStorage();
    }

    //=========================================================
    // Storage
    //=========================================================

    setStorage(implementor = "memory") {
        var id = this.storageFactory.getStorageId(implementor);
        logger.info(`Using '${id}' storage`);
        this.storage = this.storageFactory.createStorage(id, implementor);
        this.storageImplementor = implementor;
    }

    getStorage() {
        return this.storageImplementor;
    }


    //=========================================================
    // Save on close
    //=========================================================

    setSaveOnClose(enabled) {
        if (this.saveOnClose !== enabled) {
            this.saveOnClose = enabled;
            if (enabled) {
                logger.info("Enabling save on close");
                window.addEventListener("beforeunload", this.saveAll);
            } else {
                logger.info("Disabling save on close");
                window.removeEventListener("beforeunload", this.saveAll);
            }
        }
    }

    isSaveOnClose() {
        return this.saveOnClose;
    }

    //=========================================================
    // Periodic save
    //=========================================================

    setSavePeriod(period) {
        if (this.savePeriod !== period) {
            this.savePeriod = period;
            if (this.saveId) {
                logger.info("Disabling periodic save");
                clearInterval(this.saveId);
                this.saveId = null;
            }
            if (period) {
                logger.info("Enabling periodic save with period " + period + " s");
                this.saveId = setInterval(this.saveAll, 1000 * period);
            }
        }
    }

    getSavePeriod() {
        return this.savePeriod;
    }

    //=========================================================
    // Cartridge data
    //=========================================================


    loadCartridgeData() {
        if (this.nes.isCartridgeInserted()) {
            logger.info("Loading cartridge data");
            this.nes.loadCartridgeData(this.storage);
        }
    }

    saveCartridgeData() {
        if (this.nes.isCartridgeInserted()) {
            logger.info("Saving cartridge data");
            this.nes.saveCartridgeData(this.storage);
        }
    }

    //=========================================================
    // Configuration
    //=========================================================

    loadConfiguration() {
        logger.info("Loading configuration");
        var config = this.storage.readObject("config");
        if (config) {
            this.writeConfiguration(config);
        }
    }

    saveConfiguration() {
        logger.info("Saving configuration");
        this.storage.writeObject("config", this.readConfiguration());
    }

    readConfiguration() {
        var config = {};
        this.executionManager.readConfiguration(config);
        this.videoManager.readConfiguration(config);
        this.audioManager.readConfiguration(config);
        this.inputManager.readConfiguration(config);
        return config;
    }

    writeConfiguration(config) {
        this.executionManager.writeConfiguration(config);
        this.videoManager.writeConfiguration(config);
        this.audioManager.writeConfiguration(config);
        this.inputManager.writeConfiguration(config);
    }

}
