//=========================================================
// External storage adapter
//=========================================================

export default class ExternalStorage {

  constructor(implementer) {
    this.implementer = implementer;
  }

  call(method, ...args) {
    if (this.implementer[method]) {
      return this.implementer[method](...args);
    } else {
      return Promise.resolve(null);
    }
  }

  readConfiguration() {
    return this.call('readConfiguration');
  }

  writeConfiguration(config) {
    return this.call('writeConfiguration', config);
  }

  readPRGRAM(id, prgRAM) {
    return this.call('readPRGRAM', id, prgRAM);
  }

  writePRGRAM(id, prgRAM) {
    return this.call('writePRGRAM', id, prgRAM);
  }

  readCHRRAM(id, chrRAM) {
    return this.call('readCHRRAM', id, chrRAM);
  }

  writeCHRRAM(id, chrRAM) {
    return this.call('writeCHRRAM', id, chrRAM);
  }

}
