import { AbstractReader } from "./abstract-reader";

//=========================================================
// Reader of array buffers
//=========================================================

export class ArrayBufferReader extends AbstractReader {

    constructor(buffer) {
        super();
        this.array = new Uint8Array(buffer);
    }

    getData() {
        return this.array;
    }

    getLength() {
        return this.array.length;
    }

    peekOffset(offset, length) {
        return this.array.subarray(offset, offset + length);
    }

    onUnzip(result) {
        this.array = result.asUint8Array();
    }

}
