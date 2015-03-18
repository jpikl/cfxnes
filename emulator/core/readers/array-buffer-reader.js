var AbstractReader = require("./abstract-reader");

//=========================================================
// Reader of array buffers
//=========================================================

class ArrayBufferReader extends AbstractReader {

    constructor(buffer) {
        super();
        this.view = new Uint8Array(buffer);
    }

    getLength() {
        return this.view.length;
    }

    getData(start, end) {
        return this.view.subarray(start, end);
    }

}

module.exports = ArrayBufferReader;
