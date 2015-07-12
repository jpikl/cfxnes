const ZIP_SIGNATURE = [0x50, 0x4B, 0x03, 0x04];

//=========================================================
// Base class of readers
//=========================================================

export class AbstractReader {

    constructor() {
        this.reset();
    }

    reset() {
        this.offset = 0;
    }

    readByte() {
        return this.read(1)[0];
    }

    read(length) {
        var data = this.peek(length);
        this.skip(length);
        return data;
    }

    peek(length) {
        return this.peekOffset(this.offset, length);
    }

    skip(length) {
        this.offset += length;
        if (this.offset > this.getLength()) {
            throw new Error("Unexpected end of input.");
        }
    }

    contains(signature) {
        var data = this.peek(signature.length);
        if (data.length !== signature.length) {
            return false;
        }
        for (var i = 0; i < signature.length; i++) {
            if (data[i] !== signature[i]) {
                return false;
            }
        }
        return true;
    }

    check(signature) {
        if (!this.contains(signature)) {
            throw new Error("Invalid input signature.");
        }
        this.skip(signature.length);
    }

    tryUnzip(JSZip) {
        if (this.contains(ZIP_SIGNATURE)) {
            var files = JSZip(this.getData()).file(/^.*\.nes$/i);
            if (files.length > 0) {
                this.onUnzip(files[0]);
            }
        }
    }

}
