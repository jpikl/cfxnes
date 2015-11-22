import makeTest from './storageTest';
import MemoryStorage from '../../src/storages/MemoryStorage';

makeTest({
  name: 'MemoryStorage',
  factory() {
    return new MemoryStorage;
  },
});
