import { AbstractReader } from "./abstract-reader";

//=========================================================
// Reader of local files
//=========================================================

export class LocalFileReader extends AbstractReader {

    constructor(path) {
        super();
        this.data = require("fs").readFileSync(path);
    }

    getLength() {
        return this.data.length;
    }

    peekOffset(offset, length) {
        return this.data.slice(offset, offset + length);
    }

}
