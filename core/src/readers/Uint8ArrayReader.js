import AbstractReader from './AbstractReader';

//=========================================================
// Uint8Array reader
//=========================================================

export default class Uint8ArrayReader extends AbstractReader {

  constructor(array) {
    super();
    this.array = array;
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
