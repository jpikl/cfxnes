import { logger } from "../../core/utils/logger";

//=========================================================
// Cartridge manager
//=========================================================

export class CartridgeManager {

    init(nes, cartridgeFactory, executionManager, persistenceManager) {
        this.nes = nes;
        this.cartridgeFactory = cartridgeFactory;
        this.executionManager = executionManager;
        this.persistenceManager = persistenceManager;
    }

    //=========================================================
    // Cartridge loading
    //=========================================================

    loadCartridge(file, onLoad, onError) {
        logger.info("Loding cartridge from file");
        var self = this;
        var reader = new FileReader;
        reader.onload = (event) => {
            var data = event.target.result;
            var error = self.tryInsertCartridge(data);
            if (error) {
                onError && onError.call(self, error);
            } else {
                onLoad && onLoad.call(self);
            }
        }
        reader.onerror = (event) => {
            onError && onError.call(self, event.target.error);
        }
        reader.readAsArrayBuffer(file);
    }

    downloadCartridge(url, onLoad, onError) {
        logger.info(`Downloading cartridge from '${url}'`);
        var self = this;
        var request = new XMLHttpRequest;
        request.open("GET", url, true);
        request.responseType = "arraybuffer";
        request.onload = () => {
            var error;
            if (this.status === 200) {
                error = self.tryInsertCartridge(this.response);
            } else {
                error = `Unable to download '${url}' (server response: ${this.status}).`;
            }
            if (error) {
                onError && onError.call(self, error);
            } else {
                onLoad && onLoad.call(self);
            }
        }
        request.onerror = (error) => {
            onError && onError.call(self, error);
        }
        request.send();
    }

    //=========================================================
    // Cartridge processing
    //=========================================================

    tryInsertCartridge(arrayBuffer) {
        try {
            this.insertCartridge(arrayBuffer);
            return null;
        } catch (error) {
            logger.error(error);
            return error.message || "Unknown error";
        }
    }

    insertCartridge(arrayBuffer) {
        logger.info("Inserting cartridge");
        var cartridge = this.cartridgeFactory.fromArrayBuffer(arrayBuffer);
        this.persistenceManager.saveCartridgeData();
        this.nes.insertCartridge(cartridge);
        this.persistenceManager.loadCartridgeData();
        if (this.executionManager.isRunning()) {
            this.executionManager.restart();
        }
    }

    isCartridgeInserted() {
        return this.nes.isCartridgeInserted();
    }

    removeCartridge() {
        this.nes.removeCartridge();
    }

}

CartridgeManager["dependencies"] = [ "nes", "cartridgeFactory", "executionManager", "persistenceManager" ];
