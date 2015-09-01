import { dataToString, stringToData, objectToString, stringToObject } from '../../core/utils/convert';

//=========================================================
// Browser storage
//=========================================================

export default class BrowserStorage {

  readConfiguration() {
    return new Promise(resolve => {
      var value = localStorage[makeKey('config')];
      if (value) {
        resolve(stringToObject(value));
      } else {
        resolve(null);
      }
    });
  }

  writeConfiguration(config) {
    return new Promise(resolve => {
      localStorage[makeKey('config')] = objectToString(config);
      resolve();
    });
  }

  readPRGRAM(key, buffer) {
    return new Promise(resolve => {
      var ram = localStorage[makeKey(key, 'PRGRAM')];
      if (ram) {
        resolve(stringToData(ram, buffer));
      } else {
        resolve(null);
      }
    });
  }

  writePRGRAM(key, ram) {
    return new Promise(resolve => {
      localStorage[makeKey(key, 'PRGRAM')] = dataToString(ram);
      resolve();
    });
  }

  readCHRRAM(key, buffer) {
    return new Promise(resolve => {
      var ram = localStorage[makeKey(key, 'CHRRAM')];
      if (ram) {
        resolve(stringToData(ram, buffer));
      } else {
        resolve(null);
      }
    });
  }

  writeCHRRAM(key, ram) {
    return new Promise(resolve => {
      localStorage[makeKey(key, 'CHRRAM')] = dataToString(ram);
      resolve();
    });
  }

}

function makeKey(...keys) {
  return ['CFxNES', ...keys].join('/');
}
