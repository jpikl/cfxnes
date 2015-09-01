import { copyArray } from '../utils/arrays';
import { copyObject } from '../utils/objects';

//=========================================================
// Memory storage
//=========================================================

export default class MemoryStorage {

  constructor() {
    this.config = null;
    this.prgRAMs = {};
    this.chrRAMs = {};
  }

  readConfiguration() {
    return new Promise(resolve => {
      resolve(copyObject(this.config));
    });
  }

  writeConfiguration(config) {
    return new Promise(resolve => {
      this.config = copyObject(config);
      resolve();
    });
  }

  readPRGRAM(key, buffer) {
    return new Promise(resolve => {
      var ram = this.prgRAMs[key];
      if (ram) {
        resolve(copyArray(ram, buffer));
      } else {
        resolve(null);
      }
    });
  }

  writePRGRAM(key, ram) {
    return new Promise(resolve => {
      this.prgRAMs[key] = copyArray(ram);
      resolve();
    });
  }

  readCHRRAM(key, buffer) {
    return new Promise(resolve => {
      var ram = this.chrRAMs[key];
      if (ram) {
        resolve(copyArray(ram, buffer));
      } else {
        resolve(null);
      }
    });
  }

  writeCHRRAM(key, ram) {
    return new Promise(resolve => {
      this.chrRAMs[key] = copyArray(ram);
      resolve();
    });
  }

}
