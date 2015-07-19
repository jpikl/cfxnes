import { logger } from "../../core/utils/logger";

//=========================================================
// Persistence manager
//=========================================================

export class PersistenceManager {

    constructor() {
        this.dependencies = ["nes", "storageFactory", "videoManager", "audioManager", "inputManager", "executionManager"];
    }

    inject(nes,  storageFactory, videoManager, audioManager, inputManager, executionManager) {
        this.nes = nes;
        this.storageFactory = storageFactory;
        this.videoManager = videoManager;
        this.audioManager = audioManager;
        this.inputManager = inputManager;
        this.executionManager = executionManager;
        this.setStorage();
        this.setDefaults();
        this.initListeners();
    }

    setDefaults() {
        logger.info("Using default persistence configuration");
        this.setSavePeriod();
    }

    initListeners() {
        window.addEventListener("beforeunload", () => this.saveAll());
    }

    //=========================================================
    // Storage
    //=========================================================

    setStorage(implementor = "local") {
        var id = this.storageFactory.getStorageId(implementor);
        logger.info(`Using '${id}' storage`);
        this.storage = this.storageFactory.createStorage(id, implementor);
        this.storageImplementor = implementor;
    }

    getStorage() {
        return this.storageImplementor;
    }

    //=========================================================
    // Periodical save
    //=========================================================

    setSavePeriod(period = 60) {
        if (this.savePeriod !== period) {
            if (this.saveId) {
                logger.info("Disabling periodic save");
                clearInterval(this.saveId);
                this.saveId = null;
            }
            if (period) {
                logger.info("Enabling periodic save with period " + period + " s");
                this.saveId = setInterval(() => this.saveAll(), 1000 * period);
            }
        }
    }

    getSavePeriod() {
        return this.savePeriod;
    }

    saveAll() {
        this.saveCartridgeData();
        this.saveConfiguration();
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
        var config = this.storage.readObject("config");
        if (config) {
            logger.info("Loading configuration");
            this.setConfiguration(config);
        }
    }

    saveConfiguration() {
        logger.info("Saving configuration");
        this.storage.writeObject("config", this.getConfiguration());
    }

    //=========================================================
    // Configuration reading / writing
    //=========================================================

    setConfiguration(config) {
        this.videoManager.setConfiguration(config["video"]);
        this.audioManager.setConfiguration(config["audio"]);
        this.inputManager.setConfiguration(config["input"]);
        this.executionManager.setConfiguration(config["execution"]);
        this.setPersistenceConfiguration(config["persistence"]);
    }

    setPersistenceConfiguration(config) {
        if (config) {
            logger.info("Setting persistence manager configuration");
            this.setSavePeriod(config["savePeriod"]);
        }
    }

    getConfiguration() {
        return {
            "video":       this.videoManager.getConfiguration(),
            "audio":       this.audioManager.getConfiguration(),
            "input":       this.inputManager.getConfiguration(),
            "execution":   this.executionManager.getConfiguration(),
            "persistence": this.getPersistenceConfiguration()
        };
    }

    getPersistenceConfiguration() {
        logger.info("Getting persistence manager configuration");
        return {
            "savePeriod": this.getSavePeriod()
        };
    }

}
