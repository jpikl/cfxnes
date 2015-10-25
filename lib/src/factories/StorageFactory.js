// jscs:disable disallowQuotedKeysInObjects, requireCapitalizedConstructors

import BrowserStorage from '../storages/BrowserStorage';
import MemoryStorage from '../../../core/src/storages/MemoryStorage';
import ExternalStorage from '../../../core/src/storages/ExternalStorage';
import logger from '../../../core/src/utils/logger';

var storages = {
  'browser': BrowserStorage,
  'memory': MemoryStorage,
  'external': ExternalStorage,
};

//=========================================================
// Factory for storage creation
//=========================================================

export default class StorageFactory {

  getStorageId(implementer) {
    return typeof implementer === 'string' ? implementer : 'external';
  }

  createStorage(id, implementer) {
    var clazz = storages[id];
    if (!clazz) {
      throw new Error(`Unsupported storage "${id}"`);
    }
    logger.info(`Creating "${id}" storage`);
    return new clazz(implementer);
  }

}
