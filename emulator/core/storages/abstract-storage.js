var convert = require("../utils/convert");
var logger  = require("../utils/logger").get();

//=========================================================
// Base class of storages
//=========================================================

class AbstractStorage {

    readString(key) {
        return this.read(key) || null;
    }

    writeString(key, value) {
        this.write(key, value);
    }

    readData(key, output) {
        var value = this.read(key);
        if (value != null) {
            return convert.stringToData(value, output);
        } else {
            return null;
        }
    }

    writeData(key, value) {
        this.write(key, convert.dataToString(value));
    }

    readObject(key) {
        var value = this.read(key);
        try {
            if (value != null) {
                return convert.stringToObject(value);
            } else {
                return null;
            }
        } catch (error) {
            logger.error(`Unable to parse object from string: ${value}`);
            return null;
        }
    }

    writeObject(key, value) {
        this.write(key, convert.objectToString(value));
    }

}

module.exports = AbstractStorage;
