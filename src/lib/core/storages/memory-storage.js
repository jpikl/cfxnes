import { AbstractStorage } from "./abstract-storage";

//=========================================================
// Memory storage
//=========================================================

export class MemoryStorage extends AbstractStorage {

    constructor() {
        super();
        this.data = {};
    }

    read(key) {
        return this.data[key];
    }

    write(key, value) {
        this.data[key] = value;
    }

}
