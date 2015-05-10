import { AbstractReader } from "./abstract-reader";

//=========================================================
// Reader of array buffers
//=========================================================

export class ArrayBufferReader extends AbstractReader {

    constructor(buffer) {
        super();
        this.array = new Uint8Array(buffer);
        this.tryUnzip(this.array, (result) => {
            this.array = result.asUint8Array();
        });
    }

    getLength() {
        return this.array.length;
    }

    peekOffset(offset, length) {
        return this.array.subarray(offset, offset + length);
    }

}
