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
        return new Promise((resolve, reject) => {
            resolve(this.data[key]);
        });
    }

    write(key, value) {
        return new Promise((resolve, reject) => {
            this.data[key] = value;
            resolve();
        })
    }

}
