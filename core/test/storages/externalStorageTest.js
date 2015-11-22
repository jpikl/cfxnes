import makeTest from './storageTest';
import ExternalStorage from '../../src/storages/ExternalStorage';
import MemoryStorage from '../../src/storages/MemoryStorage';

makeTest({
  name: 'ExternalStorage',
  factory() {
    return {
      storage: new MemoryStorage,
      readConfiguration() {
        return this.storage.readConfiguration();
      },
      writeConfiguration(config) {
        return this.storage.writeConfiguration(config);
      },
      deleteConfiguration() {
        return this.storage.deleteConfiguration();
      },
      readRAM(type, key, buffer) {
        return this.storage.readRAM(type, key, buffer);
      },
      writeRAM(type, key, data) {
        return this.storage.writeRAM(type, key, data);
      },
      deleteRAM(type, key) {
        return this.storage.deleteRAM(type, key);
      },
    };
  },
});
