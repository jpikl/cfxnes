var AbstractStorage = require("../../core/storages/abstract-storage");

//=========================================================
// Local storage
//=========================================================

class LocalStorage extends AbstractStorage {

    read(key) {
        return window.localStorage[this.getFullKey(key)];
    }

    write(key, value) {
        window.localStorage[this.getFullKey(key)] = value;
    }

    getFullKey(key) {
        return "CFxNES/" + key;
    }

}

module.exports = LocalStorage;
