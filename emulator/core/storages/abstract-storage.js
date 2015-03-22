import { stringToData, dataToString, stringToObject, objectToString } from "../utils/convert";
import { logger } from "../utils/logger";

//=========================================================
// Base class of storages
//=========================================================

export class AbstractStorage {

    readString(key) {
        return this.read(key) || null;
    }

    writeString(key, value) {
        this.write(key, value);
    }

    readData(key, output) {
        var value = this.read(key);
        if (value != null) {
            return stringToData(value, output);
        } else {
            return null;
        }
    }

    writeData(key, value) {
        this.write(key, dataToString(value));
    }

    readObject(key) {
        var value = this.read(key);
        try {
            if (value != null) {
                return stringToObject(value);
            } else {
                return null;
            }
        } catch (error) {
            logger.error(`Unable to parse object from string: ${value}`);
            return null;
        }
    }

    writeObject(key, value) {
        this.write(key, objectToString(value));
    }

}
