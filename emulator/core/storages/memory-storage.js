var AbstractStorage = require("./abstract-storage");

//=========================================================
// Memory storage
//=========================================================

class MemoryStorage extends AbstractStorage {

    constructor() {
        this.data = {};
    }

    read(key) {
        return this.data[key];
    }

    write(key, value) {
        this.data[key] = value;
    }

}

module.exports = MemoryStorage;
