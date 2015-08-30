import AbstractReader from './AbstractReader';

//=========================================================
// Reader of local files
//=========================================================

export default class LocalFileReader extends AbstractReader {

  constructor(path) {
    super();
    this.buffer = require('fs').readFileSync(path);
  }

  getData() {
    return this.buffer;
  }

  getLength() {
    return this.buffer.length;
  }

  peekOffset(offset, length) {
    return this.buffer.slice(offset, offset + length);
  }

  onUnzip(result) {
    this.buffer = result.asNodeBuffer();
  }

}
