import { AbstractReader } from "./abstract-reader";

//=========================================================
// Reader of local files
//=========================================================

export class LocalFileReader extends AbstractReader {

    constructor(path) {
        super();
        this.buffer = require("fs").readFileSync(path);
        this.tryUnzip(this.buffer, result => {
            this.buffer = result.asNodeBuffer();
        });
    }

    getLength() {
        return this.buffer.length;
    }

    peekOffset(offset, length) {
        return this.buffer.slice(offset, offset + length);
    }

}
