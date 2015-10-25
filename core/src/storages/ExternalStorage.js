//=========================================================
// External storage adapter
//=========================================================

export default class ExternalStorage {

  constructor(implementer) {
    this.implementer = implementer;
  }

  readConfiguration() {
    return this.call('readConfiguration');
  }

  writeConfiguration(config) {
    return this.call('writeConfiguration', config);
  }

  deleteConfiguration() {
    return this.call('deleteConfiguration');
  }

  readRAM(id, type, buffer) {
    return this.call('readRAM', id, type, buffer);
  }

  writeRAM(id, type, data) {
    return this.call('writeRAM', id, type, data);
  }

  deleteRAM(id) {
    return this.call('deleteRAM', id);
  }

  call(method, ...args) {
    if (this.implementer[method]) {
      return this.implementer[method](...args);
    } else {
      return Promise.resolve(null);
    }
  }

}
