import { AbstractStorage } from "../../core/storages/abstract-storage";

//=========================================================
// Local storage
//=========================================================

export class LocalStorage extends AbstractStorage {

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
