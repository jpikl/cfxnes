import { logger } from "../../core/utils/logger";

//=========================================================
// Persistence manager
//=========================================================

export class PersistenceManager {

    init(nes, storage, videoManager, audioManager, inputManager, executionManager) {
        this.nes = nes;
        this.storage = storage;
        this.videoManager = videoManager;
        this.audioManager = audioManager;
        this.inputManager = inputManager;
        this.executionManager = executionManager;
        this.initListeners();
        this.setDefaults();
    }

    initListeners() {
        window.addEventListener("beforeunload", this.saveAll.bind(this));
    }

    setDefaults() {
        logger.info("Using default persistence configuration");
        this.enablePeriodicSave();
    }

    //=========================================================
    // Periodical save
    //=========================================================

    enablePeriodicSave(period = 60) {
        this.disablePeriodicSave();
        logger.info("Enabling periodic save with period " + period + " s");
        this.periodicSaveId = setInterval(this.saveAll.bind(this), 1000 * period);
    }

    disablePeriodicSave() {
        if (this.isPeriodicSave()) {
            logger.info("Disabling periodic save");
            clearInterval(this.periodicSaveId);
            this.periodicSaveId = null;
        }
    }

    isPeriodicSave() {
        return this.periodicSaveId != null;
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
            this.videoManager.writeConfiguration(config["video"]);
            this.audioManager.writeConfiguration(config["audio"]);
            this.inputManager.writeConfiguration(config["input"]);
            this.executionManager.writeConfiguration(config["execution"]);
        }
    }

    saveConfiguration() {
        logger.info("Saving configuration");
        this.storage.writeObject("config", {
            "video":     this.videoManager.readConfiguration(),
            "audio":     this.audioManager.readConfiguration(),
            "input":     this.inputManager.readConfiguration(),
            "execution": this.executionManager.readConfiguration()
        });
    }

}

PersistenceManager["dependencies"] = [ "nes", "storage", "videoManager", "audioManager", "inputManager", "executionManager" ];
