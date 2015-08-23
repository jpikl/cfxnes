import { AbstractStorage } from "./abstract-storage";

//=========================================================
// External storage
//=========================================================

export class ExternalStorage extends AbstractStorage {

    constructor(callback) {
        super();
        this.callback = callback;
    }

    read(key) {
        return this.callback["read"](key);
    }

    write(key, value) {
        return this.callback["write"](key, value);
    }

}
