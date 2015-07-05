import { logger }       from "../../core/utils/logger";
import { readableSize } from "../../core/utils/format";

const FILE_SIZE_LIMIT = 10 * 1024 * 1024; // 10 MB
const UNKNOWN_ERROR = "Unknown error";

//=========================================================
// Cartridge manager
//=========================================================

export class CartridgeManager {

    constructor() {
        this.dependencies = ["nes", "cartridgeFactory", "executionManager", "persistenceManager"];
    }

    inject(nes, cartridgeFactory, executionManager, persistenceManager) {
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
        if (file.size > FILE_SIZE_LIMIT) {
            onError && onError(`Input file is too large (${readableSize(file.size)}).`);
            return;
        }
        var reader = new FileReader;
        reader.onload = event => {
            var data = event.target.result;
            var error = this.tryInsertCartridge(data);
            if (error) {
                onError && onError(error);
            } else {
                onLoad && onLoad();
            }
        }
        reader.onerror = event => {
            onError && onError(event.target.error || UNKNOWN_ERROR);
        }
        try {
            reader.readAsArrayBuffer(file);
        } catch (error) {
            onError && onError(error && error.message || UNKNOWN_ERROR);
        }
    }

    downloadCartridge(url, onLoad, onError) {
        logger.info(`Downloading cartridge from '${url}'`);
        var request = new XMLHttpRequest;
        request.open("GET", url, true);
        request.responseType = "arraybuffer";
        request.onload = () => {
            var error;
            if (request.status === 200) {
                error = this.tryInsertCartridge(request.response);
            } else {
                error = `Unable to download '${url}' (server response: ${request.status}).`;
            }
            if (error) {
                onError && onError(error);
            } else {
                onLoad && onLoad();
            }
        }
        request.onerror = () => {
            onError && onError(`Unable to download '${url}'.`);
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
            return error.message || UNKNOWN_ERROR;
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
