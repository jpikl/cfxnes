// jscs:disable disallowQuotedKeysInObjects

import { copyArray } from '../utils/arrays';
import { copyObject, getProperty, setProperty } from '../utils/objects';

//=========================================================
// Memory storage
//=========================================================

export default class MemoryStorage {

  constructor() {
    this.config = null;
    this.rams = {};
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

  deleteConfiguration() {
    return new Promise(resolve => {
      this.config = null;
      resolve();
    });
  }

  readRAM(id, type, buffer) {
    return new Promise(resolve => {
      var data = getProperty(this.rams, id, type);
      resolve(data ? copyArray(data, buffer) : null);
    });
  }

  writeRAM(id, type, data) {
    return new Promise(resolve => {
      setProperty(this.rams, id, type, data);
      resolve();
    });
  }

  deleteRAM(id) {
    return new Promise(resolve => {
      if (id != null) {
        setProperty(this.rams, id, undefined);
      } else {
        this.rams = {};
      }
      resolve();
    });
  }

}
