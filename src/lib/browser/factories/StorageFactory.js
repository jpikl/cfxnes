// jscs:disable disallowQuotedKeysInObjects, requireCapitalizedConstructors

import LocalStorage from '../storages/LocalStorage';
import ExternalStorage from '../../core/storages/ExternalStorage';
import MemoryStorage from '../../core/storages/MemoryStorage';
import logger from '../../core/utils/logger';

var storages = {
  'memory': MemoryStorage,
  'external': ExternalStorage,
  'local': LocalStorage,
};

//=========================================================
// Factory for storage creation
//=========================================================

export default class StorageFactory {

  getStorageId(implementor) {
    return typeof implementor === 'string' ? implementor : 'external';
  }

  createStorage(id, implementor) {
    var clazz = storages[id];
    if (!clazz) {
      throw new Error(`Unsupported storage "${id}"`);
    }
    logger.info(`Creating "${id}" storage`);
    return new clazz(implementor);
  }

}
